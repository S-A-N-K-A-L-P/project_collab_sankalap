import React, { useState } from "react";

type CommentFormProps = {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    disabled?: boolean;
    buttonLabel?: string;
    onCancel?: () => void;
    autoFocus?: boolean;
    maxLength?: number;
    initialContent?: string;
};

export function CommentForm({
    onSubmit,
    placeholder = "Write a comment...",
    disabled = false,
    buttonLabel = "Post Comment",
    onCancel,
    autoFocus = false,
    maxLength = 1000,
    initialContent = "",
}: CommentFormProps) {
    const [content, setContent] = useState(initialContent);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit(trimmed);
            setContent("");
        } catch (error) {
            console.error("Form submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={disabled || submitting}
                autoFocus={autoFocus}
                rows={3}
                maxLength={maxLength}
                className="w-full resize-y rounded-xl border border-border-subtle bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50 disabled:opacity-60"
            />
            <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted">
                    {content.length}/{maxLength}
                </p>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={submitting}
                            className="text-xs text-muted hover:text-foreground disabled:opacity-50 px-2"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={disabled || submitting || !content.trim()}
                        className="rounded-md border border-border-strong bg-surface-alt px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Posting..." : buttonLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}
