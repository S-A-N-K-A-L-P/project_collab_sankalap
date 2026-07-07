import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Project from "@/models/Project";
import User from "@/models/User";
import { defaultSections, normalizeSections } from "@/components/portfolio/sections";

async function getOrCreate(userId: string) {
  let pf = await Portfolio.findOne({ userId });
  if (!pf) {
    pf = await Portfolio.create({ userId, sections: defaultSections() });
    return pf;
  }
  // Migrate legacy/empty sections into the new content-bearing shape.
  const normalized = normalizeSections(pf.toObject());
  const isLegacy = !pf.sections?.length || !(pf.sections[0] as any)?.type;
  if (isLegacy) {
    pf.sections = normalized as any;
    await pf.save();
  }
  return pf;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    await dbConnect();

    const pf = await getOrCreate(userId);
    const user = await User.findById(userId)
      .select("name avatar bio location skills github techStackPreference handle")
      .lean();

    // Projects the user can feature (completed first, then active they lead/are in)
    const projects = await Project.find({ $or: [{ lead: userId }, { members: userId }] })
      .select("title description coverImage liveUrl githubRepo techStack version status")
      .sort({ completedAt: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({
      portfolio: JSON.parse(JSON.stringify(pf)),
      user: JSON.parse(JSON.stringify(user)),
      availableProjects: JSON.parse(JSON.stringify(projects)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const ALLOWED = new Set([
  "isPublished", "heavy3d", "themeId", "accent", "accent2", "bgOverride",
  "threeOverride", "card", "sectionAnim", "projectCardStyle", "projectCardAnim",
  "headline", "tagline",
  "aboutLong", "sections", "featuredProjectIds", "experience", "links", "seo",
]);

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    await dbConnect();

    const body = await req.json();

    // Load → modify → save, with markModified for the Mixed `sections` content.
    // (findOneAndUpdate($set) does not reliably persist deep Mixed changes.)
    let pf = await Portfolio.findOne({ userId });
    if (!pf) pf = new Portfolio({ userId, sections: defaultSections() });

    for (const [k, v] of Object.entries(body)) {
      if (!ALLOWED.has(k)) continue;
      (pf as any)[k] = v;
      if (k === "sections") pf.markModified("sections");
    }

    await pf.save();
    return NextResponse.json({ ok: true, portfolio: JSON.parse(JSON.stringify(pf)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
