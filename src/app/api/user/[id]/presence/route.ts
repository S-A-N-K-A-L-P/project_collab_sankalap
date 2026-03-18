import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const user = await User.findById(id).select("updatedAt").lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isOnline = user.updatedAt >= fifteenMinutesAgo;

    return NextResponse.json({ isOnline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
