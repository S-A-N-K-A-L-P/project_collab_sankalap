import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "master_admin"].includes(s.user?.role);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id)
      .populate("lead", "name email avatar role universityName skills")
      .populate("members", "name email avatar role universityName skills")
      .populate("orgId", "name slug")
      .populate("proposalId", "title status stage totalVotes")
      .populate("verifiedBy", "name email avatar")
      .lean();

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json(project);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, lead, progress, githubRepo, verify } = await req.json();

    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (lead) updates.lead = lead;
    if (progress !== undefined) updates.progress = progress;
    if (githubRepo !== undefined) updates.githubRepo = githubRepo;
    if (verify) updates.verifiedBy = (session!.user as any).id;

    const updated = await Project.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("lead", "name email avatar role")
      .populate("members", "name email avatar role");

    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
