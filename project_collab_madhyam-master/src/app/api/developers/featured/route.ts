import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find()
      .select("name avatar role universityName followers following")
      .limit(20)
      .lean();

    const usersWithStats = await Promise.all(users.map(async (u: any) => {
      const pCount = await Proposal.countDocuments({ createdBy: u._id });
      return {
        ...u,
        points: pCount * 10 + (u.followers?.length || 0) * 5,
      };
    }));

    // Sort by points and take top 3
    const featured = usersWithStats
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    return NextResponse.json(featured);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
