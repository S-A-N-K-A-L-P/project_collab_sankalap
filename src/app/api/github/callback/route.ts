/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";
import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import {
  getInstallationToken,
  GitHubAuthError,
  parseGithubRepo,
  verifyAppInstallation,
} from "@/lib/githubPullRequests";

const STATE_TTL_MS = 15 * 60 * 1000; // 15 minutes (matching STATE_TTL = timedelta(minutes=15) in zero-ops-autosre)

function backToDashboard(origin: string, projectId: string | null, params: Record<string, string>) {
  const path = projectId ? `/admin/projects/${projectId}` : "/admin";
  const dest = new URL(path, origin);
  for (const [k, v] of Object.entries(params)) {
    dest.searchParams.set(k, v);
  }
  return NextResponse.redirect(dest.toString(), { status: 302 });
}

function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * GET /api/github/callback?installation_id=...&setup_action=...&state=...
 * Ported from github_callback() in shv-codes/zero-ops-autosre/backend/incidents/api/github_views.py:
 *   1. Validates the one-time `state` parameter in constant time and checks 15-min freshness
 *   2. Verifies `installation_id` belongs to OUR GitHub App (`verifyAppInstallation`)
 *   3. Mints an installation token and verifies it can reach the project's `githubRepo`
 *   4. Saves `githubInstallationId` + `githubAccount`, clears the single-use `state`, logs Audit/ActivityLog,
 *      and redirects back to the dashboard with `?github=connected`
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const rawInstallationId = url.searchParams.get("installation_id") || "";

  await dbConnect();

  const project = state
    ? await Project.findOne({ githubInstallState: state })
    : null;

  const projectId = project ? String(project._id) : null;
  const stateAt = project?.githubInstallStateAt ? new Date(project.githubInstallStateAt).getTime() : 0;
  const fresh = stateAt > 0 && Date.now() - stateAt < STATE_TTL_MS;

  if (!project || !state || !project.githubInstallState || !safeCompare(state, project.githubInstallState) || !fresh) {
    return backToDashboard(url.origin, projectId, {
      github: "error",
      reason: "invalid or expired connect request; click Connect GitHub again",
    });
  }

  const installationId = Number.parseInt(rawInstallationId, 10);
  if (!Number.isFinite(installationId) || installationId <= 0) {
    return backToDashboard(url.origin, projectId, {
      github: "error",
      reason: "GitHub did not send an installation id",
    });
  }

  try {
    const info = await verifyAppInstallation(installationId);
    const token = await getInstallationToken({ ...project.toObject(), githubInstallationId: String(installationId) }, null, true);

    const ref = parseGithubRepo(project.githubRepo);
    if (ref) {
      const repoRes = await fetch(`https://api.github.com/repos/${ref.owner}/${ref.repo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Syncro-AutoSRE-GitHub-App",
        },
        cache: "no-store",
      });
      if (!repoRes.ok) {
        const repoErr = await repoRes.json().catch(() => ({}));
        throw new Error(
          `the installation cannot access ${ref.owner}/${ref.repo}: ${repoErr?.message || `HTTP ${repoRes.status}`}`
        );
      }
    }

    project.githubInstallationId = String(info.installation_id);
    project.githubAccount = info.account;
    project.githubInstallState = "";
    project.githubInstallStateAt = null;
    await project.save();

    await ActivityLog.create({
      projectId: String(project._id),
      userId: String(project.lead || "system"),
      userName: info.account || "GitHub App",
      action: `Connected GitHub App installation #${info.installation_id} (${info.account})`,
      metadata: { github_app_connected: info },
    }).catch(() => {});

    return backToDashboard(url.origin, projectId, { github: "connected" });
  } catch (exc: any) {
    const reason = exc instanceof GitHubAuthError ? exc.message : String(exc?.message || exc);
    return backToDashboard(url.origin, projectId, {
      github: "error",
      reason,
    });
  }
}
