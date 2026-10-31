import React, { useState } from "react";
import { CommentNode } from "./types";
import { CommentForm } from "./CommentForm";

type CommentItemProps = {
    comment: CommentNode;
    depth?: number;
    maxDepth?: number;
    currentUserId: string;
    canInteract: boolean;
    onReply: (parentId: string, content: string) => Promise<void>;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onToggleVote: (commentId: string) => Promise<void>;
    voteLoadingId: string | null;
    deletingId: string | null;
};

function formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "unknown-time";
    return date.toLocaleString();
}

export function CommentItem({
    comment,
    depth = 1,
    maxDepth = 3,
    currentUserId,
    canInteract,
    onReply,
    onEdit,
    onDelete,
    onToggleVote,
    voteLoadingId,
    deletingId,
}: CommentItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

    const isOwner = currentUserId && currentUserId === comment.authorId;
    const canReply = depth < maxDepth;

    const handleReply = async (content: string) => {
        await onReply(comment._id, content);
        setIsReplying(false);
    };

    const handleEdit = async (content: string) => {
        await onEdit(comment._id, content);
        setIsEditing(false);
    };

    return (
        <div className={depth > 1 ? "ml-4 pl-4 border-l border-border-subtle" : ""}>
            <article className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                            <span className="text-[10px] text-muted">{formatTimestamp(comment.createdAt)}</span>
                            {comment.replyCount > 0 && (
                                <span className="text-[10px] text-accent">
                                    {comment.replyCount} repl{comment.replyCount === 1 ? "y" : "ies"}
                                </span>
                            )}
                        </div>

                        <div className="mt-2">
                            {isEditing ? (
                                <CommentForm
                                    initialContent={comment.content}
                                    onSubmit={handleEdit}
                                    buttonLabel="Save"
                                    onCancel={() => setIsEditing(false)}
                                    autoFocus
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--text-secondary)">
                                    {comment.content}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onToggleVote(comment._id)}
                        disabled={!canInteract || voteLoadingId === comment._id}
                        className={`flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${comment.hasVotedByCurrentUser
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
                            onClick={() => setIsReplying(!isReplying)}
                            disabled={!canInteract}
                            className="text-muted hover:text-foreground disabled:opacity-50"
                        >
                            Reply
                        </button>
                    ) : (
                        <span className="text-accent">Max depth reached</span>
                    )}

                    {isOwner && (
                        <>
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="text-muted hover:text-foreground"
                                >
                                    Edit
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onDelete(comment._id)}
                                disabled={deletingId === comment._id}
                                className="text-muted hover:text-red-400 disabled:opacity-50"
                            >
                                {deletingId === comment._id ? "Deleting..." : "Delete"}
                            </button>
                        </>
                    )}
                </div>

                {isReplying && (
                    <div className="mt-3 p-3 rounded-lg border border-border-subtle bg-surface-alt">
                        <CommentForm
                            onSubmit={handleReply}
                            placeholder="Write a reply..."
                            buttonLabel="Post Reply"
                            onCancel={() => setIsReplying(false)}
                            autoFocus
                        />
                    </div>
                )}
            </article>

            {comment.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                            currentUserId={currentUserId}
                            canInteract={canInteract}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleVote={onToggleVote}
                            voteLoadingId={voteLoadingId}
                            deletingId={deletingId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
