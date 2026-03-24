import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { validateSession } from "@/lib/auth";
import Task from "@/models/Task";

// GET /api/tasks/project/[projectId] — return all tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const tasks = await Task.find({ projectId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ tasks });
}
