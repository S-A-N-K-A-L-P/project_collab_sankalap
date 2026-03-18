import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    // Logic: Users updated in the last 15 minutes are "online"
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const onlineUsers = await User.find({
      updatedAt: { $gte: fifteenMinutesAgo }
    })
    .select("name avatar email")
    .limit(10)
    .lean();

    return NextResponse.json(onlineUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
