import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";

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
      .populate("actorId", "name avatar role")
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    // 3. Return structured feed
    // In the future, we can interleave these
    return NextResponse.json({
      proposals: JSON.parse(JSON.stringify(proposals)),
      activity: JSON.parse(JSON.stringify(activity))
    });

  } catch (error) {
    console.error("FEED_ERROR:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
