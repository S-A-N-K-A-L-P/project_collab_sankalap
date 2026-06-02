import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Project from "@/models/Project";
import User from "@/models/User";

const DEFAULT_SECTIONS = [
  { key: "hero", enabled: true, order: 0 },
  { key: "about", enabled: true, order: 1 },
  { key: "skills", enabled: true, order: 2 },
  { key: "projects", enabled: true, order: 3 },
  { key: "experience", enabled: true, order: 4 },
  { key: "contact", enabled: true, order: 5 },
];

async function getOrCreate(userId: string) {
  let pf = await Portfolio.findOne({ userId });
  if (!pf) {
    pf = await Portfolio.create({ userId, sections: DEFAULT_SECTIONS });
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
  "isPublished", "heavy3d", "themeId", "accent", "headline", "tagline",
  "aboutLong", "sections", "featuredProjectIds", "experience", "links", "seo",
]);

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    await dbConnect();

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) if (ALLOWED.has(k)) updates[k] = v;

    const pf = await Portfolio.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { userId } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ ok: true, portfolio: JSON.parse(JSON.stringify(pf)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
