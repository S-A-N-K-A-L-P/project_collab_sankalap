import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "pixel_head"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [totalUsers, totalProposals, activeProposals, adminCount, recentUsers, recentProposals] =
      await Promise.all([
        User.countDocuments(),
        Proposal.countDocuments(),
        Proposal.countDocuments({ status: "active" }),
        User.countDocuments({ role: { $in: ["admin", "pixel_head"] } }),
        User.find()
          .select("name email avatar role universityName createdAt")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Proposal.find()
          .populate("createdBy", "name avatar")
          .select("title status stage createdAt createdBy")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return NextResponse.json({
      stats: { totalUsers, totalProposals, activeProposals, adminCount },
      recentUsers,
      recentProposals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
