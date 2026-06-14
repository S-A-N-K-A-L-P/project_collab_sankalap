import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  await dbConnect();

  // Fetch all tasks assigned to this user
  const tasks = await Task.find({ assignedTo: userId })
    .sort({ deadline: 1, createdAt: -1 })
    .lean();

  if (tasks.length === 0) {
    return NextResponse.json({ tasks: [] });
  }

  // Get unique project IDs and fetch project titles
  const projectIds = [...new Set(tasks.map((t) => t.projectId))];
  const projects = await Project.find({ _id: { $in: projectIds } })
    .select("_id title status")
    .lean();

  const projectMap = new Map(
    projects.map((p: any) => [p._id.toString(), { title: p.title, status: p.status }])
  );

  // Merge project info into tasks
  const enriched = tasks.map((t: any) => ({
    ...t,
    _id: t._id.toString(),
    projectId: t.projectId,
    projectTitle: projectMap.get(t.projectId)?.title ?? "Unknown Project",
    projectStatus: projectMap.get(t.projectId)?.status ?? "unknown",
  }));

  return NextResponse.json({ tasks: enriched });
}
