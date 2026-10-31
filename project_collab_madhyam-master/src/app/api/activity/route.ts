export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";
import User from "@/models/User"; // Explicitly import for populate

export async function GET() {
  try {
    await dbConnect();
    const activities = await Activity.find({})
      .populate({
        path: "actorId",
        model: User,
        select: "name avatar role"
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean({ strictPopulate: false });

    return NextResponse.json(JSON.parse(JSON.stringify(activities)));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
