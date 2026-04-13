"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposal._id,
          ...formData,
          techStack: formData.techStack.split(",").map((s: string) => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
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
