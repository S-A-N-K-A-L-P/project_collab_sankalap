import { NextResponse } from "next/server";
import OrgMember from "@/models/OrgMember";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import { verifyNodeCall } from "@/lib/orgNode";
import { buildRoster, ROSTER_MAX_MEMBERS } from "@/lib/orgNodeCore";

type ProjectLean = { _id: unknown; proposalId?: unknown; lead?: unknown; members?: unknown[]; teamRoster?: { userId?: unknown; projectRole?: unknown; maxActiveTasks?: unknown }[] };

/**
 * GET /api/orgs/[slug]/node/roster — signed by the org's node, once per node start (admindashboard-syncro.md §5.5):
 * every member with org role, status and project seats, plus approved proposals that have no project yet.
 * Names and avatars only; never email, phone or tokens.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const call = await verifyNodeCall(req, slug);
  if (call instanceof NextResponse) return call;
  const orgId = call.org._id;

  const [memberships, projects, proposals] = await Promise.all([
    OrgMember.find({ orgId }).select("userId role status").limit(ROSTER_MAX_MEMBERS).lean<{ userId?: unknown; role?: string; status?: string }[]>(),
    Project.find({ orgId }).select("_id proposalId lead members teamRoster").limit(500).lean<ProjectLean[]>(),
    Proposal.find({ orgId, status: "approved" }).select("_id title techStack createdBy").sort({ updatedAt: -1 }).limit(100)
      .lean<{ _id: unknown; title?: string; techStack?: string[]; createdBy?: unknown }[]>(),
  ]);
  const users = await User.find({ _id: { $in: memberships.map((m) => m.userId) } }).select("name avatar role")
    .lean<{ _id: unknown; name?: string; avatar?: string; role?: string }[]>();

  const roster = buildRoster({
    orgId: String(orgId),
    now: new Date(),
    memberships,
    users: new Map(users.map((u) => [String(u._id), u])),
    projects,
    proposals,
    usedProposalIds: new Set(projects.map((p) => String(p.proposalId ?? "")).filter(Boolean)),
  });
  return NextResponse.json(roster, { headers: { "Cache-Control": "no-store" } });
}
