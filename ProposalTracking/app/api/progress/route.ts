import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { validateSession } from "@/lib/auth";
import { canUpdateProgress } from "@/lib/permissions";
import ProgressUpdate from "@/models/ProgressUpdate";
import Task from "@/models/Task";
import { UserRole } from "@/lib/permissions";

// POST /api/progress — submit a progress update for a task
export async function POST(request: NextRequest) {
  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { taskId, progress, message, role } = body as {
    taskId: string;
    progress: number;
    message?: string;
    role: UserRole;
  };

  if (!canUpdateProgress(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!taskId || progress === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();

  const task = await Task.findById(taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (role === "pixel_member" && task.assignedTo !== user.id) {
    return NextResponse.json({ error: "Forbidden: not your task" }, { status: 403 });
  }

  const update = await ProgressUpdate.create({
    taskId,
    userId: user.id,
    progress,
    message: message ?? "",
  });

  // Sync progress on the task itself
  await Task.findByIdAndUpdate(taskId, {
    progress,
    status: progress >= 100 ? "completed" : task.status === "pending" ? "in-progress" : task.status,
  });

  return NextResponse.json({ update }, { status: 201 });
}
