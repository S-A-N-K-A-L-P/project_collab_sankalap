/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { describeGithubApp, GitHubAuthError } from "@/lib/githubPullRequests";

/**
 * GET /api/github/connect?projectId=...
 * Ported from github_connect() in shv-codes/zero-ops-autosre/backend/incidents/api/github_views.py:
 *   1. Verifies GITHUB_APP_ID + private key and gets the App's install_url
 *   2. Generates a 24-byte one-time `state` value (15-min TTL) to block forged callbacks
 *   3. Redirects (302) the browser to `https://github.com/apps/<slug>/installations/new?state=<state>`
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminRole((session?.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId") || "";

    await dbConnect();
    const project = projectId
      ? await Project.findById(projectId)
      : await Project.findOne({ githubRepo: { $exists: true, $ne: "" } }).sort({ updatedAt: -1 });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let installUrl = "";
    try {
      const appDesc = await describeGithubApp();
      installUrl = appDesc.install_url;
    } catch (exc: any) {
      const message = exc instanceof GitHubAuthError ? exc.message : String(exc?.message || exc);
      const back = new URL(`/admin/projects/${project._id}`, url.origin);
      back.searchParams.set("github", "error");
      back.searchParams.set("reason", message);
      return NextResponse.redirect(back.toString(), { status: 302 });
    }

    const state = crypto.randomBytes(24).toString("base64url");
    project.githubInstallState = state;
    project.githubInstallStateAt = new Date();
    await project.save();

    const redirectUrl = `${installUrl}?${new URLSearchParams({ state }).toString()}`;
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to start GitHub App connect flow" },
      { status: 500 }
    );
  }
}
