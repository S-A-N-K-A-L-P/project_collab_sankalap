import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import { enqueueSetupTask } from "@/lib/agentJobs";
import { cleanPathList, collisionError, defaultTargetBranch, findScopeCollisions } from "@/lib/gitTaskScope";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "platform_moderator", "master_admin"].includes(s.user?.role);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const tasks = await Task.find({ projectId: id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const {
      title,
      description,
      assignedTo,
      assignedToName,
      priority,
      deadline,
      repoUrl,
      baseBranch,
      targetBranch,
      assignedFiles,
      allowedGlobs,
      readOnlyFiles,
      fileLockMode,
      forceAssign,
      dryRun,
    } = await req.json();

    // dryRun: only report collisions for the proposed scope (used by the form before saving).
    if (dryRun) {
      await dbConnect();
      const collisions = assignedTo
        ? await findScopeCollisions({
            projectId: id,
            assignedTo,
            assignedFiles: cleanPathList(assignedFiles),
            allowedGlobs: cleanPathList(allowedGlobs),
            fileLockMode,
          })
        : [];
      return NextResponse.json({ collisions });
    }

    if (!title || !assignedTo || !deadline) {
      return NextResponse.json(
        { error: "title, assignedTo, and deadline are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const project = await Project.findById(id).select("githubRepo title").lean() as any;

    const cleanAssignedFiles = cleanPathList(assignedFiles);
    const cleanAllowedGlobs = cleanPathList(allowedGlobs);
    const cleanReadOnlyFiles = cleanPathList(readOnlyFiles);

    const collisions = await findScopeCollisions({
      projectId: id,
      assignedTo,
      assignedFiles: cleanAssignedFiles,
      allowedGlobs: cleanAllowedGlobs,
      fileLockMode,
    });
    if (collisions.some((c) => c.blocking) && !forceAssign) {
      return NextResponse.json(collisionError(collisions), { status: 409 });
    }

    const task = await Task.create({
      projectId: id,
      title,
      description: description || "",
      assignedTo,
      assignedToName: assignedToName || "",
      priority: priority || "medium",
      deadline: new Date(deadline),
      status: "pending",
      progress: 0,
      repoUrl: (repoUrl || project?.githubRepo || "").trim(),
      baseBranch: baseBranch || "main",
      targetBranch: (targetBranch || "").trim() || defaultTargetBranch(assignedToName || assignedTo, title),
      assignedFiles: cleanAssignedFiles,
      allowedGlobs: cleanAllowedGlobs,
      readOnlyFiles: cleanReadOnlyFiles,
      fileLockMode: fileLockMode || "strict",
      assignedBy: (session?.user as any)?.id || "",
      assignedByName: session?.user?.name || session?.user?.email || "Admin",
    });

    await ActivityLog.create({
      projectId: id,
      userId: (session?.user as any)?.id || "",
      userName: session?.user?.email || session?.user?.name || "",
      action: `Assigned Git task "${title}" (${cleanAssignedFiles.length} files on ${task.targetBranch}) to ${assignedToName || assignedTo}` +
        (collisions.length ? ` — ${collisions.length} lock warning(s)${forceAssign ? ", forced" : ""}` : ""),
      metadata: { taskId: task._id.toString(), assignedTo, assignedFiles: cleanAssignedFiles, targetBranch: task.targetBranch, forced: !!forceAssign },
    });

    // Tell the assignee's Syncro Desktop to clone the repo and check out the task branch.
    const setupJob = await enqueueSetupTask(task, {
      projectTitle: project?.title || "",
      byId: (session?.user as any)?.id || "",
      byName: session?.user?.name || session?.user?.email || "",
    });

    return NextResponse.json({ task, warnings: collisions, setupJobId: setupJob ? String(setupJob._id) : null }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
