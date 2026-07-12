import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { validateHandle } from "@/lib/portfolio-handle";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("handle") || "";
    const v = validateHandle(raw);
    if (!v.ok) return NextResponse.json({ available: false, reason: v.error });

    await dbConnect();
    const existing = await User.findOne({ handle: v.handle }).select("_id").lean();
    const taken = existing && (existing as any)._id.toString() !== userId;

    return NextResponse.json({
      available: !taken,
      handle: v.handle,
      reason: taken ? "That handle is already taken." : undefined,
    });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
