import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { validateHandle } from "@/lib/portfolio-handle";

export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    const { handle } = await req.json();
    const v = validateHandle(handle);
    if (!v.ok) return NextResponse.json({ message: v.error }, { status: 400 });

    await dbConnect();
    const existing = await User.findOne({ handle: v.handle }).select("_id").lean();
    if (existing && (existing as any)._id.toString() !== userId) {
      return NextResponse.json({ message: "That handle is already taken." }, { status: 400 });
    }

    await User.updateOne({ _id: userId }, { $set: { handle: v.handle } });

    return NextResponse.json({ ok: true, handle: v.handle });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
