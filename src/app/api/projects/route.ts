import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";
import OrgMember from "@/models/OrgMember";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { proposalId, orgId, title, description, leadId } = await req.json();
    const userId = (session.user as any).id;

    await dbConnect();

    // 1. Verify User is Lead/Admin in the Org
    const member = await OrgMember.findOne({ userId, orgId });
    if (!member || !["lead", "admin"].includes(member.role)) {
      return NextResponse.json({ message: "Insufficient permissions to initialize project" }, { status: 403 });
    }

    // 2. Validate Proposal Status
    const proposal = await Proposal.findById(proposalId);
    if (!proposal || proposal.status !== "approved") {
      // In a real system, you'd check if totalVotes exceeded threshold
      // For simplicity, we allow conversion if status is 'approved' or 'active' (with high votes)
      if (proposal?.totalVotes < 5) {
        return NextResponse.json({ message: "Proposal has not reached the threshold for project conversion" }, { status: 400 });
      }
    }

    // 3. Create Project
    const project = await Project.create({
      proposalId,
      orgId,
      title,
      description,
      lead: leadId || userId,
      members: [leadId || userId],
      status: "planning"
    });

    // 4. Update Proposal Stage
    await Proposal.findByIdAndUpdate(proposalId, { stage: "setup", status: "active" });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const id = searchParams.get("id");

    await dbConnect();

    if (id) {
      const project = await Project.findById(id)
        .populate("orgId", "name slug")
        .populate("lead", "name avatar")
        .populate("gitRepo")
        .lean();

      if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });
      return NextResponse.json(project);
    }

    const query = orgId ? { orgId } : {};
    const projects = await Project.find(query)
      .populate("orgId", "name slug")
      .populate("lead", "name avatar")
      .populate("gitRepo")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(projects)));
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
