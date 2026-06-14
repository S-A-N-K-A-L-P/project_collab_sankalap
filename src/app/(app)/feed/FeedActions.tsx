"use client";

import { useState } from "react";
import { Plus, Loader2, X, FileText } from "lucide-react";
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
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-border flex items-center justify-center text-sm font-bold text-primary uppercase overflow-hidden shrink-0">
            {userAvatar
              ? <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              : userInitial
            }
          </div>
          {/* Trigger */}
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left bg-background border border-border hover:border-primary/40 rounded-full px-4 py-2 text-sm text-muted transition-colors"
          >
            Share a project idea or proposal…
          </button>
        </div>

        {/* Quick type buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          {[
            { type: "project",        label: "Project",        color: "text-primary" },
            { type: "module",         label: "Module",         color: "text-indigo-600" },
            { type: "infrastructure", label: "Infrastructure", color: "text-amber-600" },
          ].map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => { setFormData(p => ({ ...p, type })); setIsExpanded(true); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-background transition-colors ${color}`}
            >
              <Plus className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Submit a Proposal</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-foreground transition-colors"
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
        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
        required
        autoFocus
      />

      {/* Description */}
      <textarea
        placeholder="Describe the scope, objectives, and expected impact…"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition resize-none min-h-[100px] leading-relaxed"
        required
      />

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted">Type:</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
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
            className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-muted hover:bg-background hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.description}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
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
