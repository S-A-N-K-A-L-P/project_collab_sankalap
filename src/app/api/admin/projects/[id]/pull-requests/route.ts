/* eslint-disable @typescript-eslint/no-explicit-any -- GitHub payloads and Mongoose documents are runtime-shaped at this API boundary. */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { annotatePullRequestScope } from "@/lib/gitTaskScope";
import {
  applyGithubTaskState,
  evaluateMergeGate,
  extractUserGithubToken,
  forgetMissingPullRequest,
  listRepoPullRequests,
  mergePullRequest,
  projectRepo,
  reviewPullRequest,
  syncPullRequest,
  verificationFreshness,
} from "@/lib/githubPullRequests";

/** Open PRs older than this are refreshed from GitHub when the board polls. */
const PR_STALE_MS = 60_000;
const PR_SYNC_PER_POLL = 6;

function isAdmin(session: any) {
  return session && ["sankalp_associate", "platform_moderator", "master_admin"].includes(session.user?.role);
}

async function syncOne(task: any, project: any, userToken?: string | null) {
  if (!task.pullRequest?.number) return task;
  try {
    const ref = projectRepo(project, task.repoUrl);
    const snapshot = await syncPullRequest(project, ref, task.pullRequest.number, userToken);
    task.pullRequest = snapshot;
    task.pullRequestUrl = snapshot.url;
    await annotatePullRequestScope(task);
    applyGithubTaskState(task);
  } catch (error: any) {
    const msg = String(error.message || error);
    if (/404|not found/i.test(msg)) {
      forgetMissingPullRequest(task);
    } else {
      task.pullRequest.lastSyncError = msg.slice(0, 300);
      task.pullRequest.lastSyncedAt = new Date();
    }
  }
  await task.save();
  return task;
}

async function discoverRepoPullRequests(projectId: string, project: any, userToken?: string | null) {
  if (!project.githubRepo) return;
  try {
    const ref = projectRepo(project);
    const ghPulls = await listRepoPullRequests(project, ref, userToken);
    if (!Array.isArray(ghPulls) || ghPulls.length === 0) return;

    const allTasks = await Task.find({ projectId });
    for (const pr of ghPulls) {
      const headRef = String(pr.head?.ref || "").trim();
      if (!headRef) continue;
      const match = allTasks.find(
        (t: any) =>
          t.pullRequest?.number === pr.number ||
          (t.targetBranch && String(t.targetBranch).toLowerCase() === headRef.toLowerCase())
      );
      if (match && (!match.pullRequest?.number || match.pullRequest.number === pr.number)) {
        match.pullRequest = await syncPullRequest(project, ref, pr.number, userToken);
        match.pullRequestUrl = match.pullRequest.url;
        await annotatePullRequestScope(match);
        applyGithubTaskState(match);
        await match.save();
      }
    }
  } catch {
    // Rate limit or offline; existing synced tasks will still render.
  }
}

