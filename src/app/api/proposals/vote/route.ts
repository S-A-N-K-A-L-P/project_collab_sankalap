import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

    await dbConnect();

    const user = await User.findOne({ email: session.user?.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user._id;

    // Check existing vote
    const existingVote = await Vote.findOne({ userId, proposalId });
    let actionTaken = "";

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
        await Proposal.findByIdAndUpdate(proposalId, { $inc: { votes: voteType === "up" ? -1 : 1 } });
        actionTaken = "removed";
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
        await Proposal.findByIdAndUpdate(proposalId, { $inc: { votes: voteType === "up" ? 2 : -2 } });
        actionTaken = "changed";
      }
    } else {
      await Vote.create({ userId, proposalId, voteType });
      await Proposal.findByIdAndUpdate(proposalId, { $inc: { votes: voteType === "up" ? 1 : -1 } });
      actionTaken = "created";
    }

    const updatedProposal = await Proposal.findById(proposalId);
    
    // Log Activity if it's an upvote or change to upvote
    if (voteType === "up" && (actionTaken === "created" || actionTaken === "changed")) {
        await Activity.create({
            user: userId,
            type: "vote",
            targetId: proposalId,
            targetName: updatedProposal.title
        });
    }

    // Logic: if votes >= 10 -> status = active
    if (updatedProposal.votes >= 10 && updatedProposal.status === "proposal") {
        updatedProposal.status = "active";
        await updatedProposal.save();
        
        await Activity.create({
            user: userId,
            type: "proposal_created", // Or 'proposal_activated'
            targetId: proposalId,
            targetName: updatedProposal.title,
            metadata: { info: "Project moved to ACTIVE stage" }
        });
    }

    return NextResponse.json(updatedProposal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
