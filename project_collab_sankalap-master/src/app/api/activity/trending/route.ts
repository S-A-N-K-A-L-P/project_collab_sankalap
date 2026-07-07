import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    await dbConnect();
    
    const trending = await Activity.find({
      type: { $in: ["endorse", "broadcast", "join"] }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    return NextResponse.json(trending);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
