import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

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
    const { title, description, assignedTo, assignedToName, status, priority, deadline, progress } = body;

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

    const updated = await Task.findOneAndUpdate(
      { _id: taskId, projectId: id },
      { $set: updates },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });

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

    return NextResponse.json({ message: "Task deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
