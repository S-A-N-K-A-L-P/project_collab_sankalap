import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { validateSession } from "@/lib/auth";
import { canManageTasks } from "@/lib/permissions";
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

// POST /api/tasks — create a task (admin / pixel_head only)
export async function POST(request: NextRequest) {
  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, title, description, assignedTo, assignedToName, priority, deadline, role } =
    body as {
      projectId: string;
      title: string;
      description?: string;
      assignedTo: string;
      assignedToName?: string;
      priority: string;
      deadline: string;
      role: UserRole;
    };

  if (!canManageTasks(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!projectId || !title || !assignedTo || !deadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();

  const task = await Task.create({
    projectId,
    title,
    description: description ?? "",
    assignedTo,
    assignedToName: assignedToName ?? "",
    priority: priority ?? "medium",
    deadline: new Date(deadline),
    status: "pending",
    progress: 0,
  });

  await logActivity(projectId, user.id, user.email, `Created task "${title}"`, {
    taskId: task._id.toString(),
    assignedTo,
  });

  return NextResponse.json({ task }, { status: 201 });
}
