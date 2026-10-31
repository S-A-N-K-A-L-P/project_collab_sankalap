import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Vote from "@/models/Vote";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { proposalId, voteType } = await req.json();
    const value = voteType === "up" ? 1 : -1;

    await dbConnect();

    const user = await User.findOne({ email: session.user?.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user._id;

    // Use our new Vote model logic
    const existingVote = await Vote.findOne({ userId, proposalId });
    let actionTaken = "";

    if (existingVote) {
      if (existingVote.value === value) {
        await Vote.findByIdAndDelete(existingVote._id);
        actionTaken = "removed";
      } else {
        existingVote.value = value;
        await existingVote.save();
        actionTaken = "changed";
      }
    } else {
      await Vote.create({ userId, proposalId, value });
      actionTaken = "created";
    }

    // Sync totalVotes on Proposal
    const allVotes = await Vote.find({ proposalId });
    const totalVotes = allVotes.reduce((acc, v) => acc + v.value, 0);

    const updatedProposal = await Proposal.findByIdAndUpdate(
      proposalId,
      { totalVotes },
      { new: true }
    );

    // Log Activity
    if (value === 1 && (actionTaken === "created" || actionTaken === "changed")) {
      await Activity.create({
        actorId: userId,
        type: "VOTE",
        targetId: proposalId,
        targetType: "PROPOSAL",
        metadata: { title: updatedProposal.title, value: 1 }
      });
    }

    // Status Activation Logic
    if (updatedProposal.totalVotes >= 10 && updatedProposal.status === "proposal") {
      updatedProposal.status = "active";
      await updatedProposal.save();

      await Activity.create({
        actorId: userId,
        type: "CREATE_PROPOSAL",
        targetId: proposalId,
        targetType: "PROPOSAL",
        metadata: { title: updatedProposal.title, info: "Protocol ACTIVATED" }
      });
    }

    return NextResponse.json(updatedProposal);
  } catch (error: any) {
    console.error("LEGACY_VOTE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
