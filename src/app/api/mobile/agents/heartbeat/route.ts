export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import AgentDevice from "@/models/AgentDevice";
import AgentJob from "@/models/AgentJob";
import { LEASE_MS } from "@/lib/agentJobs";

const STATUSES = ["idle", "busy", "waiting-approval", "disabled", "error"];

// POST /api/mobile/agents/heartbeat — keeps the device online and extends the lease of the jobs it holds.
export async function POST(req: Request) {
  try {
    const me = getMobileSession(req);
    const body = await req.json().catch(() => ({}));
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    if (!deviceId) return NextResponse.json({ error: "deviceId is required" }, { status: 400 });

    await dbConnect();
    const status = STATUSES.includes(body.status) ? body.status : "idle";
    const device = await AgentDevice.findOneAndUpdate(
      { userId: me.id, deviceId },
      {
        $set: {
          lastSeenAt: new Date(),
          status,
          statusNote: typeof body.statusNote === "string" ? body.statusNote.slice(0, 200) : "",
          currentJobId: typeof body.currentJobId === "string" ? body.currentJobId : "",
        },
      },
      { new: true }
    ).lean();
    if (!device) return NextResponse.json({ error: "Device not registered", register: true }, { status: 404 });

    // A PC that's still alive keeps its jobs (e.g. while the member reads an approval prompt).
    await AgentJob.updateMany(
      { claimedBy: deviceId, targetUserId: me.id, status: { $in: ["claimed", "running"] } },
      { $set: { leaseUntil: new Date(Date.now() + LEASE_MS) } }
    );

    const queued = await AgentJob.countDocuments({
      targetUserId: me.id,
      status: "queued",
      $or: [{ targetDeviceId: "" }, { targetDeviceId: deviceId }],
    });

    return NextResponse.json({ ok: true, queued });
  } catch (err: any) {
    if (/Missing|jwt|token/i.test(err.message || "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
