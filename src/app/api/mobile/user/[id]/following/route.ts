import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getMobileSession(req);
    const currentUserId = session.id;

    const { id: targetId } = await params;

    if (currentUserId === targetId) {
      return NextResponse.json({ message: "Cannot follow yourself" }, { status: 400 });
    }

    await dbConnect();

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isFollowing = currentUser.following.some((f: any) => f.toString() === targetId);

    if (isFollowing) {
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
      return NextResponse.json({ status: "unfollowed" });
    } else {
      await User.findByIdAndUpdate(currentUserId, { $push: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $push: { followers: currentUserId } });

      await Activity.create({
        actorId: currentUserId,
        type: "FOLLOW",
        targetId: targetId,
        targetType: "USER",
      });

      return NextResponse.json({ status: "following" });
    }
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("FOLLOW_ERROR:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
