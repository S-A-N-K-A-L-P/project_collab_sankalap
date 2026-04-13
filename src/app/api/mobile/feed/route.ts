export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";
import User from "@/models/User"; // Explicitly import for populate

export async function GET(req: Request) {
  try {
    await dbConnect();

    // 1. Fetch Active Proposals
    const proposals = await Proposal.find({ status: { $in: ["proposal", "active"] } })
      .populate("createdBy", "name avatar role")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 2. Fetch Recent Activity
    const activity = await Activity.find({})
      .populate({
        path: "actorId",
        model: User,
        select: "name avatar role"
      })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean({ strictPopulate: false });

    // Filter out orphaned data (where populate fails)
    const validProposals = proposals.filter((p: any) => p.createdBy);
    const validActivity = activity.filter((a: any) => a.actorId);

    // 3. Return structured feed
    return NextResponse.json({
      proposals: JSON.parse(JSON.stringify(validProposals)),
      activity: JSON.parse(JSON.stringify(validActivity))
    });

  } catch (error) {
    console.error("FEED_ERROR:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
