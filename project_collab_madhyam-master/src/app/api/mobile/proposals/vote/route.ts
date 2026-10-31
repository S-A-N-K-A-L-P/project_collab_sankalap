import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Vote from "@/models/Vote";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);

    const { proposalId, voteType } = await req.json();
    const value = voteType === "up" ? 1 : -1;

    await dbConnect();

    const userId = session.id;

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

    const allVotes = await Vote.find({ proposalId });
    const totalVotes = allVotes.reduce((acc, v) => acc + v.value, 0);

    const updatedProposal = await Proposal.findByIdAndUpdate(
      proposalId,
      { totalVotes },
      { new: true }
    );

    if (value === 1 && (actionTaken === "created" || actionTaken === "changed")) {
      await Activity.create({
        actorId: userId,
        type: "VOTE",
        targetId: proposalId,
        targetType: "PROPOSAL",
        metadata: { title: updatedProposal.title, value: 1 },
      });
    }

    if (updatedProposal.totalVotes >= 10 && updatedProposal.status === "proposal") {
      updatedProposal.status = "active";
      await updatedProposal.save();

      await Activity.create({
        actorId: userId,
        type: "CREATE_PROPOSAL",
        targetId: proposalId,
        targetType: "PROPOSAL",
        metadata: { title: updatedProposal.title, info: "Protocol ACTIVATED" },
      });
    }

    return NextResponse.json(updatedProposal);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("LEGACY_VOTE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
