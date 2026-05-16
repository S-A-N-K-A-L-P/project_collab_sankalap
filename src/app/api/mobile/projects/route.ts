import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";
import OrgMember from "@/models/OrgMember";

export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    const { proposalId, orgId, title, description, leadId } = await req.json();

    await dbConnect();

    const member = await OrgMember.findOne({ userId, orgId });
    if (!member || !["lead", "admin"].includes(member.role)) {
      return NextResponse.json({ message: "Insufficient permissions to initialize project" }, { status: 403 });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal || proposal.status !== "approved") {
      if (proposal?.totalVotes < 5) {
        return NextResponse.json({ message: "Proposal has not reached the threshold for project conversion" }, { status: 400 });
      }
    }

    const project = await Project.create({
      proposalId,
      orgId,
      title,
      description,
      lead: leadId || userId,
      members: [leadId || userId],
      status: "planning",
    });

    await Proposal.findByIdAndUpdate(proposalId, { stage: "setup", status: "active" });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PATCH /api/mobile/projects — update members, status, progress, lead
export async function PATCH(req: Request) {
  try {
    const session = getMobileSession(req);

    const { id, addMembers, removeMembers, status, progress, lead, githubRepo, techStack } = await req.json();
    if (!id) return NextResponse.json({ message: "Project ID required" }, { status: 400 });

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (status)   updates.status   = status;
    if (progress !== undefined) updates.progress = Math.min(100, Math.max(0, progress));
    if (lead)     updates.lead     = lead;
    if (githubRepo !== undefined) updates.githubRepo = githubRepo;
    if (techStack) updates.techStack = techStack;

    const updateOps: Record<string, unknown> = { $set: updates };
    if (addMembers?.length)    updateOps.$addToSet = { members: { $each: addMembers } };
    if (removeMembers?.length) updateOps.$pull     = { members: { $in: removeMembers } };

    const updated = await Project.findByIdAndUpdate(id, updateOps, { new: true })
      .populate("lead",  "name avatar role")
      .populate("orgId", "name slug");

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    await dbConnect();

    const query = orgId ? { orgId } : {};
    const projects = await Project.find(query)
      .populate("orgId", "name slug")
      .populate("lead", "name avatar")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(projects)));
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
