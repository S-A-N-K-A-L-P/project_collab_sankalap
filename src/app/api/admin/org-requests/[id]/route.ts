import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import { isPlatformReviewer } from "@/lib/roles";

/** PATCH /api/admin/org-requests/[id] — approve / reject / request changes */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const platformRole = (session.user as any).role;
    const reviewerId   = (session.user as any).id;

    if (!isPlatformReviewer(platformRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { decision, reason } = await req.json();

    const VALID_DECISIONS = ["approved", "rejected", "changes_requested", "in_review"];
    if (!VALID_DECISIONS.includes(decision)) {
      return NextResponse.json({ message: "Invalid decision" }, { status: 400 });
    }
    if (decision === "rejected" && !reason?.trim()) {
      return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 });
    }

    await dbConnect();

    const org = await Org.findById(id);
    if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

    if (!["requested", "in_review"].includes(org.status)) {
      return NextResponse.json({ message: "This request has already been processed." }, { status: 409 });
    }

    // Map decision to status
    const statusMap: Record<string, string> = {
      approved:           "active",
      rejected:           "rejected",
      changes_requested:  "requested",
      in_review:          "in_review",
    };
    const newStatus = statusMap[decision];

    const reviewData = {
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      decision,
      reason:     reason?.trim() || "",
    };

    const updated = await Org.findByIdAndUpdate(
      id,
      {
        $set: {
          status: newStatus,
          review: reviewData,
        },
      },
      { new: true }
    ).populate("ownerId", "name email avatar");

    // On approval: ensure founder has owner role in OrgMember
    if (decision === "approved" && updated) {
      await OrgMember.findOneAndUpdate(
        { userId: updated.ownerId, orgId: updated._id },
        { $set: { role: "owner", status: "active" } },
        { upsert: true }
      );

      // Seed stats
      await Org.updateOne({ _id: updated._id }, {
        $set: { "stats.memberCount": 1 },
      });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error: any) {
    console.error("[PATCH /api/admin/org-requests/[id]]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
