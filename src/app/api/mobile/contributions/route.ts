import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import Project from "@/models/Project";
import OrgMember from "@/models/OrgMember";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId, type, description, media } = await req.json();
    const userId = (session.user as any).id;

    await dbConnect();

    // 1. Verify Project Membership/Access
    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

    // 2. Create Contribution Record (Pending Verification)
    const contribution = await Contribution.create({
      projectId,
      userId,
      type,
      description,
      media,
      status: "pending"
    });

    // 3. Log Activity
    await Activity.create({
        actorId: userId,
        type: "JOIN", // We'll use JOIN as a generic placeholder or add 'CONTRIBUTE'
        targetId: projectId,
        targetType: "PROPOSAL", // Project is bound to proposal
        metadata: { title: project.title, contributionType: type }
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    // This is the VERIFICATION API
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id, status } = await req.json(); // id: contribution ID, status: approved | rejected
        const verifierId = (session.user as any).id;

        await dbConnect();

        const contribution = await Contribution.findById(id);
        if (!contribution) return NextResponse.json({ message: "Contribution not found" }, { status: 404 });

        const project = await Project.findById(contribution.projectId);
        
        // Only Project Lead or Org Admin can verify
        const member = await OrgMember.findOne({ userId: verifierId, orgId: project?.orgId });
        const isLead = project?.lead.toString() === verifierId;
        const isAdmin = member?.role === "admin";

        if (!isLead && !isAdmin) {
            return NextResponse.json({ message: "Insufficient permissions to verify" }, { status: 403 });
        }

        contribution.status = status;
        contribution.verifiedBy = verifierId;
        await contribution.save();

        // 4. Reputation Update on Approval
        if (status === "approved") {
            await User.findByIdAndUpdate(contribution.userId, { $inc: { reputation: 10 } });
            
            // Progress Update Logic (Simplified)
            const approvedCount = await Contribution.countDocuments({ projectId: project?._id, status: "approved" });
            const progress = Math.min(approvedCount * 5, 100); // 20 contributions = 100%
            await Project.findByIdAndUpdate(project?._id, { progress });
        }

        return NextResponse.json(contribution);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        
        await dbConnect();
        
        const query = projectId ? { projectId } : {};
        const contributions = await Contribution.find(query)
            .populate("userId", "name avatar")
            .populate("verifiedBy", "name")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(contributions)));
    } catch (error) {
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
