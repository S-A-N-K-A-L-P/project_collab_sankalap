import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetId, skill } = await req.json();
    if (!targetId || !skill) return NextResponse.json({ error: "Target and skill required" }, { status: 400 });

    await dbConnect();

    const currentUser = await User.findOne({ email: session.user.email });
    if (currentUser._id.toString() === targetId) return NextResponse.json({ error: "Self-endorsement prohibited" }, { status: 400 });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return NextResponse.json({ error: "Target not found" }, { status: 404 });

    // Record Activity
    await Activity.create({
      actorId: currentUser._id,
      type: "VOTE", // Or add 'ENDORSE' if preferred, using 'VOTE' as generic signal for now
      targetId: targetId,
      targetType: "USER",
      metadata: { skill, name: targetUser.name }
    });

    // Simple Reputation Boost for receiving endorsement
    await User.findByIdAndUpdate(targetId, { $inc: { reputation: 1 } });

    return NextResponse.json({ success: true, message: `Skill ${skill} endorsed.` });
  } catch (error: any) {
    console.error("ENDORSE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
