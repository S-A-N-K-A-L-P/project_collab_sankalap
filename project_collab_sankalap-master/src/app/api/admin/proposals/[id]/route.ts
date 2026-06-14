import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Vote from "@/models/Vote";

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

    const proposal = await Proposal.findById(id)
      .populate({
        path: "createdBy",
        select: "name email avatar role universityName enrollmentNumber skills reputation bio github location createdAt",
      })
      .populate("projectLead", "name email avatar role universityName")
      .lean();

    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    const voteAgg = await Vote.aggregate([
      { $match: { proposalId: (proposal as any)._id } },
      { $group: { _id: "$value", count: { $sum: 1 } } },
    ]);
    const upvotes = voteAgg.find((v) => v._id === 1)?.count ?? 0;
    const downvotes = voteAgg.find((v) => v._id === -1)?.count ?? 0;

    const otherProposals = await Proposal.find({
      createdBy: (proposal as any).createdBy?._id,
      _id: { $ne: (proposal as any)._id },
    })
      .select("title status stage totalVotes createdAt")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return NextResponse.json({ proposal, voteStats: { upvotes, downvotes }, otherProposals });
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
    const { status, stage, projectLead } = await req.json();

    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (stage !== undefined) updates.stage = stage;
    if (projectLead !== undefined) updates.projectLead = projectLead || null;

    const updated = await Proposal.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("createdBy", "name email avatar role")
      .populate("projectLead", "name email avatar role");

    if (!updated) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
