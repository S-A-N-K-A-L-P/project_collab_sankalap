export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import AgentDevice from "@/models/AgentDevice";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

// POST /api/mobile/agents/register — Syncro Desktop registers (or refreshes) this PC for the signed-in member.
export async function POST(req: Request) {
  try {
    const me = getMobileSession(req);
    const body = await req.json().catch(() => ({}));
    const deviceId = clip(body.deviceId, 64);
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(deviceId)) {
      return NextResponse.json({ error: "deviceId (8–64 letters, digits, - or _) is required" }, { status: 400 });
    }

    await dbConnect();
    const device = await AgentDevice.findOneAndUpdate(
      { userId: me.id, deviceId },
      {
        $set: {
          userName: me.name || me.email || "",
          name: clip(body.name, 80) || "Unnamed PC",
          os: clip(body.os, 80),
          appVersion: clip(body.appVersion, 40),
          workspaceRoot: clip(body.workspaceRoot, 260),
          status: body.enabled === false ? "disabled" : "idle",
          lastSeenAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ device });
  } catch (err: any) {
    if (/Missing|jwt|token/i.test(err.message || "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
