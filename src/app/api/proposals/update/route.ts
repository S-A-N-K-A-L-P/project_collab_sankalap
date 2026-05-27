import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const isAdmin = user.role === "master_admin" || user.role === "sankalp_associate";

    if (!isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Both associate and master_admin can update stage
    if (stage) {
      proposal.stage = stage;
    }

    // Both can set status and assign project lead
    if (status) {
      proposal.status = status;
    }

    if (projectLead) {
      proposal.projectLead = projectLead;
    }

    await proposal.save();

    return NextResponse.json(proposal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
