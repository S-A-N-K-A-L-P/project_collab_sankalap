import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import User from "@/models/User";
import { getMobileSession } from "@/lib/mobileAuth";

export async function PUT(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;
    await dbConnect();

    const body = await req.json();
    const { publishNow, heavy3d, bgOverride, threeOverride } = body;

    const pf = await Portfolio.findOne({ userId });
    if (!pf) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

    // Update only background properties
    if (heavy3d !== undefined) pf.heavy3d = heavy3d;
    if (bgOverride !== undefined) pf.bgOverride = bgOverride;
    if (threeOverride !== undefined) pf.threeOverride = threeOverride;

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
