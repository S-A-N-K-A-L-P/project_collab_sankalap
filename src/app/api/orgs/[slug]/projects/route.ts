import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import Project from "@/models/Project";

/** GET /api/orgs/[slug]/projects — list completed / showcase projects belonging to the org */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const org = await Org.findOne({ slug, status: "active" }).select("_id").lean();
    if (!org) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));

    // Fetch projects linked to this organization
    const projects = await Project.find({
      orgId: (org as any)._id,
      // Optional: Filter to showcase / completed projects only if required
    })
      .select("title description coverImage liveUrl githubRepo techStack status completedAt")
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      projects: JSON.parse(JSON.stringify(projects)),
    });
  } catch (error) {
    console.error("[GET /api/orgs/[slug]/projects]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
