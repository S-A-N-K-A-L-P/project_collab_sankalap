"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useComments } from "./comments/useComments";
import { CommentForm } from "./comments/CommentForm";
import { CommentItem } from "./comments/CommentItem";
import { CommentNode, CommentItem as CommentItemType, UserLike } from "./comments/types";

type ProposalCommentsProps = {
    proposalId: string;
};

function buildCommentTree(comments: CommentItemType[], repliesByParent: Record<string, CommentItemType[]>): CommentNode[] {
    return comments.map((comment) => ({
        ...comment,
        replies: buildCommentTree(repliesByParent[comment._id] || [], repliesByParent),
    }));
}

export default function ProposalComments({ proposalId }: ProposalCommentsProps) {
    const { data: session, status } = useSession();
    const {
        comments,
        repliesByParent,
        loading,
        error,
        handleCreate,
        handleReply,
        handleEdit,
        handleDelete,
        handleToggleVote,
    } = useComments(proposalId);

    const [voteLoadingId, setVoteLoadingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const currentUserId = useMemo(() => {
        return String((session?.user as UserLike | undefined)?.id || "");
    }, [session]);

    const commentTree = useMemo(() => buildCommentTree(comments, repliesByParent), [comments, repliesByParent]);
    const canInteract = status === "authenticated";

    const wrapAction = async (action: () => Promise<void>, loadingSetter: (val: string | null) => void, id: string) => {
        loadingSetter(id);
        try {
            await action();
        } finally {
            loadingSetter(null);
        }
    };

    return (
        <section id="comments" className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-6">
            <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground italic uppercase">Field Notes / Transmission</h3>
                <p className="text-xs text-muted font-mono tracking-wider uppercase">Secure peer-to-peer communication channel initialized.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-alt/30 border border-border-subtle/50">
                <CommentForm
                    onSubmit={handleCreate}
                    disabled={!canInteract}
                    placeholder={canInteract ? "Initialize entry..." : "Authentication required for transmission"}
                    buttonLabel="Broadcast"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
                    <span className="font-bold mr-2">[ERROR_SIGNAL]:</span> {error}
                </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border-subtle">
                {loading && (
                    <div className="flex items-center gap-3 text-sm text-muted animate-pulse font-mono">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <span>Acquiring signal...</span>
                    </div>
                )}

                {!loading && commentTree.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                        <p className="text-sm text-muted italic">Signal is silent. Be the first to broadcast.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {commentTree.map((comment) => (
                            <CommentItem
                                key={comment._id}
                                comment={comment}
                                currentUserId={currentUserId}
                                canInteract={canInteract}
                                onReply={handleReply}
                                onEdit={handleEdit}
                                onDelete={(id) => wrapAction(() => handleDelete(id), setDeletingId, id)}
                                onToggleVote={(id) => wrapAction(() => handleToggleVote(id), setVoteLoadingId, id)}
                                voteLoadingId={voteLoadingId}
                                deletingId={deletingId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}