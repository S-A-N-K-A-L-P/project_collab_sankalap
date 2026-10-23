/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose task documents are intentionally schema-driven at this API boundary. */
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { annotatePullRequestScope } from "@/lib/gitTaskScope";
import {
  createOrSyncPullRequest,
  extractUserGithubToken,
  findOpenPullRequest,
  projectRepo,
  syncPullRequest,
} from "@/lib/githubPullRequests";

function gateBody(task: any) {
  const g = task.verificationGate || {};
  const row = (label: string, status: unknown) => `| ${label} | ${String(status || "not run").replace(/\|/g, "\\|")} |`;
  return [
    `## Syncro task`,
    `**${task.title}**`,
    task.description || "No additional task description.",
    "",
    `**Scope:** ${(task.assignedFiles || []).length} explicit file(s), ${(task.allowedGlobs || []).length} allowed glob(s)`,
    "",
    "## Verification gates",
    "| Gate | Result |",
    "|---|---|",
    row("Build", g.buildStatus),
    row("Tests", g.testsStatus),
    row("SAST", g.sastStatus),
    row("Contracts", g.contractsStatus),
    "",
    `Verified commit: \`${task.latestCommitSha || "unknown"}\``,
    "",
    "_Created by Syncro Desktop._",
  ].join("\n");
}

function verificationPassed(task: any) {
  const g = task.verificationGate || {};
  const statuses = [g.buildStatus, g.testsStatus, g.sastStatus, g.contractsStatus].map((s) => String(s || "").toLowerCase());
  return (
    !statuses.some((s) => s.startsWith("failed")) &&
    [g.buildStatus, g.testsStatus].some((s) => String(s || "").toLowerCase().startsWith("passed"))
  );
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getMobileSession(request);
    const userToken = extractUserGithubToken(request);
    const { id } = await params;
    await dbConnect();

    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (String(task.assignedTo) !== session.id) {
      return NextResponse.json({ error: "Only the assigned developer can open this task's pull request." }, { status: 403 });
    }
    if (!verificationPassed(task)) {
      return NextResponse.json({ error: "Pull request refused: Syncro verification has not passed." }, { status: 409 });
    }
    if (!task.targetBranch || !task.baseBranch) {
      return NextResponse.json({ error: "Task branches are not configured." }, { status: 400 });
    }

    const project = (await Project.findById(task.projectId).select("githubRepo githubInstallationId title").lean()) as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const ref = projectRepo(project, task.repoUrl);

    if (task.pullRequest?.number) {
      const snap = await syncPullRequest(project, ref, task.pullRequest.number, userToken);
      task.pullRequest = snap;
      task.pullRequestUrl = snap.url;
      await annotatePullRequestScope(task);
      await task.save();
      return NextResponse.json({ pullRequest: snap, existing: true });
    }

    const existingPr = await findOpenPullRequest(project, ref, task.targetBranch, task.baseBranch, userToken);
    const existing = Boolean(existingPr);
    const snap = await createOrSyncPullRequest(project, ref, {
      headBranch: task.targetBranch,
      baseBranch: task.baseBranch,
      title: `[${project.title || "Syncro"}] ${task.title}`,
      body: gateBody(task),
      userToken,
    });

    task.pullRequest = snap;
    task.pullRequestUrl = snap.url;
    await annotatePullRequestScope(task);
    await task.save();

    await ActivityLog.create({
      projectId: task.projectId,
      userId: session.id,
      userName: session.email || session.name || "",
      action: `Opened pull request #${snap.number} for task "${task.title}"`,
      metadata: {
        taskId: String(task._id),
        pullRequestUrl: snap.url,
        targetBranch: task.targetBranch,
        baseBranch: task.baseBranch,
      },
    });

    return NextResponse.json({ pullRequest: snap, existing }, { status: existing ? 200 : 201 });
  } catch (error: any) {
    if (error.message?.includes("Missing Authorization") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Could not create pull request" }, { status: 500 });
  }
}
