import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

const MAX_COMMENT_LENGTH = 1000;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = String(searchParams.get("proposalId") || "").trim();

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(proposalId)) {
      return NextResponse.json({ error: "Invalid proposalId" }, { status: 400 });
    }

    await dbConnect();

    const comments = await Comment.find({ proposalId })
      .sort({ createdAt: -1 })
      .select("_id proposalId authorId authorName content createdAt updatedAt")
      .lean();

    return NextResponse.json({ comments });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const proposalId = String(payload?.proposalId || "").trim();
    const content = String(payload?.content || "").trim();

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(proposalId)) {
      return NextResponse.json({ error: "Invalid proposalId" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    await dbConnect();

    const [proposal, user] = await Promise.all([
      Proposal.findById(proposalId).select("_id"),
      User.findOne({ email: session.user?.email }).select("_id name"),
    ]);

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const comment = await Comment.create({
      proposalId,
      authorId: user._id,
      authorName: user.name,
      content,
    });

    await Proposal.findByIdAndUpdate(proposalId, { $inc: { commentsCount: 1 } });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "Failed to create comment" }, { status: 500 });
  }
}
