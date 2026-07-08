import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgPortfolio from "@/models/OrgPortfolio";
import { canEditOrgPortfolio, isPlatformAdminOverride } from "@/lib/org-permissions";
import OrgMember from "@/models/OrgMember";

/** GET /api/orgs/[slug]/portfolio — fetch org portfolio data (public) */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const org = await Org.findOne({ slug, status: "active" }).lean();
    if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

    const orgId = (org as any)._id;
    const portfolio = await OrgPortfolio.findOne({ orgId }).lean();

    // Increment view count
    if (portfolio) {
      OrgPortfolio.updateOne({ orgId }, { $inc: { views: 1 } }).exec();
    }

    return NextResponse.json({
      org:       JSON.parse(JSON.stringify(org)),
      portfolio: portfolio ? JSON.parse(JSON.stringify(portfolio)) : null,
    });
  } catch (error) {
    console.error("[GET /orgs/[slug]/portfolio]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

/** PUT /api/orgs/[slug]/portfolio — save org portfolio (org admin/owner) */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const userId       = (session.user as any).id;
    const platformRole = (session.user as any).role;

    await dbConnect();

    const org = await Org.findOne({ slug }).select("_id portfolioEnabled");
    if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

    // Permission check
    if (!isPlatformAdminOverride(platformRole)) {
      const membership = await OrgMember.findOne({ userId, orgId: org._id, status: "active" });
      if (!canEditOrgPortfolio(platformRole, membership?.role)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json();
    const ALLOWED = [
      "isPublished", "themeId", "accent", "accent2", "bgOverride", "threeOverride",
      "card", "sectionAnim", "projectCardStyle", "projectCardAnim", "sections", "seo",
    ];

    const update: Record<string, any> = {};
    for (const field of ALLOWED) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    // Handle published snapshot
    if (body.publish === true) {
      update.published      = { ...update, sections: body.sections };
      update.lastPublishedAt = new Date();
      // Also enable portfolio on the org
      await Org.updateOne({ _id: org._id }, { $set: { portfolioEnabled: true } });
    }

    const portfolio = await OrgPortfolio.findOneAndUpdate(
      { orgId: org._id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(JSON.parse(JSON.stringify(portfolio)));
  } catch (error: any) {
    console.error("[PUT /orgs/[slug]/portfolio]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
