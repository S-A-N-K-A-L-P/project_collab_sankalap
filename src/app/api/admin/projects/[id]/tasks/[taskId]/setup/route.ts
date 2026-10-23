import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { isAdminRole } from "@/lib/roles";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { enqueueSetupTask } from "@/lib/agentJobs";

// POST /api/admin/projects/{id}/tasks/{taskId}/setup — (re)send the "set up workspace" job to the assignee's PCs.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminRole((session?.user as any)?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, taskId } = await params;
    await dbConnect();
    const task = await Task.findOne({ _id: taskId, projectId: id });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.status === "completed") return NextResponse.json({ error: "Task is already completed" }, { status: 400 });

    const project = (await Project.findById(id).select("title").lean()) as any;
    const job = await enqueueSetupTask(task, {
      projectTitle: project?.title || "",
      byId: (session?.user as any)?.id || "",
      byName: session?.user?.name || session?.user?.email || "",
    });
    if (!job) return NextResponse.json({ error: "Task has no repo URL — link a GitHub repo to the project or task first." }, { status: 400 });

    return NextResponse.json({ jobId: String(job._id) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
