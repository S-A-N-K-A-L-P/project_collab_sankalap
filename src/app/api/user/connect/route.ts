import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetId } = await req.json();
    if (!targetId) return NextResponse.json({ error: "Target ID required" }, { status: 400 });

    await dbConnect();

    const currentUser = await User.findOne({ email: session.user.email });
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (currentUser._id.toString() === targetId) return NextResponse.json({ error: "Self-connection prohibited" }, { status: 400 });

    const isFollowing = currentUser.following.includes(targetId);

    if (isFollowing) {
      await User.findByIdAndUpdate(currentUser._id, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUser._id } });
    } else {
      await User.findByIdAndUpdate(currentUser._id, { $push: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $push: { followers: currentUser._id } });

      // Record Activity
      await Activity.create({
        actorId: currentUser._id,
        type: "FOLLOW",
        targetId: targetId,
        targetType: "USER",
        metadata: { name: targetUser.name }
      });
    }

    return NextResponse.json({
      connected: !isFollowing,
      followersCount: isFollowing ? targetUser.followers.length - 1 : targetUser.followers.length + 1,
    });
  } catch (error: any) {
    console.error("CONNECT_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
