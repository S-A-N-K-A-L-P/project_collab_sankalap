import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Season from "@/models/Season";
import SeasonOrganization from "@/models/SeasonOrganization";
import SeasonRoleAssignment from "@/models/SeasonRoleAssignment";
import Proposal from "@/models/Proposal";
import Project from "@/models/Project";
import "@/models/Org";
import "@/models/User";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await dbConnect();
    const season = await Season.findOne({ slug, status: { $ne: "draft" } }).lean();
    if (!season) return NextResponse.json({ message: "Season not found" }, { status: 404 });
    const seasonId = (season as any)._id;

    const [organizations, mentors, proposals, projects] = await Promise.all([
      SeasonOrganization.find({ seasonId, status: "active" }).populate("orgId", "name slug logo avatar tagline category themeColor").lean(),
      SeasonRoleAssignment.find({ seasonId, role: "mentor", status: "active" }).populate("userId", "name avatar handle skills").populate("orgId", "name slug").lean(),
      Proposal.find({ seasonId, status: { $in: ["proposal", "approved", "active"] } }).populate("orgId", "name slug logo").populate("mentorIds", "name avatar handle").sort({ createdAt: -1 }).lean(),
      Project.find({ seasonId }).populate("orgId", "name slug logo").populate("lead", "name avatar handle").sort({ updatedAt: -1 }).lean(),
    ]);

    return NextResponse.json(JSON.parse(JSON.stringify({ season, organizations, mentors, proposals, projects })));
  } catch (error) {
    console.error("[GET /api/seasons/[slug]]", error);
    return NextResponse.json({ message: "Unable to load season" }, { status: 500 });
  }
}
