/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose lean documents are runtime-shaped at this API boundary. */
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";
import OrgMember from "@/models/OrgMember";
import Task from "@/models/Task";
import User from "@/models/User";
import { idOf, lastActivityByProject, loadProjectTasks, projectSummary } from "@/lib/projectMobileView";

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
    if (searchParams.get("view") === "mine") return mineView(req);
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

/**
 * GET /api/mobile/projects?view=mine — the signed-in member's projects (lead, member, mentor or
 * task assignee) with metrics computed from their tasks. Shape: { projects: [...] }.
 * (The plain GET above keeps its old array shape for existing clients.)
 */
async function mineView(req: Request) {
  let session;
  try {
    session = getMobileSession(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
    void User; // registers the model for populate() on cold start
    const assignedProjectIds = (await Task.distinct("projectId", { assignedTo: session.id })) as string[];
    const projects = (await Project.find({
      $or: [
        { lead: session.id },
        { members: session.id },
        { mentorIds: session.id },
        { _id: { $in: assignedProjectIds.filter((x) => /^[a-f0-9]{24}$/i.test(String(x))) } },
      ],
    })
      .populate("lead", "name avatar")
      .populate("members", "name avatar")
      .sort({ updatedAt: -1 })
      .lean()) as any[];

    const ids = projects.map((p) => idOf(p));
    const [tasks, lastByProject] = await Promise.all([loadProjectTasks(ids), lastActivityByProject(ids)]);
    const nowMs = Date.now();
    return NextResponse.json({
      now: new Date(nowMs).toISOString(),
      projects: projects.map((p) =>
        projectSummary(p, tasks.filter((t) => String(t.projectId) === idOf(p)), nowMs, lastByProject.get(idOf(p)))
      ),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
