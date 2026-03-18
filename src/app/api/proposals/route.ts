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

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, description, type, techStack } = await req.json();
    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();
    
    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Verify Ownership
    const user = await User.findOne({ email: session.user?.email });
    if (proposal.createdBy.toString() !== user?._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Not the creator" }, { status: 403 });
    }

    const updated = await Proposal.findByIdAndUpdate(
      id,
      { $set: { title, description, type, techStack } },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();

    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Verify Ownership
    const user = await User.findOne({ email: session.user?.email });
    if (proposal.createdBy.toString() !== user?._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Not the creator" }, { status: 403 });
    }

    await Proposal.findByIdAndDelete(id);

    // Optional: Delete associated activities
    await Activity.deleteMany({ targetId: id });

    return NextResponse.json({ message: "Proposal neutralized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
