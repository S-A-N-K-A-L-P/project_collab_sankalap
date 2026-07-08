import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";

/** GET /api/orgs/[slug]/members — list org members */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const org = await Org.findOne({ slug, status: "active" }).select("_id").lean();
    if (!org) return NextResponse.json({ message: "Organization not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const role   = searchParams.get("role");
    const status = searchParams.get("status") || "active";
    const page   = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit  = Math.min(100, parseInt(searchParams.get("limit") || "50"));

    const filter: any = { orgId: (org as any)._id, status };
    if (role) filter.role = role;

    const [members, total] = await Promise.all([
      OrgMember.find(filter)
        .populate("userId", "name avatar handle skills location techStackPreference")
        .sort({ role: 1, joinedAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrgMember.countDocuments(filter),
    ]);

    return NextResponse.json({
      members: JSON.parse(JSON.stringify(members)),
      total,
      page,
    });
  } catch (error) {
    console.error("[GET /api/orgs/[slug]/members]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

/** POST /api/orgs/[slug]/members — join an org or request to join */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const userId   = (session.user as any).id;

    await dbConnect();

    const org = await Org.findOne({ slug, status: "active" });
    if (!org) return NextResponse.json({ message: "Organization not found" }, { status: 404 });

    // Check if already a member
    const existing = await OrgMember.findOne({ userId, orgId: org._id });
    if (existing) {
      if (existing.status === "pending") {
        return NextResponse.json({ message: "Your join request is pending approval." }, { status: 409 });
      }
      return NextResponse.json({ message: "You are already a member of this organization." }, { status: 409 });
    }

    // Check org membership cap (from hierarchy.md §2):
    //   Free: 2 orgs, Pro/Founder: up to 20
    const isPro = (session.user as any).isPro;
    const membershipCap = isPro ? 20 : 2;
    const currentMemberships = await OrgMember.countDocuments({ userId, status: "active" });
    if (currentMemberships >= membershipCap) {
      return NextResponse.json(
        {
          message: `You've reached your organization membership limit (${membershipCap}). ${
            !isPro ? "Upgrade to Pro for up to 20 org memberships." : ""
          }`,
          limitReached: true,
        },
        { status: 403 }
      );
    }

    // Determine membership status based on org type
    const requiresApproval =
      org.orgType === "premium" ||
      org.orgType === "research" ||
      org.orgType === "invite_only" ||
      org.visibility === "private";

    const membership = await OrgMember.create({
      userId,
      orgId:  org._id,
      role:   "member",
      status: requiresApproval ? "pending" : "active",
    });

    if (!requiresApproval) {
      // Update member count
      await Org.updateOne({ _id: org._id }, { $inc: { "stats.memberCount": 1 } });
    }

    return NextResponse.json({
      membership: JSON.parse(JSON.stringify(membership)),
      pending: requiresApproval,
      message: requiresApproval
        ? "Join request submitted. Waiting for admin approval."
        : "Successfully joined the organization!",
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/orgs/[slug]/members]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
