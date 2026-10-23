export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import AgentDevice from "@/models/AgentDevice";
import AgentJob from "@/models/AgentJob";
import { jobForDevice, LEASE_MS } from "@/lib/agentJobs";

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
    const job = await AgentJob.findOneAndUpdate(
      {
        ...mine,
        $and: [
          { $or: [{ status: "queued" }, { status: { $in: ["claimed", "running"] }, leaseUntil: { $lt: now } }] },
          { $expr: { $lt: ["$attempts", "$maxAttempts"] } },
        ],
      },
      {
        $set: { status: "claimed", claimedBy: deviceId, claimedAt: now, leaseUntil: new Date(now.getTime() + LEASE_MS), note: "" },
        $inc: { attempts: 1 },
      },
      { sort: { createdAt: 1 }, new: true }
    ).lean();

    return NextResponse.json({ job: job ? jobForDevice(job) : null });
  } catch (err: any) {
    if (/Missing|jwt|token/i.test(err.message || "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
