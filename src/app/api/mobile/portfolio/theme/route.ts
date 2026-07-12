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
    const { publishNow, themeId, accent, accent2, card, sectionAnim, projectCardStyle, projectCardAnim } = body;

    const pf = await Portfolio.findOne({ userId });
    if (!pf) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

    // Update only theme properties
    if (themeId !== undefined) pf.themeId = themeId;
    if (accent !== undefined) pf.accent = accent;
    if (accent2 !== undefined) pf.accent2 = accent2;
    if (card !== undefined) pf.card = card;
    if (sectionAnim !== undefined) pf.sectionAnim = sectionAnim;
    if (projectCardStyle !== undefined) pf.projectCardStyle = projectCardStyle;
    if (projectCardAnim !== undefined) pf.projectCardAnim = projectCardAnim;

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
