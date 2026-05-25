import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

function isAdmin(s: any) {
  return s && ["admin", "pixel_head"].includes(s.user?.role);
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
    const { title, description, assignedTo, assignedToName, priority, deadline } = await req.json();

    if (!title || !assignedTo || !deadline) {
      return NextResponse.json(
        { error: "title, assignedTo, and deadline are required" },
        { status: 400 }
      );
    }

    await dbConnect();

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
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
