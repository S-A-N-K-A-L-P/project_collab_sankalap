import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { proposalId } = await req.json();

    await dbConnect();

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isContributor = proposal.contributors.includes(userId);

    if (isContributor) {
      await Proposal.findByIdAndUpdate(proposalId, {
        $pull: { contributors: userId }
      });
      return NextResponse.json({ message: "Left project", status: "left" });
    } else {
      await Proposal.findByIdAndUpdate(proposalId, {
        $addToSet: { contributors: userId }
      });

      // Log Activity
      await Activity.create({
        user: userId,
        type: "join",
        targetId: proposalId,
        targetName: proposal.title
      });

      return NextResponse.json({ message: "Joined project", status: "joined" });
    }

  } catch (error) {
    console.error("JOIN_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
