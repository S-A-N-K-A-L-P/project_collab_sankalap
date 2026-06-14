import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import CommentVote from "@/models/CommentVote";
import User from "@/models/User";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unexpected server error";
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();
        const commentId = String(payload?.commentId || "").trim();

        if (!commentId) {
            return NextResponse.json({ error: "commentId is required" }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
        }

        await dbConnect();

        const [user, comment] = await Promise.all([
            User.findOne({ email: session.user?.email }).select("_id"),
            Comment.findById(commentId).select("_id voteCount"),
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        const existingVote = await CommentVote.findOne({ userId: user._id, commentId }).select("_id");

        if (existingVote) {
            await Promise.all([
                CommentVote.deleteOne({ _id: existingVote._id }),
                Comment.findByIdAndUpdate(commentId, { $inc: { voteCount: -1 } }),
            ]);

            const updatedComment = await Comment.findById(commentId).select("voteCount").lean<{ voteCount?: number }>();
            const voteCount = Math.max(updatedComment?.voteCount ?? 0, 0);

            if (updatedComment && updatedComment.voteCount !== voteCount) {
                await Comment.findByIdAndUpdate(commentId, { $set: { voteCount } });
            }

            return NextResponse.json({ voteCount, hasVoted: false });
        }

        await Promise.all([
            CommentVote.create({ userId: user._id, commentId }),
            Comment.findByIdAndUpdate(commentId, { $inc: { voteCount: 1 } }),
        ]);

        const updatedComment = await Comment.findById(commentId).select("voteCount").lean<{ voteCount?: number }>();
        const voteCount = Math.max(updatedComment?.voteCount ?? 1, 0);

        if (updatedComment && updatedComment.voteCount !== voteCount) {
            await Comment.findByIdAndUpdate(commentId, { $set: { voteCount } });
        }

        return NextResponse.json({ voteCount, hasVoted: true });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}