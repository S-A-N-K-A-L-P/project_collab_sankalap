import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const session = getMobileSession(req);

    const { proposalId, stage, status, projectLead } = await req.json();

    await dbConnect();

    const user = await User.findById(session.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    const isPixelHead = user.role === "pixel_head";
    const isProjectLead = user.projectLead?.toString() === user._id.toString();

    if (!isPixelHead && !isProjectLead) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

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
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
