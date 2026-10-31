export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { lockPaths } from "@/lib/gitTaskScope";
import { evaluateMergeGate } from "@/lib/githubPullRequests";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);

    await dbConnect();

    const tasks = await Task.find({ assignedTo: session.id })
      .sort({ deadline: 1, createdAt: -1 })
      .lean() as any[];

    if (tasks.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    const projectIds = [...new Set(tasks.map((t) => t.projectId).filter(Boolean))];
    const [projects, siblingTasks] = await Promise.all([
      Project.find({ _id: { $in: projectIds } })
        .select("_id title githubRepo")
        .lean() as Promise<any[]>,
      Task.find({
        projectId: { $in: projectIds },
        status: { $in: ["pending", "in-progress", "delayed"] },
        assignedTo: { $ne: session.id },
      })
        .select("_id projectId title assignedTo assignedToName assignedFiles allowedGlobs fileLockMode targetBranch")
        .lean() as Promise<any[]>,
    ]);

    const projectMap = new Map(
      projects.map((p: any) => [
        p._id.toString(),
        { title: p.title ?? "", githubRepo: p.githubRepo ?? "" },
      ])
    );

    // Group teammate locked files by projectId
    const locksByProject = new Map<
      string,
      Array<{
        filePath: string;
        taskId: string;
        taskTitle: string;
        lockedByUserId: string;
        lockedByName: string;
        lockMode: string;
        targetBranch: string;
      }>
    >();

    for (const st of siblingTasks) {
      const pid = st.projectId;
      if (!locksByProject.has(pid)) locksByProject.set(pid, []);
      const list = locksByProject.get(pid)!;
      for (const fp of lockPaths(st)) {
        list.push({
          filePath: fp,
          taskId: st._id.toString(),
          taskTitle: st.title || "",
          lockedByUserId: st.assignedTo || "",
          lockedByName: st.assignedToName || st.assignedTo || "",
          lockMode: st.fileLockMode || "strict",
          targetBranch: st.targetBranch || "",
        });
      }
    }

    const enriched = tasks.map((t: any) => {
      const proj = projectMap.get(t.projectId) || { title: "", githubRepo: "" };
      const idStr = t._id.toString();
      return {
        _id: idStr,
        id: idStr,
        projectId: t.projectId || "",
        projectTitle: proj.title,
        title: t.title || "",
        description: t.description ?? "",
        scopeDescription: t.description ?? "",
        repoUrl: (t.repoUrl || proj.githubRepo || "").trim(),
        baseBranch: t.baseBranch || "main",
        targetBranch: t.targetBranch || "",
        status: t.status || "pending",
        progress: t.progress ?? 0,
        priority: t.priority || "medium",
        deadline: t.deadline,
        assignedTo: t.assignedTo || "",
        assignedToName: t.assignedToName || "",
        assignedBy: t.assignedBy || "",
        assignedByName: t.assignedByName || "",
        assignedFiles: Array.isArray(t.assignedFiles) ? t.assignedFiles : [],
        allowedGlobs: Array.isArray(t.allowedGlobs) ? t.allowedGlobs : [],
        readOnlyFiles: Array.isArray(t.readOnlyFiles) ? t.readOnlyFiles : [],
        fileLockMode: t.fileLockMode || "strict",
        latestCommitSha: t.latestCommitSha || "",
        commitCount: t.commitCount ?? 0,
        pullRequestUrl: t.pullRequestUrl || "",
        // PR as last synced from GitHub, plus the same merge-gate verdict the admin sees.
        pullRequest: t.pullRequest?.number
          ? {
              number: t.pullRequest.number,
              url: t.pullRequest.url || "",
              state: t.pullRequest.state || "",
              draft: !!t.pullRequest.draft,
              headSha: t.pullRequest.headSha || "",
              reviewDecision: t.pullRequest.reviewDecision || "",
              approvals: t.pullRequest.approvals || 0,
              changesRequested: t.pullRequest.changesRequested || 0,
              lastSyncedAt: t.pullRequest.lastSyncedAt || null,
              lastSyncError: t.pullRequest.lastSyncError || "",
            }
          : null,
        mergeGate: t.pullRequest?.number ? evaluateMergeGate(t) : null,
        // Sent as stored; a task that was never verified has no gate (shown as "Not verified").
        verificationGate: t.verificationGate || null,
        teammateLockedFiles: locksByProject.get(t.projectId) || [],
      };
    });

    return NextResponse.json({ tasks: enriched });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[USER_TASKS_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
