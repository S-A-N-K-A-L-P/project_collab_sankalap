import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";

/**
 * One-time migration route — fixes documents that predate field defaults.
 * Only callable by master_admin.
 * GET /api/admin/migrate  → dry run (shows counts)
 * POST /api/admin/migrate → executes fixes
 */

function isMaster(s: any) {
  return s?.user?.role === "master_admin";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isMaster(session)) {
      return NextResponse.json({ error: "master_admin only" }, { status: 403 });
    }
    await dbConnect();

    const [
      usersNeedingSkills,
      usersNeedingFollowers,
      usersNeedingFollowing,
      usersNeedingReputation,
      projectsNeedingShowcase,
      projectsNeedingMarketplace,
    ] = await Promise.all([
      User.countDocuments({ skills:     { $exists: false } }),
      User.countDocuments({ followers:  { $exists: false } }),
      User.countDocuments({ following:  { $exists: false } }),
      User.countDocuments({ reputation: { $exists: false } }),
      Project.countDocuments({ "showcase":    { $exists: false } }),
      Project.countDocuments({ "marketplace": { $exists: false } }),
    ]);

    return NextResponse.json({
      dryRun: true,
      users: {
        missingSkills:     usersNeedingSkills,
        missingFollowers:  usersNeedingFollowers,
        missingFollowing:  usersNeedingFollowing,
        missingReputation: usersNeedingReputation,
      },
      projects: {
        missingShowcase:    projectsNeedingShowcase,
        missingMarketplace: projectsNeedingMarketplace,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!isMaster(session)) {
      return NextResponse.json({ error: "master_admin only" }, { status: 403 });
    }
    await dbConnect();

    // ── Fix User documents ────────────────────────────────────────────────
    const [r1, r2, r3, r4] = await Promise.all([
      User.updateMany(
        { skills:     { $exists: false } },
        { $set: { skills: [] } }
      ),
      User.updateMany(
        { followers:  { $exists: false } },
        { $set: { followers: [] } }
      ),
      User.updateMany(
        { following:  { $exists: false } },
        { $set: { following: [] } }
      ),
      User.updateMany(
        { reputation: { $exists: false } },
        { $set: { reputation: 0 } }
      ),
    ]);

    // Also fill nulls (not just missing)
    const [r5, r6, r7, r8] = await Promise.all([
      User.updateMany({ skills:     null }, { $set: { skills: [] } }),
      User.updateMany({ followers:  null }, { $set: { followers: [] } }),
      User.updateMany({ following:  null }, { $set: { following: [] } }),
      User.updateMany({ reputation: null }, { $set: { reputation: 0 } }),
    ]);

    // ── Fix Project documents ─────────────────────────────────────────────
    const [p1, p2] = await Promise.all([
      Project.updateMany(
        { "showcase": { $exists: false } },
        { $set: { showcase: { isPublic: true, caseStudyOptIn: false, featured: false } } }
      ),
      Project.updateMany(
        { "marketplace": { $exists: false } },
        { $set: { marketplace: { forSale: false, licenseType: "", priceINR: 0, contactEmail: "", inquiriesCount: 0 } } }
      ),
    ]);

    // ── Fix Proposal documents (techStack null → []) ──────────────────────
    const propFix = await Proposal.updateMany(
      { techStack: { $in: [null, undefined] } },
      { $set: { techStack: [] } }
    );

    return NextResponse.json({
      ok: true,
      users: {
        skillsFixed:     (r1.modifiedCount || 0) + (r5.modifiedCount || 0),
        followersFixed:  (r2.modifiedCount || 0) + (r6.modifiedCount || 0),
        followingFixed:  (r3.modifiedCount || 0) + (r7.modifiedCount || 0),
        reputationFixed: (r4.modifiedCount || 0) + (r8.modifiedCount || 0),
      },
      projects: {
        showcaseFixed:    p1.modifiedCount || 0,
        marketplaceFixed: p2.modifiedCount || 0,
      },
      proposals: {
        techStackFixed: propFix.modifiedCount || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
