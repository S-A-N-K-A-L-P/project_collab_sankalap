import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import CommentVote from "@/models/CommentVote";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

const MAX_COMMENT_LENGTH = 1000;
const MAX_COMMENT_DEPTH = 3;

type CommentRecord = {
    _id: unknown;
    proposalId: unknown;
    parentCommentId?: unknown;
    authorId: unknown;
    authorName: string;
    content: string;
    voteCount?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

type SerializedComment = {
    _id: string;
    proposalId: string;
    parentCommentId: string | null;
    authorId: string;
    authorName: string;
    content: string;
    voteCount: number;
    replyCount: number;
    hasVotedByCurrentUser: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type ReplyMap = Record<string, SerializedComment[]>;

type SessionUser = {
    id?: string;
    email?: string | null;
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unexpected server error";
}

function toIdString(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (value && typeof (value as { toString?: () => string }).toString === "function") {
        return (value as { toString: () => string }).toString();
    }

    return "";
}

function serializeComment(
    comment: CommentRecord,
    hasVotedByCurrentUser: boolean,
    replyCount = 0
): SerializedComment {
    return {
        _id: toIdString(comment._id),
        proposalId: toIdString(comment.proposalId),
        parentCommentId: comment.parentCommentId ? toIdString(comment.parentCommentId) : null,
        authorId: toIdString(comment.authorId),
        authorName: comment.authorName,
        content: comment.content,
        voteCount: comment.voteCount ?? 0,
        replyCount,
        hasVotedByCurrentUser,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
        updatedAt: comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : comment.updatedAt,
    };
}

async function getCommentDepth(commentId: string, proposalId: string): Promise<number> {
    let depth = 1;
    let currentCommentId = commentId;

    while (currentCommentId) {
        const comment = await Comment.findById(currentCommentId)
            .select("proposalId parentCommentId")
            .lean<{ proposalId: unknown; parentCommentId?: unknown }>();

        if (!comment) {
            throw new Error("Parent comment not found");
        }

        if (toIdString(comment.proposalId) !== proposalId) {
            throw new Error("Parent comment must belong to the same proposal");
        }

        const parentCommentId = toIdString(comment.parentCommentId);
        if (!parentCommentId) {
            return depth;
        }

        depth += 1;
        currentCommentId = parentCommentId;
    }

    return depth;
}

function buildReplyMap(replies: SerializedComment[]): ReplyMap {
    return replies.reduce<ReplyMap>((accumulator, reply) => {
        const parentId = reply.parentCommentId;
        if (!parentId) {
            return accumulator;
        }

        if (!accumulator[parentId]) {
            accumulator[parentId] = [];
        }

        accumulator[parentId].push(reply);
        return accumulator;
    }, {});
}

function applyReplyCounts(
    comments: SerializedComment[],
    repliesByParent: ReplyMap
): { comments: SerializedComment[]; repliesByParent: ReplyMap } {
    const replyCounts = Object.fromEntries(
        Object.entries(repliesByParent).map(([parentId, replies]) => [parentId, replies.length])
    );

    const annotate = (items: SerializedComment[]): SerializedComment[] =>
        items.map((item) => ({
            ...item,
            replyCount: replyCounts[item._id] ?? 0,
            hasVotedByCurrentUser: item.hasVotedByCurrentUser,
        }));

    return {
        comments: annotate(comments),
        repliesByParent: Object.fromEntries(
            Object.entries(repliesByParent).map(([parentId, replies]) => [parentId, annotate(replies)])
        ),
    };
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

        const [topLevelComments, replyComments, session] = await Promise.all([
            Comment.find({ proposalId, parentCommentId: null })
                .sort({ createdAt: -1 })
                .select("_id proposalId parentCommentId authorId authorName content voteCount createdAt updatedAt")
                .lean<CommentRecord[]>(),
            Comment.find({ proposalId, parentCommentId: { $ne: null } })
                .sort({ createdAt: 1 })
                .select("_id proposalId parentCommentId authorId authorName content voteCount createdAt updatedAt")
                .lean<CommentRecord[]>(),
            getServerSession(authOptions),
        ]);

        const currentUserId = (session?.user as SessionUser | undefined)?.id || "";

        const allComments = [...topLevelComments, ...replyComments];
        const allCommentIds = allComments.map((comment) => toIdString(comment._id)).filter(Boolean);

        const votedCommentIds = currentUserId && allCommentIds.length > 0
            ? await CommentVote.find({
                userId: currentUserId,
                commentId: { $in: allCommentIds },
            })
                .select("commentId")
                .lean<{ commentId: unknown }[]>()
            : [];

        const votedCommentIdSet = new Set(votedCommentIds.map((vote) => toIdString(vote.commentId)));

        const serializedTopLevel = topLevelComments.map((comment) =>
            serializeComment(comment, votedCommentIdSet.has(toIdString(comment._id)))
        );
        const serializedReplies = replyComments.map((comment) =>
            serializeComment(comment, votedCommentIdSet.has(toIdString(comment._id)))
        );

        const repliesByParent = buildReplyMap(serializedReplies);
        const annotated = applyReplyCounts(serializedTopLevel, repliesByParent);

        return NextResponse.json({
            comments: annotated.comments,
            repliesByParent: annotated.repliesByParent,
        });
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
        const parentCommentId = String(payload?.parentCommentId || "").trim();

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

        let resolvedParentCommentId: string | null = null;
        if (parentCommentId) {
            if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
                return NextResponse.json({ error: "Invalid parentCommentId" }, { status: 400 });
            }

            const parentDepth = await getCommentDepth(parentCommentId, proposalId);
            if (parentDepth >= MAX_COMMENT_DEPTH) {
                return NextResponse.json({ error: "Maximum reply depth is 3" }, { status: 400 });
            }

            resolvedParentCommentId = parentCommentId;
        }

        const comment = await Comment.create({
            proposalId,
            authorId: user._id,
            authorName: user.name,
            content,
            parentCommentId: resolvedParentCommentId,
            voteCount: 0,
        });

        await Proposal.findByIdAndUpdate(proposalId, { $inc: { commentsCount: 1 } });

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) || "Failed to create comment" }, { status: 500 });
    }
}
