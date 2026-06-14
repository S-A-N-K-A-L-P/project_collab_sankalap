import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import Task from "@/models/Task";

function isAdmin(session: any) {
  return session && ["sankalp_associate", "master_admin"].includes(session.user?.role);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Projects where the user is a member or lead
    const projects = await Project.find({
      $or: [{ lead: id }, { members: id }],
    })
      .select("_id title status progress lead members")
      .populate("lead", "name avatar")
      .lean();

    // Tasks assigned to this user
    const tasks = await Task.find({ assignedTo: id })
      .sort({ deadline: 1 })
      .lean();

    // Build a project map for task enrichment
    const projectMap = new Map(
      projects.map((p: any) => [p._id.toString(), p.title])
    );

    const enrichedTasks = tasks.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
      projectTitle: projectMap.get(t.projectId) ?? `…${t.projectId.slice(-6)}`,
    }));

    // Aggregate task stats
    const taskStats = {
      total:      tasks.length,
      completed:  tasks.filter((t: any) => t.status === "completed").length,
      inProgress: tasks.filter((t: any) => t.status === "in-progress").length,
      delayed:    tasks.filter((t: any) => t.status === "delayed").length,
    };

    return NextResponse.json({
      user,
      projects,
      tasks: enrichedTasks,
      taskStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
