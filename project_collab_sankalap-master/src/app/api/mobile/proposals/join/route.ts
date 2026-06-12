import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import { getMobileSession } from "@/lib/mobileAuth";
import { NextResponse } from "next/server";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    const { proposalId } = await req.json();

    await dbConnect();

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const isContributor = proposal.contributors.some((c: any) => c.toString() === userId);

    if (isContributor) {
      await Proposal.findByIdAndUpdate(proposalId, { $pull: { contributors: userId } });
      return NextResponse.json({ message: "Left project", status: "left" });
    } else {
      await Proposal.findByIdAndUpdate(proposalId, { $addToSet: { contributors: userId } });

      await Activity.create({
        actorId: userId,
        type: "JOIN",
        targetId: proposalId,
        targetType: "PROPOSAL",
        metadata: { title: proposal.title },
      });

      await User.findByIdAndUpdate(userId, { $inc: { reputation: 5 } });

      return NextResponse.json({ message: "Joined project", status: "joined" });
    }
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("JOIN_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
