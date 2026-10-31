"use client";

import { useState } from "react";
import { Plus, Loader2, X, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FeedActions() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", type: "project" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type === "project" ? "protocol" : formData.type,
        }),
      });
      if (res.ok) {
        setFormData({ title: "", description: "", type: "project" });
        setIsExpanded(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userAvatar = session?.user?.image;
  const userInitial = session?.user?.name?.[0] || "?";

  if (!isExpanded) {
    return (
      <div className="saas-card p-4 space-y-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary-light border border-primary/15 flex items-center justify-center text-sm font-bold text-primary uppercase overflow-hidden shrink-0">
            {userAvatar
              ? <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              : userInitial
            }
          </div>
          {/* Trigger */}
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left bg-background border border-border hover:border-primary/40 hover:bg-card rounded-xl px-4 py-2.5 text-sm text-muted transition-all cursor-pointer"
          >
            Share a project idea or proposal…
          </button>
        </div>

        {/* Quick type buttons */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { type: "project",        label: "Project",        badge: "bg-primary-light text-primary border-primary/15" },
              { type: "module",         label: "Module",         badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/15" },
              { type: "infrastructure", label: "Infrastructure", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/15" },
            ].map(({ type, label, badge }) => (
              <button
                key={type}
                onClick={() => { setFormData(p => ({ ...p, type })); setIsExpanded(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-90 cursor-pointer ${badge}`}
              >
                <Plus className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-muted">
            <Sparkles className="w-3 h-3 text-primary" /> Quick Proposal
          </span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="saas-card-featured p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-light border border-primary/15 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block leading-tight">Submit a Proposal</span>
            <span className="text-[11px] text-muted">Share your initiative with the community</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Proposal title…"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-3 focus:ring-primary/15 focus:border-primary transition-all"
        required
        autoFocus
      />

      {/* Description */}
      <textarea
        placeholder="Describe the scope, objectives, and expected impact…"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-3 focus:ring-primary/15 focus:border-primary transition-all resize-none min-h-[110px] leading-relaxed"
        required
      />

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted">Category:</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="project">Project</option>
            <option value="module">Module</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-muted hover:bg-background hover:text-foreground transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.description}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(98,87,232,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
              : "Submit Proposal"
            }
          </button>
        </div>
      </div>
    </form>
  );
}
