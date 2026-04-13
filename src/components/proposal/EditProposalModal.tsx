"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

function getFileLabel(url: string): string {
  const raw = url.split("/").pop() || "attachment";
  return decodeURIComponent(raw);
}

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

  const handlePickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const selected = Array.from(files);
    for (const file of selected) {
      const validationError = getValidationMessage(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setNewFiles((current) => {
      const deduped = [...current];
      for (const file of selected) {
        const alreadyExists = deduped.some(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.type === file.type &&
            item.lastModified === file.lastModified
        );
        if (!alreadyExists) {
          deduped.push(file);
        }
      }
      return deduped;
    });
  };

  const removeExistingMedia = (url: string) => {
    setExistingMedia((current) => current.filter((item) => item !== url));
  };

  const removeNewFileAtIndex = (index: number) => {
    setNewFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-3xl p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Edit Operational Protocol</h2>
            <p className="text-[11px] font-mono font-bold text-muted uppercase tracking-widest">Reconfiguring node: {proposal._id.slice(-6)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Protocol Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Description / Specs</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 px-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 text-foreground resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Protocol Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl text-[11px] font-black uppercase outline-none focus:border-accent/50 text-foreground appearance-none cursor-pointer"
              >
                <option value="idea">IDEA / SIGNAL</option>
                <option value="research">RESEARCH / DATA</option>
                <option value="implementation">EXECUTION / OPS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Tech Stack</label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="React, Rust, etc."
                className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent hover:bg-[#4f46e5] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-[0_0_18px_var(--accent-glow)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
            Re-Broadcast Signal
          </button>
        </form>
      </motion.div>
    </div>
  );
}
