import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

const MAX_COMMENT_LENGTH = 1000;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
    }

    const payload = await req.json();
    const content = String(payload?.content || "").trim();

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

    const [comment, user] = await Promise.all([
      Comment.findById(commentId),
      User.findOne({ email: session.user?.email }).select("_id name"),
    ]);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (comment.authorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    comment.content = content;
    await comment.save();

    return NextResponse.json({ comment });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
    }

    await dbConnect();

    const [comment, user] = await Promise.all([
      Comment.findById(commentId),
      User.findOne({ email: session.user?.email }).select("_id"),
    ]);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (comment.authorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Comment.findByIdAndDelete(commentId);

    await Proposal.findByIdAndUpdate(comment.proposalId, { $inc: { commentsCount: -1 } });
    await Proposal.updateOne(
      { _id: comment.proposalId, commentsCount: { $lt: 0 } },
      { $set: { commentsCount: 0 } }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "Failed to delete comment" }, { status: 500 });
  }
}
