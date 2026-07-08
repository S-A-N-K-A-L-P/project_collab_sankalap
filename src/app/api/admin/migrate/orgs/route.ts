import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import { isMasterAdmin } from "@/lib/roles";

/**
 * POST /api/admin/migrate/orgs
 *
 * One-time migration: backfills existing orgs created before the lifecycle
 * system was introduced.
 *
 * - Sets `status: "active"` on orgs with no status
 * - Sets `ownerId` from `createdBy` where missing
 * - Upgrades creator's OrgMember to role: "owner"
 * - Initializes `stats.memberCount` from `members` array length
 *
 * Idempotent — safe to run multiple times.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isMasterAdmin((session.user as any).role)) {
      return NextResponse.json({ message: "Forbidden — master_admin only" }, { status: 403 });
    }

    await dbConnect();

    // Find orgs missing the new lifecycle fields
    const orgsToMigrate = await Org.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { ownerId: { $exists: false } },
      ],
    }).lean();

    let migrated = 0;
    let errors: string[] = [];

    for (const org of orgsToMigrate) {
      try {
        const o = org as any;
        await Org.updateOne(
          { _id: o._id },
          {
            $set: {
              status:               o.status || "active",
              ownerId:              o.ownerId || o.createdBy,
              "stats.memberCount":  (o.members || []).length,
            },
          }
        );

        // Upgrade creator's membership to owner
        if (o.createdBy) {
          await OrgMember.findOneAndUpdate(
            { userId: o.createdBy, orgId: o._id },
            { $set: { role: "owner", status: "active" } },
            { upsert: true }
          );
        }

        migrated++;
      } catch (err: any) {
        errors.push(`${(org as any)._id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      message:  `Migration complete. ${migrated} orgs updated.`,
      migrated,
      errors,
    });
  } catch (error: any) {
    console.error("[migrate/orgs]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
