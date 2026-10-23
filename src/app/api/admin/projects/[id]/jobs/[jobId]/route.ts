/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose documents are runtime-shaped at this API boundary. */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { isAdminRole } from "@/lib/roles";
import AgentJob from "@/models/AgentJob";
import Task from "@/models/Task";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import { enqueueSetupTask } from "@/lib/agentJobs";

/**
 * POST /api/admin/projects/{id}/jobs/{jobId}
 * Body: { action: "run-now" | "cancel" | "retry", runAt? }
 *   run-now → a queued job becomes due immediately (dependencies still apply)
 *   reschedule → set runAt (body.runAt)
 *   cancel  → queued/claimed/running job is cancelled (a claimed job's PC sees the cancel on its next report)
 *   retry   → failed/cancelled job is queued again (setup jobs are rebuilt from the task's current scope)
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string; jobId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminRole((session?.user as any)?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, jobId } = await params;
    const { action, runAt } = await req.json().catch(() => ({}));
    if (!["run-now", "reschedule", "cancel", "retry"].includes(action)) {
      return NextResponse.json({ error: "action must be run-now, reschedule, cancel or retry" }, { status: 400 });
    }

    await dbConnect();
    const job = await AgentJob.findOne({ _id: jobId, projectId: id });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const byId = (session?.user as any)?.id || "";
    const byName = session?.user?.name || session?.user?.email || "Admin";
    let result: any = job;

    if (action === "run-now" || action === "reschedule") {
      if (job.status !== "queued") return NextResponse.json({ error: `Only queued jobs can be rescheduled (job is ${job.status})` }, { status: 409 });
      const when = action === "run-now" ? new Date() : new Date(runAt);
      if (Number.isNaN(when.getTime())) return NextResponse.json({ error: "runAt is not a valid date" }, { status: 400 });
      job.runAt = when;
      job.note = action === "run-now" ? `released by ${byName}` : `rescheduled by ${byName}`;
      await job.save();
    } else if (action === "cancel") {
      if (!["queued", "claimed", "running"].includes(job.status)) {
        return NextResponse.json({ error: `Job is already ${job.status}` }, { status: 409 });
      }
      job.status = "cancelled";
      job.note = `cancelled by ${byName}`;
      job.finishedAt = new Date();
      await job.save();
    } else {
      if (!["failed", "cancelled", "done"].includes(job.status)) {
        return NextResponse.json({ error: `Job is still ${job.status}` }, { status: 409 });
      }
      if (job.type === "setup-task" && job.taskId) {
        const task = await Task.findOne({ _id: job.taskId, projectId: id });
        if (!task) return NextResponse.json({ error: "The job's task no longer exists" }, { status: 404 });
        const project = (await Project.findById(id).select("title").lean()) as any;
        result = await enqueueSetupTask(task, { projectTitle: project?.title || "", byId, byName });
        if (!result) return NextResponse.json({ error: "Task has no repo URL" }, { status: 400 });
      } else {
        result = await AgentJob.create({
          type: job.type, projectId: job.projectId, taskId: job.taskId,
          targetUserId: job.targetUserId, targetUserName: job.targetUserName, targetDeviceId: job.targetDeviceId,
          payload: job.payload, runAt: new Date(), dependsOnTaskIds: [], dependencyRule: job.dependencyRule,
          createdBy: byId, createdByName: byName,
        });
      }
    }

    await ActivityLog.create({
      projectId: id, userId: byId, userName: session?.user?.email || byName,
      action: `${action === "run-now" ? "Released" : action === "reschedule" ? "Rescheduled" : action === "cancel" ? "Cancelled" : "Retried"} agent job "${job.payload?.title || job.type}" for ${job.targetUserName || "member"}`,
      metadata: { jobId: String(job._id), newJobId: String(result?._id || ""), type: job.type, taskId: job.taskId },
    });

    return NextResponse.json({ ok: true, jobId: String(result?._id || job._id) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
