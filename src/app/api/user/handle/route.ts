import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { validateHandle } from "@/lib/portfolio-handle";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { handle } = await req.json();
    const v = validateHandle(handle);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

    await dbConnect();
    const userId = (session.user as any).id;

    const clash = await User.findOne({ handle: v.handle }).select("_id").lean();
    if (clash && (clash as any)._id.toString() !== userId) {
      return NextResponse.json({ error: "That handle is already taken." }, { status: 409 });
    }

    await User.findByIdAndUpdate(userId, { $set: { handle: v.handle } });
    return NextResponse.json({ ok: true, handle: v.handle });
  } catch (err: any) {
    if (err?.code === 11000) return NextResponse.json({ error: "That handle is already taken." }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
