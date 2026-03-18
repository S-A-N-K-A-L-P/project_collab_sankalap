import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    await dbConnect();
    
    const query = userId ? { createdBy: userId } : {};
    const proposals = await Proposal.find(query)
      .populate("createdBy", "name avatar role universityName")
      .sort({ createdAt: -1 });

    return NextResponse.json(proposals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, type, techStack } = await req.json();

    await dbConnect();

    const user = await User.findOne({ email: session.user?.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const proposal = await Proposal.create({
      title,
      description,
      type,
      techStack,
      createdBy: user._id,
      stage: "proposal",
      status: "proposal",
    });

    // Record Activity
    await Activity.create({
      actorId: user._id,
      type: "CREATE_PROPOSAL",
      targetId: proposal._id,
      targetType: "PROPOSAL",
      metadata: { title: proposal.title }
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    console.error("PROPOSAL_CREATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
