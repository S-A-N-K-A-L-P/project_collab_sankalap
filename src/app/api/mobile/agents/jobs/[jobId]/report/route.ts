export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import AgentJob from "@/models/AgentJob";
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";
import { LEASE_MS } from "@/lib/agentJobs";

/**
 * POST /api/mobile/agents/jobs/{jobId}/report
 * Body: { deviceId, state: "running" | "done" | "failed", note?, result?, error? }
 * Only the device holding the job may report on it. "running" is a progress update and renews the lease.
 */
export async function POST(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const me = getMobileSession(req);
    const { jobId } = await params;
    const body = await req.json().catch(() => ({}));
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    const state = body.state;
    if (!deviceId || !["running", "done", "failed"].includes(state)) {
      return NextResponse.json({ error: "deviceId and state (running | done | failed) are required" }, { status: 400 });
    }

    await dbConnect();
    const job = await AgentJob.findOne({ _id: jobId, targetUserId: me.id });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.claimedBy !== deviceId || !["claimed", "running"].includes(job.status)) {
      return NextResponse.json({ error: `Job is not held by this device (status ${job.status})` }, { status: 409 });
    }

    const note = typeof body.note === "string" ? body.note.slice(0, 300) : "";
    if (state === "running") {
      job.status = "running";
      job.note = note;
      job.leaseUntil = new Date(Date.now() + LEASE_MS);
      await job.save();
      return NextResponse.json({ ok: true });
    }

    job.status = state;
    job.note = note;
    job.result = body.result && typeof body.result === "object" ? body.result : null;
    job.error = state === "failed" ? String(body.error || note || "failed").slice(0, 500) : "";
    job.finishedAt = new Date();
    await job.save();

    if (job.type === "setup-task" && job.taskId) {
      if (state === "done") {
        const task = await Task.findById(job.taskId);
        if (task && task.status === "pending") {
          task.status = "in-progress";
          if (!task.acceptedAt) task.acceptedAt = new Date();
          await task.save();
        }
      }
      await ActivityLog.create({
        projectId: job.projectId,
        userId: me.id,
        userName: me.email || me.name || "",
        action: state === "done"
          ? `Syncro agent set up task on ${job.result?.deviceName || "a PC"}: ${job.result?.branch || ""} @ ${String(job.result?.headSha || "").slice(0, 7)}`
          : `Syncro agent could not set up task: ${job.error}`,
        metadata: { jobId: String(job._id), taskId: job.taskId, deviceId, state },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (/Missing|jwt|token/i.test(err.message || "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
