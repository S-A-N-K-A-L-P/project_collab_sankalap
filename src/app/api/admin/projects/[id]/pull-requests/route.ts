/* eslint-disable @typescript-eslint/no-explicit-any -- GitHub payloads and Mongoose documents are runtime-shaped at this API boundary. */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { evaluateMergeGate, mergePullRequest, projectRepo, reviewPullRequest, syncPullRequest, verificationFreshness } from "@/lib/githubPullRequests";

/** Open PRs older than this are refreshed from GitHub when the board polls. */
const PR_STALE_MS = 60_000;
const PR_SYNC_PER_POLL = 6;

function isAdmin(session: any) {
  return session && ["sankalp_associate", "platform_moderator", "master_admin"].includes(session.user?.role);
}

async function syncOne(task: any, project: any) {
  if (!task.pullRequest?.number) return task;
  try {
    const ref = projectRepo(project, task.repoUrl);
    const snapshot = await syncPullRequest(project, ref, task.pullRequest.number);
    task.pullRequest = snapshot;
    task.pullRequestUrl = snapshot.url;
  } catch (error: any) {
    task.pullRequest.lastSyncError = String(error.message || error).slice(0, 300);
    task.pullRequest.lastSyncedAt = new Date();
  }
  await task.save();
  return task;
}

function view(task: any) {
  return {
    taskId: String(task._id), title: task.title, assignedToName: task.assignedToName,
    targetBranch: task.targetBranch, baseBranch: task.baseBranch,
    latestCommitSha: task.latestCommitSha || "",
    verificationGate: task.verificationGate, pullRequest: task.pullRequest,
    verification: verificationFreshness(task),
    mergeGate: evaluateMergeGate(task),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await dbConnect();
    const project = await Project.findById(id).select("title githubRepo githubInstallationId githubLastWebhookAt").lean() as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const configured = !!(project.githubInstallationId || process.env.GITHUB_TOKEN);

    let tasks = await Task.find({ projectId: id, "pullRequest.number": { $exists: true } }).sort({ "pullRequest.lastSyncedAt": -1 });
    if (configured) {
      if (new URL(request.url).searchParams.get("refresh") === "1") {
        tasks = await Promise.all(tasks.map((task) => syncOne(task, project)));
      } else {
        const cutoff = Date.now() - PR_STALE_MS;
        const stale = tasks
          .filter((t: any) => t.pullRequest?.state === "open" && (!t.pullRequest.lastSyncedAt || new Date(t.pullRequest.lastSyncedAt).getTime() < cutoff))
          .slice(0, PR_SYNC_PER_POLL);
        await Promise.all(stale.map((task) => syncOne(task, project)));
      }
    }

    return NextResponse.json({
      configured: configured || tasks.length > 0,
      githubMode: project.githubInstallationId ? "app" : process.env.GITHUB_TOKEN ? "token" : "platform",
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
    const { id } = await params;
    const { taskId, action, message } = await request.json();
    if (!["approve", "request_changes", "merge", "refresh"].includes(action)) {
      return NextResponse.json({ error: "Unknown pull request action" }, { status: 400 });
    }
    await dbConnect();
    const [project, task] = await Promise.all([
      Project.findById(id).select("title githubRepo githubInstallationId").lean() as any,
      Task.findOne({ _id: taskId, projectId: id }),
    ]);
    if (!project || !task) return NextResponse.json({ error: "Project or task not found" }, { status: 404 });
    if (!task.pullRequest?.number) return NextResponse.json({ error: "Task has no pull request" }, { status: 409 });

    let ref: any = null;
    try {
      ref = projectRepo(project, task.repoUrl);
      task.pullRequest = await syncPullRequest(project, ref, task.pullRequest.number);
    } catch {
      // External demo repo or unconfigured GitHub token — keep existing platform PR snapshot
    }

    if (action === "approve") {
      try {
        if (ref) await reviewPullRequest(project, ref, task.pullRequest.number, "approve", message || "Approved in Syncro PR Control.");
      } catch {
        // Fallback: record approval directly on the platform PR snapshot
      }
      task.pullRequest.reviewDecision = "approved";
      task.pullRequest.approvals = (Number(task.pullRequest.approvals) || 0) + 1;
      task.pullRequest.changesRequested = 0;
      task.pullRequest.lastSyncedAt = new Date();
    } else if (action === "request_changes") {
      try {
        if (ref) await reviewPullRequest(project, ref, task.pullRequest.number, "request_changes", message || "Changes requested in Syncro PR Control.");
      } catch {
        // Fallback: record requested changes directly on the platform PR snapshot
      }
      task.pullRequest.reviewDecision = "changes_requested";
      task.pullRequest.changesRequested = (Number(task.pullRequest.changesRequested) || 0) + 1;
      task.pullRequest.lastSyncedAt = new Date();
    } else if (action === "merge") {
      const gate = evaluateMergeGate(task);
      if (!gate.allowed) {
        await task.save();
        return NextResponse.json({ error: "Merge refused", reasons: gate.reasons }, { status: 409 });
      }
      let mergedRemotely = false;
      try {
        if (ref) {
          await mergePullRequest(project, ref, task.pullRequest.number, task.pullRequest.headSha);
          mergedRemotely = true;
        }
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (/405|not mergeable|protected|required/i.test(msg)) {
          return NextResponse.json({
            error: "GitHub refused the merge",
            reasons: [`GitHub branch protection blocked the merge: ${msg}`],
          }, { status: 409 });
        }
        // If GitHub isn't configured or external demo repo isn't writable by server token, complete merge in platform state
      }
      if (mergedRemotely && ref) {
        try {
          task.pullRequest = await syncPullRequest(project, ref, task.pullRequest.number);
        } catch {
          task.pullRequest.state = "merged";
        }
      } else {
        task.pullRequest.state = "merged";
        task.pullRequest.lastSyncedAt = new Date();
      }
    } else if (action === "refresh" && ref) {
      try {
        task.pullRequest = await syncPullRequest(project, ref, task.pullRequest.number);
      } catch {
        task.pullRequest.lastSyncedAt = new Date();
      }
    }

    task.pullRequestUrl = task.pullRequest.url;
    if (task.pullRequest.state === "merged" && task.status !== "completed") {
      task.status = "completed";
      task.progress = 100;
    }
    task.markModified("pullRequest");
    await task.save();
    if (action !== "refresh") {
      await ActivityLog.create({
        projectId: id,
        userId: (session!.user as any).id || "",
        userName: session!.user?.email || session!.user?.name || "",
        action: `${action === "request_changes" ? "Requested changes on" : action === "approve" ? "Approved" : "Merged"} pull request #${task.pullRequest.number} for task "${task.title}"`,
        metadata: { taskId, pullRequestUrl: task.pullRequest.url },
      });
    }
    return NextResponse.json(view(task));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
