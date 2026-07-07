import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getMobileSession(req);

    const { id } = await params;
    await dbConnect();

    const [currentUser, targetUser] = await Promise.all([
      User.findById(session.id).select("following"),
      User.findById(id).select("following"),
    ]);

    if (!currentUser || !targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const mutualIds = currentUser.following.filter((fid: any) =>
      targetUser.following.some((tfid: any) => tfid.toString() === fid.toString())
    );

    const mutuals = await User.find({ _id: { $in: mutualIds } })
      .select("name avatar role")
      .limit(10)
      .lean();

    return NextResponse.json(mutuals);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
