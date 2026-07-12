import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { User } from "@/models/User";
import { authMiddleware } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { userId } = await authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { publishNow, sections } = body;

    const pf = await Portfolio.findOne({ userId });
    if (!pf) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

    // Update sections
    if (sections !== undefined) {
      pf.sections = sections;
    }

    if (publishNow) {
      pf.published = pf.toObject();
      pf.lastPublishedAt = new Date();
    }

    await pf.save();
    const user = await User.findById(userId).lean();
    return NextResponse.json({ portfolio: pf, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
