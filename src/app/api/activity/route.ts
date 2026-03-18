import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    await dbConnect();
    const activities = await Activity.find({})
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
