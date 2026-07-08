import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import { canChangeOrgRole, canRemoveMember, isPlatformAdminOverride } from "@/lib/org-permissions";

/** PATCH /api/orgs/[slug]/members/[userId] — change member role or approve join */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug, userId: targetUserId } = await params;
    const callerUserId  = (session.user as any).id;
    const platformRole  = (session.user as any).role;

    await dbConnect();

    const org = await Org.findOne({ slug }).select("_id");
    if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

    // Caller's org role
    let callerOrgRole: string | undefined;
    if (!isPlatformAdminOverride(platformRole)) {
      const callerMembership = await OrgMember.findOne({ userId: callerUserId, orgId: org._id, status: "active" });
      callerOrgRole = callerMembership?.role;
    }

    if (!canChangeOrgRole(platformRole, callerOrgRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { role, status } = await req.json();

    const VALID_ROLES   = ["observer", "member", "contributor", "lead", "admin"];
    const VALID_STATUSES = ["active", "suspended"];

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const update: any = {};
    if (role)   update.role   = role;
    if (status && VALID_STATUSES.includes(status)) update.status = status;

    // Approve a pending member
    if (status === "active") {
      update.status = "active";
    }

    const membership = await OrgMember.findOneAndUpdate(
      { userId: targetUserId, orgId: org._id },
      { $set: update },
      { new: true }
    );

    if (!membership) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Update member count if approving
    if (status === "active") {
      await Org.updateOne({ _id: org._id }, { $inc: { "stats.memberCount": 1 } });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(membership)));
  } catch (error: any) {
    console.error("[PATCH member]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/** DELETE /api/orgs/[slug]/members/[userId] — remove member or leave org */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug, userId: targetUserId } = await params;
    const callerUserId  = (session.user as any).id;
    const platformRole  = (session.user as any).role;

    await dbConnect();

    const org = await Org.findOne({ slug }).select("_id");
    if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

    // Users can leave themselves; admins can remove others
    const isSelf = callerUserId === targetUserId;
    if (!isSelf) {
      const callerMembership = await OrgMember.findOne({ userId: callerUserId, orgId: org._id, status: "active" });
      if (!canRemoveMember(platformRole, callerMembership?.role)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    const membership = await OrgMember.findOneAndDelete({ userId: targetUserId, orgId: org._id });
    if (!membership) return NextResponse.json({ message: "Member not found" }, { status: 404 });

    if (membership.status === "active") {
      await Org.updateOne({ _id: org._id }, { $inc: { "stats.memberCount": -1 } });
    }

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error: any) {
    console.error("[DELETE member]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
