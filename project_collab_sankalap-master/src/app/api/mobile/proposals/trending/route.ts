import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

export async function GET() {
  try {
    await dbConnect();
    
    // In a more complex app, this would use a ranking algorithm
    // For now, sorting by votes (if exists) or just recent
    const trending = await Proposal.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(trending);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
