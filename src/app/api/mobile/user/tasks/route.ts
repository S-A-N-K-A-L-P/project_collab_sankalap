export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";

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
        .select("_id projectId title assignedTo assignedToName assignedFiles fileLockMode targetBranch")
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
      const files: string[] = Array.isArray(st.assignedFiles) ? st.assignedFiles : [];
      for (const fp of files) {
        list.push({
          filePath: fp,
          taskId: st._id.toString(),
          taskTitle: st.title || "",
          lockedByUserId: st.assignedTo || "",
          lockedByName: st.assignedToName || st.assignedTo || "Teammate",
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
        targetBranch: t.targetBranch || `task/${idStr.slice(-6)}`,
        status: t.status || "pending",
        progress: t.progress ?? 0,
        priority: t.priority || "medium",
        deadline: t.deadline,
        assignedTo: t.assignedTo || session.id,
        assignedToName: t.assignedToName || session.name || "",
        assignedBy: t.assignedBy || "",
        assignedByName: t.assignedByName || "Project Lead",
        assignedFiles: Array.isArray(t.assignedFiles) ? t.assignedFiles : [],
        allowedGlobs: Array.isArray(t.allowedGlobs) ? t.allowedGlobs : [],
        readOnlyFiles: Array.isArray(t.readOnlyFiles) ? t.readOnlyFiles : [],
        fileLockMode: t.fileLockMode || "strict",
        latestCommitSha: t.latestCommitSha || "",
        commitCount: t.commitCount ?? 0,
        pullRequestUrl: t.pullRequestUrl || "",
        verificationGate: t.verificationGate || {
          buildPassed: false,
          testsPassed: false,
          sastPassed: false,
          contractsPassed: false,
        },
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
