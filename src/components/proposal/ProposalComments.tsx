"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type CommentItem = {
  _id: string;
  proposalId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type ProposalCommentsProps = {
  proposalId: string;
};

type SessionLike = {
  user?: {
    id?: string;
  };
};

const MAX_COMMENT_LENGTH = 1000;

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown-time";
  return date.toLocaleString();
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function ProposalComments({ proposalId }: ProposalCommentsProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentUserId = useMemo(() => {
    return String((session as SessionLike | null)?.user?.id || "");
  }, [session]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/comments?proposalId=${proposalId}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch comments");
      }

      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to fetch comments"));
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

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
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to post comment");
      }

      setDraft("");
      await fetchComments();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to post comment"));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment: CommentItem) => {
    setEditingId(comment._id);
    setEditingDraft(comment.content);
  };

  const cancelEdit = () => {
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
      const res = await fetch(`/api/comments/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update comment");
      }

      setEditingId(null);
      setEditingDraft("");
      await fetchComments();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to update comment"));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    setDeletingId(commentId);
    setError("");

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete comment");
      }

      await fetchComments();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to delete comment"));
    } finally {
      setDeletingId(null);
    }
  };

  const canComment = status === "authenticated";

  return (
    <section className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 shadow-sm space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-[#e5e7eb]">Comments</h3>
        <p className="text-xs text-[#9ca3af]">Share your thoughts about this proposal.</p>
      </div>

      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={canComment ? "Write a comment..." : "Sign in to write a comment"}
          disabled={!canComment || submitting}
          maxLength={MAX_COMMENT_LENGTH}
          rows={4}
          className="w-full resize-y rounded-xl border border-[#1f1f23] bg-[#0f0f11] px-3 py-2 text-sm text-[#e5e7eb] outline-none focus:border-[#6366f1]/50 disabled:opacity-60"
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#9ca3af]">{draft.trim().length}/{MAX_COMMENT_LENGTH}</p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canComment || submitting || !draft.trim()}
            className="rounded-md border border-[#2a2a2f] bg-[#17171a] px-3 py-1.5 text-xs font-semibold text-[#e5e7eb] transition-colors hover:border-[#6366f1]/50 hover:text-[#6366f1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="space-y-3 border-t border-[#1f1f23] pt-4">
        {loading ? <p className="text-sm text-[#9ca3af]">Loading comments...</p> : null}

        {!loading && comments.length === 0 ? (
          <p className="text-sm text-[#9ca3af]">No comments yet. Be the first to comment.</p>
        ) : null}

        {!loading
          ? comments.map((comment) => {
              const isOwner = currentUserId && currentUserId === String(comment.authorId);
              const isEditing = editingId === comment._id;

              return (
                <article key={comment._id} className="rounded-xl border border-[#1f1f23] bg-[#0f0f11] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#e5e7eb]">{comment.authorName}</p>
                      <p className="text-[11px] text-[#9ca3af]">{formatTimestamp(comment.createdAt)}</p>
                    </div>

                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => startEdit(comment)}
                            className="text-xs text-[#9ca3af] hover:text-[#e5e7eb]"
                          >
                            Edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(comment._id)}
                          disabled={deletingId === comment._id}
                          className="text-xs text-[#9ca3af] hover:text-red-400 disabled:opacity-50"
                        >
                          {deletingId === comment._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {!isEditing ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#d1d5db]">{comment.content}</p>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={editingDraft}
                        onChange={(e) => setEditingDraft(e.target.value)}
                        rows={3}
                        maxLength={MAX_COMMENT_LENGTH}
                        className="w-full resize-y rounded-lg border border-[#1f1f23] bg-[#121214] px-3 py-2 text-sm text-[#e5e7eb] outline-none focus:border-[#6366f1]/50"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
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
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
