import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import Project from "@/models/Project";
import { canManageOrg, isPlatformAdminOverride } from "@/lib/org-permissions";
import { isPlatformReviewer } from "@/lib/roles";

/** GET /api/orgs/[slug] — public org profile */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const org = await Org.findOne({ slug, status: "active" })
      .populate("ownerId",    "name avatar handle")
      .populate("createdBy",  "name avatar handle")
      .lean();

    if (!org) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    Org.updateOne({ _id: (org as any)._id }, { $inc: { "stats.viewCount": 1 } }).exec();

    // Fetch members (top 20 by role precedence)
    const rolePriority: Record<string, number> = { owner: 6, admin: 5, lead: 4, contributor: 3, member: 2, observer: 1 };
    const members = await OrgMember.find({ orgId: (org as any)._id, status: "active" })
      .populate("userId", "name avatar handle skills")
      .limit(50)
      .lean();
    members.sort((a: any, b: any) => (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0));

    // Fetch recent completed projects
    const projects = await Project.find({ orgId: (org as any)._id, "showcase.isPublic": true })
      .select("title description coverImage liveUrl githubRepo techStack status completedAt")
      .sort({ completedAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({
      org:      JSON.parse(JSON.stringify(org)),
      members:  JSON.parse(JSON.stringify(members)),
      projects: JSON.parse(JSON.stringify(projects)),
    });
  } catch (error) {
    console.error("[GET /api/orgs/[slug]]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

/** PATCH /api/orgs/[slug] — update org settings (org admin/owner or platform admin) */
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const userId = (session.user as any).id;
    const platformRole = (session.user as any).role;

    await dbConnect();

    const org = await Org.findOne({ slug });
    if (!org) return NextResponse.json({ message: "Organization not found" }, { status: 404 });

    // Check permission
    let orgRole: string | undefined;
    if (!isPlatformAdminOverride(platformRole)) {
      const membership = await OrgMember.findOne({ userId, orgId: org._id, status: "active" });
      orgRole = membership?.role;
      if (!canManageOrg(platformRole, orgRole)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json();
    const ALLOWED_FIELDS = [
      "name", "description", "tagline", "charter", "roadmap",
      "website", "email", "socialLinks", "logo", "bannerImage",
      "themeColor", "gallery", "visibility", "orgType",
      "membershipFee", "maxConcurrentProjects", "maxTeamSize",
      "votingRightsRule", "portfolioEnabled",
    ];

    const update: Record<string, any> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const updated = await Org.findByIdAndUpdate(org._id, { $set: update }, { new: true, runValidators: true }).lean();

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error: any) {
    console.error("[PATCH /api/orgs/[slug]]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
