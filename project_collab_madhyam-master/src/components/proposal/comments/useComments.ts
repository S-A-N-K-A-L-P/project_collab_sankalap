import { useCallback, useEffect, useState } from "react";
import { CommentItem, CommentsResponse } from "./types";

const MAX_COMMENT_LENGTH = 1000;

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
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

export function useComments(proposalId: string) {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [repliesByParent, setRepliesByParent] = useState<Record<string, CommentItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const handleCreate = async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed) return;
        if (trimmed.length > MAX_COMMENT_LENGTH) {
            throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
        }

        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proposalId, content: trimmed }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to post comment");
            }

            await fetchComments();
        } catch (caughtError: unknown) {
            const msg = getErrorMessage(caughtError, "Failed to post comment");
            setError(msg);
            throw caughtError;
        }
    };

    const handleReply = async (parentCommentId: string, content: string) => {
        const trimmed = content.trim();
        if (!trimmed) return;

        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proposalId, content: trimmed, parentCommentId }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to post reply");
            }

            await fetchComments();
        } catch (caughtError: unknown) {
            const msg = getErrorMessage(caughtError, "Failed to post reply");
            setError(msg);
            throw caughtError;
        }
    };

    const handleEdit = async (commentId: string, content: string) => {
        const trimmed = content.trim();
        if (!trimmed) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to update comment");
            }

            await fetchComments();
        } catch (caughtError: unknown) {
            const msg = getErrorMessage(caughtError, "Failed to update comment");
            setError(msg);
            throw caughtError;
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to delete comment");
            }

            await fetchComments();
        } catch (caughtError: unknown) {
            const msg = getErrorMessage(caughtError, "Failed to delete comment");
            setError(msg);
            throw caughtError;
        }
    };

    const handleToggleVote = async (commentId: string) => {
        try {
            const response = await fetch("/api/comments/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            const data = (await response.json()) as { error?: string; voteCount?: number; hasVoted?: boolean };

            if (!response.ok) {
                throw new Error(data?.error || "Failed to update vote");
            }

            const nextVoteCount = typeof data?.voteCount === "number" ? data.voteCount : null;
            const hasVoted = Boolean(data?.hasVoted);

            if (nextVoteCount !== null) {
                const applyVoteUpdate = (item: CommentItem): CommentItem =>
                    item._id === commentId
                        ? { ...item, voteCount: nextVoteCount, hasVotedByCurrentUser: hasVoted }
                        : item;

                setComments((current) => updateCommentCollection(current, repliesByParent, commentId, applyVoteUpdate).comments);
                setRepliesByParent((current) => updateCommentCollection(comments, current, commentId, applyVoteUpdate).repliesByParent);
            }

            void fetchComments();
        } catch (caughtError: unknown) {
            setError(getErrorMessage(caughtError, "Failed to update vote"));
        }
    };

    return {
        comments,
        repliesByParent,
        loading,
        error,
        setError,
        handleCreate,
        handleReply,
        handleEdit,
        handleDelete,
        handleToggleVote,
        fetchComments,
    };
}
