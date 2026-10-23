export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { isAdminRole } from "@/lib/roles";
import Project from "@/models/Project";
import AgentDevice from "@/models/AgentDevice";
import AgentJob from "@/models/AgentJob";
import User from "@/models/User";
import { isOnline } from "@/lib/agentJobs";

// GET /api/admin/projects/{id}/agents — each member's Syncro Desktop PCs (online/offline) and the project's recent agent jobs.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminRole((session?.user as any)?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();
    void User;
    const project = (await Project.findById(id).populate("lead", "name email").populate("members", "name email").lean()) as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const people: any[] = [...(project.members || [])];
    if (project.lead && !people.some((m) => String(m._id) === String(project.lead._id))) people.unshift(project.lead);
    const ids = people.map((m) => String(m._id));

    const [devices, jobs] = await Promise.all([
      AgentDevice.find({ userId: { $in: ids } }).sort({ lastSeenAt: -1 }).lean() as Promise<any[]>,
      AgentJob.find({ projectId: id }).sort({ createdAt: -1 }).limit(60).lean() as Promise<any[]>,
    ]);

    const now = Date.now();
    const members = people.map((m) => {
      const uid = String(m._id);
      const mine = devices.filter((d) => d.userId === uid).map((d) => ({
        deviceId: d.deviceId, name: d.name, os: d.os, appVersion: d.appVersion, workspaceRoot: d.workspaceRoot,
        status: d.status, statusNote: d.statusNote, currentJobId: d.currentJobId,
        lastSeenAt: d.lastSeenAt, online: isOnline(d.lastSeenAt),
      }));
      return { userId: uid, name: m.name || m.email || uid, email: m.email || "", devices: mine, online: mine.some((d) => d.online) };
    });

    const deviceName = new Map(devices.map((d) => [d.deviceId, d.name]));
    return NextResponse.json({
      members,
      jobs: jobs.map((j) => ({
        id: String(j._id), type: j.type, taskId: j.taskId, title: j.payload?.title || "",
        targetUserId: j.targetUserId, targetUserName: j.targetUserName,
        status: j.status,
        stalled: ["claimed", "running"].includes(j.status) && j.leaseUntil && new Date(j.leaseUntil).getTime() < now,
        claimedBy: j.claimedBy, claimedByName: deviceName.get(j.claimedBy) || "", attempts: j.attempts, maxAttempts: j.maxAttempts,
        note: j.note, error: j.error, result: j.result, createdAt: j.createdAt, finishedAt: j.finishedAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
