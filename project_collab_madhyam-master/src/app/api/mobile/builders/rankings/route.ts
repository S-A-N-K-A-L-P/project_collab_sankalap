import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";

export async function GET() {
  try {
    await dbConnect();
    
    // Logic: Users with many proposals or high engagement
    const users = await User.find()
      .select("name avatar email")
      .limit(10)
      .lean();

    const rankedUsers = await Promise.all(users.map(async (u: any) => {
      const pCount = await Proposal.countDocuments({ createdBy: u._id });
      return {
        ...u,
        points: pCount * 10 + 5,
        trend: pCount > 0 ? `+${pCount}` : "SYNC"
      };
    }));

    // Sort by points descending
    rankedUsers.sort((a, b) => b.points - a.points);

    return NextResponse.json(rankedUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
