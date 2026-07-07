import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Project from "@/models/Project";
import User from "@/models/User";

/** Public fetch by handle (or _id fallback). Returns only published portfolios. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    await dbConnect();
    const { handle } = await params;

    // Resolve user by handle, or by _id as a fallback
    let user = await User.findOne({ handle: handle.toLowerCase() })
      .select("name avatar bio location skills github techStackPreference handle")
      .lean();

    if (!user && mongoose.isValidObjectId(handle)) {
      user = await User.findById(handle)
        .select("name avatar bio location skills github techStackPreference handle")
        .lean();
    }

    if (!user) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const pf = await Portfolio.findOne({ userId: (user as any)._id }).lean();
    if (!pf || (pf as any).isPublished === false) {
      return NextResponse.json({ error: "This portfolio isn't public." }, { status: 404 });
    }

    // Serve the published snapshot; fall back to the draft for un-migrated docs.
    const pub = (pf as any).published && Object.keys((pf as any).published).length ? (pf as any).published : null;
    const view = pub || pf;

    // Featured projects (ordered) or fall back to the user's completed projects
    const featuredIds = (view as any).featuredProjectIds || [];
    let projects: any[] = [];
    if (featuredIds.length) {
      const found = await Project.find({ _id: { $in: featuredIds } })
        .select("title description coverImage liveUrl githubRepo techStack version status")
        .lean();
      const byId = new Map(found.map((p: any) => [p._id.toString(), p]));
      projects = featuredIds.map((id: any) => byId.get(id.toString())).filter(Boolean);
    } else {
      projects = await Project.find({
        $or: [{ lead: (user as any)._id }, { members: (user as any)._id }],
        status: "completed",
      })
        .select("title description coverImage liveUrl githubRepo techStack version status")
        .sort({ completedAt: -1 })
        .limit(6)
        .lean();
    }

    // increment views (fire-and-forget)
    Portfolio.updateOne({ _id: (pf as any)._id }, { $inc: { views: 1 } }).catch(() => null);

    return NextResponse.json({
      portfolio: JSON.parse(JSON.stringify({ ...pf, ...(pub || {}) })),
      user: JSON.parse(JSON.stringify(user)),
      projects: JSON.parse(JSON.stringify(projects)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