function view(task: any) {
  return {
    taskId: String(task._id),
    title: task.title,
    assignedToName: task.assignedToName,
    targetBranch: task.targetBranch,
    baseBranch: task.baseBranch,
    latestCommitSha: task.latestCommitSha || "",
    verificationGate: task.verificationGate,
    pullRequest: task.pullRequest,
    verification: verificationFreshness(task),
    mergeGate: evaluateMergeGate(task),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userToken = extractUserGithubToken(request);
    const { id } = await params;
    await dbConnect();
    const project = (await Project.findById(id)
      .select("title githubRepo githubInstallationId githubLastWebhookAt")
      .lean()) as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const hasRepo = Boolean(project.githubRepo);
    const isRefresh = new URL(request.url).searchParams.get("refresh") === "1";

    if (hasRepo && isRefresh) {
      await discoverRepoPullRequests(id, project, userToken);
    }

    let tasks = await Task.find({ projectId: id, "pullRequest.number": { $exists: true } }).sort({
      "pullRequest.lastSyncedAt": -1,
    });

    if (hasRepo) {
      if (isRefresh) {
        tasks = await Promise.all(tasks.map((task) => syncOne(task, project, userToken)));
      } else {
        const cutoff = Date.now() - PR_STALE_MS;
        const stale = tasks
          .filter(
            (t: any) =>
              t.pullRequest?.state === "open" &&
              (!t.pullRequest.scopeCheck?.checked ||
                !t.pullRequest.lastSyncedAt ||
                new Date(t.pullRequest.lastSyncedAt).getTime() < cutoff)
          )
          .slice(0, PR_SYNC_PER_POLL);
        if (stale.length > 0) {
          await Promise.all(stale.map((task) => syncOne(task, project, userToken)));
        }
      }
      tasks = tasks.filter((t: any) => Boolean(t.pullRequest?.number));
    }

    return NextResponse.json({
      configured: hasRepo,
      githubMode: userToken
        ? "user-token"
        : project.githubInstallationId
          ? "app"
          : process.env.GITHUB_TOKEN
            ? "token"
            : hasRepo
              ? "public"
              : "none",
      githubRepo: project.githubRepo || "",
      githubInstallationId: project.githubInstallationId || "",
      githubLastWebhookAt: project.githubLastWebhookAt || null,
      pullRequests: tasks.map(view),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userToken = extractUserGithubToken(request);
    const { id } = await params;
    const { taskId, action, message } = await request.json();
    if (!["approve", "request_changes", "merge", "refresh", "reconcile"].includes(action)) {
      return NextResponse.json({ error: "Unknown pull request action" }, { status: 400 });
    }
    await dbConnect();
    const [project, task] = await Promise.all([
      Project.findById(id).select("title githubRepo githubInstallationId").lean() as any,
      Task.findOne({ _id: taskId, projectId: id }),
    ]);
    if (!project || !task) return NextResponse.json({ error: "Project or task not found" }, { status: 404 });
    if (!task.pullRequest?.number) return NextResponse.json({ error: "Task has no pull request" }, { status: 409 });
    const ref = projectRepo(project, task.repoUrl);

    try {
      task.pullRequest = await syncPullRequest(project, ref, task.pullRequest.number, userToken);
    } catch (error: any) {
      const msg = String(error?.message || error);
      if ((action === "reconcile" || action === "refresh") && /404|not found/i.test(msg)) {
        const note = forgetMissingPullRequest(task);
        await task.save();
        return NextResponse.json({ ...view(task), note });
      }
      throw error;
    }
    await annotatePullRequestScope(task);
    if (action === "reconcile" || action === "refresh") {
      const note = applyGithubTaskState(task);
      task.pullRequestUrl = task.pullRequest?.url || "";
      await task.save();
      if (action === "reconcile") {
        await ActivityLog.create({
          projectId: id,
          userId: (session!.user as any).id || "",
          userName: session!.user?.email || session!.user?.name || "",
          action: `Reconciled pull request #${task.pullRequest?.number || "?"} for task "${task.title}" with GitHub`,
          metadata: { taskId, note },
        });
      }
      return NextResponse.json({ ...view(task), note });
    }
    if (action === "approve" || action === "request_changes") {
      await reviewPullRequest(
        project,
        ref,
        task.pullRequest.number,
        action === "approve" ? "APPROVE" : "REQUEST_CHANGES",
        message || (action === "approve" ? "Approved in Syncro PR Control." : "Changes requested in Syncro PR Control."),
        userToken
      );
    } else if (action === "merge") {
      const gate = evaluateMergeGate(task);
      if (!gate.allowed) {
        await task.save();
        return NextResponse.json({ error: "Merge refused", reasons: gate.reasons }, { status: 409 });
      }
      try {
        await mergePullRequest(project, ref, task.pullRequest.number, {
          commitTitle: `${task.title} (#${task.pullRequest.number})`,
          sha: task.pullRequest.headSha,
          method: "squash",
          userToken,
        });
      } catch (e: any) {
        const msg = String(e?.message || e);
        return NextResponse.json(
          {
            error: "GitHub refused the merge",
            reasons: [
              /405|not mergeable|protected|required/i.test(msg)
                ? `GitHub branch protection blocked the merge: ${msg}`
                : msg,
            ],
          },
          { status: 409 }
        );
      }
    }

    task.pullRequest = await syncPullRequest(project, ref, task.pullRequest.number, userToken);
    await annotatePullRequestScope(task);
    task.pullRequestUrl = task.pullRequest.url;
    const note = applyGithubTaskState(task);
    await task.save();
    const verb = action === "request_changes"
      ? "Requested changes on"
      : action === "approve"
        ? "Approved"
        : task.pullRequest.state === "merged"
          ? "Merged"
          : "Asked GitHub to merge";
    await ActivityLog.create({
      projectId: id,
      userId: (session!.user as any).id || "",
      userName: session!.user?.email || session!.user?.name || "",
      action: `${verb} pull request #${task.pullRequest.number} for task "${task.title}"`,
      metadata: { taskId, pullRequestUrl: task.pullRequest.url, note },
    });
    return NextResponse.json({ ...view(task), note });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
