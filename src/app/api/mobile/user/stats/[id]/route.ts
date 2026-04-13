import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const user = (await User.findById(id).select("followers following").lean()) as
      | { followers?: unknown[]; following?: unknown[] }
      | null;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const pCount = await Proposal.countDocuments({ createdBy: id });

    return NextResponse.json({
      proposalsCount: pCount,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
