"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

function getValidationMessage(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return "Invalid file type. Allowed: PDF, DOCX, PNG, JPG.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large. Maximum size is 5 MB.";
  }

  return null;
}

export default function EditProposalModal({
  proposal,
  onClose,
  onSuccess
}: {
  proposal: any;
  onClose: () => void;
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: proposal.title,
    description: proposal.description,
    type: proposal.type,
    techStack: proposal.techStack?.join(", ") || "",
  });
  const [existingMedia, setExistingMedia] = useState<string[]>(
    Array.isArray(proposal.media) ? proposal.media.filter((item: unknown) => typeof item === "string") : []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("id", proposal._id);
      payload.append("title", title);
      payload.append("description", description);
      payload.append("type", formData.type);
      payload.append(
        "techStack",
        formData.techStack
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .join(",")
      );
      payload.append("retainMedia", JSON.stringify(existingMedia));

      for (const file of newFiles) {
        payload.append("attachments", file);
      }

      const res = await fetch("/api/proposals", {
        method: "PATCH",
        body: payload,
      });

      const responsePayload = await res.json();

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(responsePayload?.error || "Failed to update proposal.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Static Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
      />

      {/* Solid Enterprise Dialog */}
      <div className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-xl p-6 shadow-none space-y-5 z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground uppercase tracking-tight">Edit Operational Protocol</h2>
            <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Reconfiguring node: {proposal._id.slice(-6)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-alt rounded text-muted hover:text-foreground transition-colors border border-border-subtle/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 font-mono">
            <span className="font-bold mr-1">[ERR]:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-muted uppercase tracking-wider">Protocol Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border-subtle rounded text-[13px] font-medium outline-none focus:border-accent/40 text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-muted uppercase tracking-wider">Description / Specs</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 px-3 py-2 bg-background border border-border-subtle rounded text-[13px] font-medium outline-none focus:border-accent/40 text-foreground resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-muted uppercase tracking-wider">Protocol Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border-subtle rounded text-[12px] font-bold uppercase outline-none focus:border-accent/40 text-foreground cursor-pointer"
              >
                <option value="project">Project</option>
                <option value="module">Module</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-muted uppercase tracking-wider">Tech Stack</label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="React, Rust, etc."
                className="w-full px-3 py-2 bg-background border border-border-subtle rounded text-[13px] font-medium outline-none focus:border-accent/40 text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-subtle rounded text-[11px] font-bold uppercase text-muted hover:bg-surface-alt hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-accent hover:bg-accent/90 text-white rounded font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Re-Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
