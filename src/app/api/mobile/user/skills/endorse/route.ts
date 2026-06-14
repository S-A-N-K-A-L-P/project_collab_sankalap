import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);
    const currentUserId = session.id;

    const { targetId, skill } = await req.json();
    if (!targetId || !skill) return NextResponse.json({ error: "Target and skill required" }, { status: 400 });

    if (currentUserId === targetId) {
      return NextResponse.json({ error: "Self-endorsement prohibited" }, { status: 400 });
    }

    await dbConnect();

    const targetUser = await User.findById(targetId);
    if (!targetUser) return NextResponse.json({ error: "Target not found" }, { status: 404 });

    await Activity.create({
      actorId: currentUserId,
      type: "VOTE",
      targetId: targetId,
      targetType: "USER",
      metadata: { skill, name: targetUser.name },
    });

    await User.findByIdAndUpdate(targetId, { $inc: { reputation: 1 } });

    return NextResponse.json({ success: true, message: `Skill ${skill} endorsed.` });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ENDORSE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
