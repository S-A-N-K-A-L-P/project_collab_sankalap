import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { validateSession } from "@/lib/auth";
import { canManageTasks, canUpdateProgress } from "@/lib/permissions";
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";
import { UserRole } from "@/lib/permissions";

async function logActivity(
  projectId: string,
  userId: string,
  userName: string,
  action: string,
  metadata: Record<string, unknown>
) {
  try {
    await ActivityLog.create({ projectId, userId, userName, action, metadata });
  } catch (_) {}
}

// PATCH /api/tasks/[taskId] — update status, progress (role-gated)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status, progress, role } = body as {
    status?: string;
    progress?: number;
    role: UserRole;
  };

  if (!canUpdateProgress(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const task = await Task.findById(taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Pixel members can only update their own tasks
  if (role === "pixel_member" && task.assignedTo !== user.id) {
    return NextResponse.json({ error: "Forbidden: not your task" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (progress !== undefined) updates.progress = progress;

  const updated = await Task.findByIdAndUpdate(taskId, updates, { new: true });

  await logActivity(
    task.projectId,
    user.id,
    user.email,
    `Updated task "${task.title}": ${Object.keys(updates).join(", ")}`,
    { taskId, updates }
  );

  return NextResponse.json({ task: updated });
}
