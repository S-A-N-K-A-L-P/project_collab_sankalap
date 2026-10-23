export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import AgentDevice from "@/models/AgentDevice";
import AgentJob from "@/models/AgentJob";
import { jobForDevice, LEASE_MS, unmetDependencies } from "@/lib/agentJobs";

/**
 * GET /api/mobile/agents/jobs?deviceId=…&claim=1
 *   claim=1 → atomically claims the oldest job this device may run (queued, or held by a device whose
 *   lease ran out) and returns it, or { job: null }.
 *   without claim → lists the member's open jobs (read-only).
 */
export async function GET(req: Request) {
  try {
    const me = getMobileSession(req);
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId") || "";
    if (!deviceId) return NextResponse.json({ error: "deviceId is required" }, { status: 400 });

    await dbConnect();
    const device = await AgentDevice.findOne({ userId: me.id, deviceId }).lean();
    if (!device) return NextResponse.json({ error: "Device not registered", register: true }, { status: 404 });

    const mine = { targetUserId: me.id, $or: [{ targetDeviceId: "" }, { targetDeviceId: deviceId }] };

    if (searchParams.get("claim") !== "1") {
      const jobs = await AgentJob.find({ ...mine, status: { $in: ["queued", "claimed", "running"] } })
        .sort({ createdAt: 1 }).limit(50).lean();
      return NextResponse.json({ jobs: jobs.map(jobForDevice) });
    }

    const now = new Date();
    const claimable = {
      ...mine,
      $and: [
        { $or: [{ status: "queued" }, { status: { $in: ["claimed", "running"] }, leaseUntil: { $lt: now } }] },
        { $expr: { $lt: ["$attempts", "$maxAttempts"] } },
        // Scheduled jobs wait for runAt (older jobs have no runAt and are due now).
        { $or: [{ runAt: { $exists: false } }, { runAt: null }, { runAt: { $lte: now } }] },
      ],
    };

    // Dependencies live on other tasks, so check candidates in order and claim the first free one.
    type Candidate = { _id: unknown; dependsOnTaskIds?: string[]; dependencyRule?: string };
    const candidates = (await AgentJob.find(claimable).sort({ runAt: 1, createdAt: 1 }).limit(20)
      .select("_id dependsOnTaskIds dependencyRule").lean()) as unknown as Candidate[];

    let job: unknown = null;
    for (const c of candidates) {
      if ((c.dependsOnTaskIds || []).length > 0) {
        const unmet = await unmetDependencies(c.dependsOnTaskIds || [], c.dependencyRule === "merged" ? "merged" : "completed");
        if (unmet.length > 0) continue;
      }
      job = await AgentJob.findOneAndUpdate(
        { _id: c._id, ...claimable },
        {
          $set: { status: "claimed", claimedBy: deviceId, claimedAt: now, leaseUntil: new Date(now.getTime() + LEASE_MS), note: "" },
          $inc: { attempts: 1 },
        },
        { new: true }
      ).lean();
      if (job) break; // another device may have taken it in between; try the next one
    }

    return NextResponse.json({ job: job ? jobForDevice(job) : null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/Missing|jwt|token/i.test(message)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
