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

    const { targetId } = await req.json();
    if (!targetId) return NextResponse.json({ error: "Target ID required" }, { status: 400 });

    await dbConnect();

    const currentUser = await User.findOne({ email: session.user.email });
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (currentUser._id.toString() === targetId) return NextResponse.json({ error: "Self-connection prohibited" }, { status: 400 });

    // Toggle follow
    const isFollowing = currentUser.following.includes(targetId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetId);
      targetUser.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(currentUser._id);

      // Create activity
      await Activity.create({
        type: "join",
        user: currentUser._id,
        targetName: targetUser.name,
        message: `Connected with ${targetUser.name}`,
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    return NextResponse.json({ 
      connected: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
