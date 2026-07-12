import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Project from "@/models/Project";
import User from "@/models/User";
import { defaultSections, normalizeSections } from "@/components/portfolio/sections";
import { snapshotPublishable } from "@/components/portfolio/publish";

async function getOrCreate(userId: string) {
  let pf = await Portfolio.findOne({ userId });
  if (!pf) {
    pf = await Portfolio.create({ userId, sections: defaultSections() });
  }
  const normalized = normalizeSections(pf.toObject());
  const isLegacy = !pf.sections?.length || !(pf.sections[0] as any)?.type;
  if (isLegacy) {
    pf.sections = normalized as any;
  }
  if (!pf.published) {
    pf.published = snapshotPublishable(pf.toObject());
    pf.markModified("published");
    if (!pf.lastPublishedAt) pf.lastPublishedAt = pf.updatedAt || new Date();
  }
  if (pf.isModified()) await pf.save();
  return pf;
}

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;
    await dbConnect();

    const pf = await getOrCreate(userId);
    const user = await User.findById(userId)
      .select("name avatar bio location skills github techStackPreference handle")
      .lean();

    const projects = await Project.find({ $or: [{ lead: userId }, { members: userId }] })
      .select("title description coverImage liveUrl githubRepo techStack version status")
      .sort({ completedAt: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({
      portfolio: JSON.parse(JSON.stringify(pf)),
      user: JSON.parse(JSON.stringify(user)),
      availableProjects: JSON.parse(JSON.stringify(projects)),
    });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

const ALLOWED = new Set([
  "isPublished", "heavy3d", "themeId", "accent", "accent2", "bgOverride",
  "threeOverride", "card", "sectionAnim", "projectCardStyle", "projectCardAnim",
  "headline", "tagline",
  "aboutLong", "sections", "featuredProjectIds", "experience", "links", "seo",
]);

export async function PUT(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;
    await dbConnect();

    const body = await req.json();

    let pf = await Portfolio.findOne({ userId });
    if (!pf) pf = new Portfolio({ userId, sections: defaultSections() });

    for (const [k, v] of Object.entries(body)) {
      if (!ALLOWED.has(k)) continue;
      (pf as any)[k] = v;
      if (k === "sections") pf.markModified("sections");
    }

    // Mobile might also send publish signal directly in the PUT request
    if (body.publishNow) {
      pf.published = snapshotPublishable(pf.toObject());
      pf.markModified("published");
      pf.lastPublishedAt = new Date();
    }

    await pf.save();
    return NextResponse.json({ ok: true, portfolio: JSON.parse(JSON.stringify(pf)) });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
