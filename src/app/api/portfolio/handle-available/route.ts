import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { validateHandle } from "@/lib/portfolio-handle";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("handle") || "";
    const v = validateHandle(raw);
    if (!v.ok) return NextResponse.json({ available: false, reason: v.error });

    await dbConnect();
    const userId = (session.user as any).id;
    const existing = await User.findOne({ handle: v.handle }).select("_id").lean();
    const taken = existing && (existing as any)._id.toString() !== userId;

    return NextResponse.json({
      available: !taken,
      handle: v.handle,
      reason: taken ? "That handle is already taken." : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
