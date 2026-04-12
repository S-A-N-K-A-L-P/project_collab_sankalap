"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type CommentItem = {
    _id: string;
    proposalId: string;
    parentCommentId: string | null;
    authorId: string;
    authorName: string;
    content: string;
    voteCount: number;
    replyCount: number;
    hasVotedByCurrentUser: boolean;
    createdAt: string;
    updatedAt: string;
};

type CommentNode = CommentItem & {
    replies: CommentNode[];
};

type ProposalCommentsProps = {
    proposalId: string;
};

type CommentsResponse = {
    comments?: CommentItem[];
    repliesByParent?: Record<string, CommentItem[]>;
};

type SessionLike = {
    user?: {
        id?: string;
    };
};

const MAX_COMMENT_LENGTH = 1000;
const MAX_COMMENT_DEPTH = 3;

function formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "unknown-time";
    }

    return date.toLocaleString();
}

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

function buildCommentTree(comments: CommentItem[], repliesByParent: Record<string, CommentItem[]>): CommentNode[] {
    return comments.map((comment) => ({
        ...comment,
        replies: buildCommentTree(repliesByParent[comment._id] || [], repliesByParent),
    }));
}

function updateCommentCollection(
    comments: CommentItem[],
    repliesByParent: Record<string, CommentItem[]>,
    commentId: string,
    updater: (comment: CommentItem) => CommentItem
): { comments: CommentItem[]; repliesByParent: Record<string, CommentItem[]> } {
    const updateList = (items: CommentItem[]): CommentItem[] =>
        items.map((item) => {
            const updatedItem = item._id === commentId ? updater(item) : item;
            const replies = repliesByParent[updatedItem._id] || [];

            return {
                ...updatedItem,
                replyCount: replies.length,
            };
        });

    const nextRepliesByParent = Object.fromEntries(
        Object.entries(repliesByParent).map(([parentId, replies]) => [
            parentId,
            replies.map((item) => (item._id === commentId ? updater(item) : item)),
        ])
    );

    return {
        comments: updateList(comments),
        repliesByParent: nextRepliesByParent,
    };
}

