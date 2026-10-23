import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { cleanPathList, collisionError, findScopeCollisions } from "@/lib/gitTaskScope";
import { cancelTaskJobs, enqueueSetupTask } from "@/lib/agentJobs";
import Project from "@/models/Project";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "master_admin"].includes(s.user?.role);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, taskId } = await params;
    const body = await req.json();
    const { title, description, assignedTo, assignedToName, status, priority, deadline, progress,
            baseBranch, targetBranch, assignedFiles, allowedGlobs, readOnlyFiles, fileLockMode, forceAssign } = body;

    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (assignedToName !== undefined) updates.assignedToName = assignedToName;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (deadline !== undefined) updates.deadline = new Date(deadline);
    if (progress !== undefined) updates.progress = Math.max(0, Math.min(100, progress));
    if (baseBranch !== undefined) updates.baseBranch = String(baseBranch).trim() || "main";
    if (targetBranch !== undefined) updates.targetBranch = String(targetBranch).trim();
    if (Array.isArray(assignedFiles)) updates.assignedFiles = cleanPathList(assignedFiles);
    if (Array.isArray(allowedGlobs)) updates.allowedGlobs = cleanPathList(allowedGlobs);
    if (Array.isArray(readOnlyFiles)) updates.readOnlyFiles = cleanPathList(readOnlyFiles);
    if (fileLockMode !== undefined) {
      if (!["advisory", "strict", "exclusive"].includes(fileLockMode))
        return NextResponse.json({ error: "fileLockMode must be advisory, strict or exclusive" }, { status: 400 });
      updates.fileLockMode = fileLockMode;
    }

    const scopeChanged = Array.isArray(assignedFiles) || Array.isArray(allowedGlobs) || assignedTo !== undefined || fileLockMode !== undefined;
    if (scopeChanged) {
      const current = (await Task.findOne({ _id: taskId, projectId: id }).lean()) as any;
      if (!current) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      const collisions = await findScopeCollisions({
        projectId: id,
        assignedTo: (updates.assignedTo as string) ?? current.assignedTo,
        assignedFiles: (updates.assignedFiles as string[]) ?? current.assignedFiles ?? [],
        allowedGlobs: (updates.allowedGlobs as string[]) ?? current.allowedGlobs ?? [],
        fileLockMode: (updates.fileLockMode as string) ?? current.fileLockMode,
        excludeTaskId: taskId,
      });
      if (collisions.some((c) => c.blocking) && !forceAssign) {
        return NextResponse.json(collisionError(collisions), { status: 409 });
      }
    }

    const updated = await Task.findOneAndUpdate(
      { _id: taskId, projectId: id },
      { $set: updates },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // New assignee or a different branch: the old setup job is stale, queue a fresh one.
    if (assignedTo !== undefined || targetBranch !== undefined || baseBranch !== undefined) {
      const p = (await Project.findById(id).select("title").lean()) as any;
      await enqueueSetupTask(updated, { projectTitle: p?.title || "", byId: (session?.user as any)?.id || "", byName: session?.user?.name || "" });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, taskId } = await params;
    await dbConnect();

    const deleted = await Task.findOneAndDelete({ _id: taskId, projectId: id });

    if (!deleted) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    await cancelTaskJobs(taskId, "task deleted");

    return NextResponse.json({ message: "Task deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
