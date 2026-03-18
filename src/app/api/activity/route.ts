import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    await dbConnect();
    const activities = await Activity.find({})
      .populate("actorId", "name avatar role")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(activities)));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
