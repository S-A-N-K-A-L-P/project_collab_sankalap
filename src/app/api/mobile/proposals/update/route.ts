import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { proposalId, stage, status, projectLead } = await req.json();

    await dbConnect();

    const user = await User.findOne({ email: session.user?.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Check permissions
    const isPixelHead = user.role === "pixel_head";
    const isProjectLead = user.projectLead?.toString() === user._id.toString();

    if (!isPixelHead && !isProjectLead) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Role-based updates
    if (stage && (isPixelHead || isProjectLead)) {
      proposal.stage = stage;
    }

    if (status && isPixelHead) {
      proposal.status = status;
    }

    if (projectLead && isPixelHead) {
      proposal.projectLead = projectLead;
    }

    await proposal.save();

    return NextResponse.json(proposal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
