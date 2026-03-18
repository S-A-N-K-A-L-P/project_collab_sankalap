import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: targetId } = await params;
    const currentUserEmail = session.user?.email;

    await dbConnect();

    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUser._id;
    if (currentUserId.toString() === targetId) {
      return NextResponse.json({ message: "Cannot follow yourself" }, { status: 400 });
    }

    const isFollowing = currentUser.following.includes(targetId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetId },
      });
      await User.findByIdAndUpdate(targetId, {
        $pull: { followers: currentUserId },
      });
      
      return NextResponse.json({ status: "unfollowed" });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $push: { following: targetId },
      });
      await User.findByIdAndUpdate(targetId, {
        $push: { followers: currentUserId },
      });

      // Record Activity
      await Activity.create({
          actorId: currentUserId,
          type: "FOLLOW",
          targetId: targetId,
          targetType: "USER"
      });

      return NextResponse.json({ status: "following" });
    }
  } catch (error) {
    console.error("FOLLOW_ERROR:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