export default function ProposalComments({ proposalId }: ProposalCommentsProps) {
    const { data: session, status } = useSession();
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [repliesByParent, setRepliesByParent] = useState<Record<string, CommentItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [draft, setDraft] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingDraft, setEditingDraft] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [replySubmitting, setReplySubmitting] = useState(false);

    const [voteLoadingId, setVoteLoadingId] = useState<string | null>(null);

    const currentUserId = useMemo(() => {
        return String((session?.user as SessionLike | undefined)?.id || "");
    }, [session]);

    const commentTree = useMemo(() => buildCommentTree(comments, repliesByParent), [comments, repliesByParent]);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/comments?proposalId=${proposalId}`, { cache: "no-store" });
            const data = (await response.json()) as CommentsResponse & { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to fetch comments");
            }

            setComments(Array.isArray(data.comments) ? data.comments : []);
            setRepliesByParent(data.repliesByParent && typeof data.repliesByParent === "object" ? data.repliesByParent : {});
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to fetch comments"));
        } finally {
            setLoading(false);
        }
    }, [proposalId]);

    useEffect(() => {
        void fetchComments();
    }, [fetchComments]);

    const canInteract = status === "authenticated";

    const handleCreate = async () => {
        const content = draft.trim();
        if (!content) return;
        if (content.length > MAX_COMMENT_LENGTH) {
            setError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proposalId, content }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to post comment");
            }

            setDraft("");
            await fetchComments();
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to post comment"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartReply = (commentId: string) => {
        setActiveReplyId((current) => (current === commentId ? null : commentId));
        setReplyDraft("");
        setError("");
    };

    const handleCancelReply = () => {
        setActiveReplyId(null);
        setReplyDraft("");
    };

    const handleSubmitReply = async () => {
        if (!activeReplyId) return;

        const content = replyDraft.trim();
        if (!content) return;
        if (content.length > MAX_COMMENT_LENGTH) {
            setError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
            return;
        }

        setReplySubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proposalId, content, parentCommentId: activeReplyId }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to post reply");
            }

            setActiveReplyId(null);
            setReplyDraft("");
            await fetchComments();
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to post reply"));
        } finally {
            setReplySubmitting(false);
        }
    };

    const handleStartEdit = (comment: CommentItem) => {
        setEditingId(comment._id);
        setEditingDraft(comment.content);
        setActiveReplyId(null);
        setReplyDraft("");
        setError("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingDraft("");
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        const content = editingDraft.trim();
        if (!content) return;
        if (content.length > MAX_COMMENT_LENGTH) {
            setError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
            return;
        }

        setSavingEdit(true);
        setError("");

        try {
            const response = await fetch(`/api/comments/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to update comment");
            }

            setEditingId(null);
            setEditingDraft("");
            await fetchComments();
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to update comment"));
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return;

        setDeletingId(commentId);
        setError("");

        try {
            const response = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to delete comment");
            }

            if (activeReplyId === commentId) {
                setActiveReplyId(null);
                setReplyDraft("");
            }

            if (editingId === commentId) {
                setEditingId(null);
                setEditingDraft("");
            }

            await fetchComments();
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to delete comment"));
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleVote = async (commentId: string) => {
        if (!canInteract) return;

        setVoteLoadingId(commentId);
        setError("");

        try {
            const response = await fetch("/api/comments/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to update vote");
            }

            const nextVoteCount = typeof data?.voteCount === "number" ? data.voteCount : null;
            const hasVoted = Boolean(data?.hasVoted);

            if (nextVoteCount !== null) {
                const applyVoteUpdate = (item: CommentItem): CommentItem =>
                    item._id === commentId
                        ? {
                              ...item,
                              voteCount: nextVoteCount,
                              hasVotedByCurrentUser: hasVoted,
                          }
                        : item;

                setComments((currentComments) => updateCommentCollection(currentComments, repliesByParent, commentId, applyVoteUpdate).comments);
                setRepliesByParent((currentReplies) => updateCommentCollection(comments, currentReplies, commentId, applyVoteUpdate).repliesByParent);
            }

            void fetchComments();
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to update vote"));
        } finally {
            setVoteLoadingId(null);
        }
    };

    const renderComment = (comment: CommentNode, depth = 1): JSX.Element => {
        const isOwner = currentUserId && currentUserId === comment.authorId;
        const isEditing = editingId === comment._id;
        const isReplying = activeReplyId === comment._id;
        const canReply = depth < MAX_COMMENT_DEPTH;

        return (
            <div key={comment._id} className={depth > 1 ? "ml-4 pl-4 border-l border-[#1f1f23]" : ""}>
                <article className="rounded-xl border border-[#1f1f23] bg-[#0f0f11] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-[#e5e7eb]">{comment.authorName}</p>
                                <span className="text-[10px] text-[#9ca3af]">{formatTimestamp(comment.createdAt)}</span>
                                {comment.replyCount > 0 ? (
                                    <span className="text-[10px] text-[#6366f1]">{comment.replyCount} repl{comment.replyCount === 1 ? "y" : "ies"}</span>
                                ) : null}
                            </div>
                            <div className="mt-2">
                                {!isEditing ? (
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#d1d5db]">{comment.content}</p>
                                ) : (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editingDraft}
                                            onChange={(event) => setEditingDraft(event.target.value)}
                                            rows={3}
                                            maxLength={MAX_COMMENT_LENGTH}
                                            className="w-full resize-y rounded-lg border border-[#1f1f23] bg-[#121214] px-3 py-2 text-sm text-[#e5e7eb] outline-none focus:border-[#6366f1]/50"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={savingEdit}
                                                className="text-xs text-[#9ca3af] hover:text-[#e5e7eb] disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveEdit}
                                                disabled={savingEdit || !editingDraft.trim()}
                                                className="rounded-md border border-[#2a2a2f] bg-[#17171a] px-3 py-1 text-xs font-semibold text-[#e5e7eb] hover:border-[#6366f1]/50 hover:text-[#6366f1] disabled:opacity-50"
                                            >
                                                {savingEdit ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleToggleVote(comment._id)}
                            disabled={!canInteract || voteLoadingId === comment._id}
                            className={`flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                comment.hasVotedByCurrentUser
                                    ? "border-[#6366f1]/50 bg-[#6366f1]/10 text-[#e5e7eb]"
                                    : "border-[#2a2a2f] text-[#9ca3af] hover:border-[#6366f1]/50 hover:text-[#e5e7eb]"
                            } disabled:opacity-50`}
                        >
                            <span>👍</span>
                            <span>{comment.voteCount}</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        {canReply ? (
                            <button
                                type="button"
                                onClick={() => handleStartReply(comment._id)}
                                disabled={!canInteract}
                                className="text-[#9ca3af] hover:text-[#e5e7eb] disabled:opacity-50"
                            >
                                Reply
                            </button>
                        ) : (
                            <span className="text-[#6366f1]">Max depth reached</span>
                        )}

                        {isOwner ? (
                            <>
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(comment)}
                                        className="text-[#9ca3af] hover:text-[#e5e7eb]"
                                    >
                                        Edit
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => handleDelete(comment._id)}
                                    disabled={deletingId === comment._id}
                                    className="text-[#9ca3af] hover:text-red-400 disabled:opacity-50"
                                >
                                    {deletingId === comment._id ? "Deleting..." : "Delete"}
                                </button>
                            </>
                        ) : null}
                    </div>

                    {isReplying ? (
                        <div className="space-y-2 rounded-lg border border-[#1f1f23] bg-[#121214] p-3">
                            <textarea
                                value={replyDraft}
                                onChange={(event) => setReplyDraft(event.target.value)}
                                rows={3}
                                maxLength={MAX_COMMENT_LENGTH}
                                placeholder="Write a reply..."
                                className="w-full resize-y rounded-lg border border-[#1f1f23] bg-[#0f0f11] px-3 py-2 text-sm text-[#e5e7eb] outline-none focus:border-[#6366f1]/50"
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancelReply}
                                    disabled={replySubmitting}
                                    className="text-xs text-[#9ca3af] hover:text-[#e5e7eb] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitReply}
                                    disabled={replySubmitting || !replyDraft.trim()}
                                    className="rounded-md border border-[#2a2a2f] bg-[#17171a] px-3 py-1 text-xs font-semibold text-[#e5e7eb] hover:border-[#6366f1]/50 hover:text-[#6366f1] disabled:opacity-50"
                                >
                                    {replySubmitting ? "Posting..." : "Post Reply"}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </article>

                {comment.replies.length > 0 ? (
                    <div className="mt-3 space-y-3">
                        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <section className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 shadow-sm space-y-5">
            <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-[#e5e7eb]">Comments</h3>
                <p className="text-xs text-[#9ca3af]">Share your thoughts about this proposal.</p>
            </div>

            <div className="space-y-2">
                <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={canInteract ? "Write a comment..." : "Sign in to write a comment"}
                    disabled={!canInteract || submitting}
                    maxLength={MAX_COMMENT_LENGTH}
                    rows={4}
                    className="w-full resize-y rounded-xl border border-[#1f1f23] bg-[#0f0f11] px-3 py-2 text-sm text-[#e5e7eb] outline-none focus:border-[#6366f1]/50 disabled:opacity-60"
                />
                <div className="flex items-center justify-between">
                    <p className="text-[11px] text-[#9ca3af]">
                        {draft.trim().length}/{MAX_COMMENT_LENGTH}
                    </p>
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!canInteract || submitting || !draft.trim()}
                        className="rounded-md border border-[#2a2a2f] bg-[#17171a] px-3 py-1.5 text-xs font-semibold text-[#e5e7eb] transition-colors hover:border-[#6366f1]/50 hover:text-[#6366f1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="space-y-4 border-t border-[#1f1f23] pt-4">
                {loading ? <p className="text-sm text-[#9ca3af]">Loading comments...</p> : null}

                {!loading && commentTree.length === 0 ? (
                    <p className="text-sm text-[#9ca3af]">No comments yet. Be the first to comment.</p>
                ) : null}

                {!loading ? commentTree.map((comment) => renderComment(comment)) : null}
            </div>
        </section>
    );
}