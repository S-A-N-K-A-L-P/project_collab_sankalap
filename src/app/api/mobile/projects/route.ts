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
