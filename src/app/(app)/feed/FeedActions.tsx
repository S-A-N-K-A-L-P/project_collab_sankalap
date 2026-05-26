"use client";

import { useState } from "react";
import { Plus, Loader2, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FeedActions() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "project",
  });
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
          type: formData.type === "project" ? "protocol" : formData.type, // Map 'project' UI label back to database's 'protocol' type key
        }),
      });

      if (res.ok) {
        setFormData({ title: "", description: "", type: "project" });
        setIsExpanded(false);
        // Refresh the feed automatically
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExpand = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    setIsExpanded(true);
  };

  const userAvatar = session?.user?.image;
  const userInitial = session?.user?.name?.[0] || "?";

  if (!isExpanded) {
    return (
      <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-none space-y-3">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full border border-border-subtle bg-surface-alt flex items-center justify-center text-[13px] font-black text-foreground uppercase overflow-hidden shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </div>

          {/* Collapsed Trigger Input Box */}
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 bg-surface-alt hover:bg-[color-mix(in_srgb,var(--foreground)_2%,transparent)] border border-border-subtle hover:border-border-strong rounded-full px-4 py-2 text-left text-[13px] font-medium text-muted/85 transition-all outline-none"
          >
            Start a new research proposal...
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/50 text-[10px] font-bold text-muted font-mono">
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickExpand("project")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-alt hover:text-accent transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>Project</span>
            </button>
            <button
              onClick={() => handleQuickExpand("module")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-alt hover:text-emerald-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Module</span>
            </button>
            <button
              onClick={() => handleQuickExpand("infrastructure")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-alt hover:text-amber-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              <span>Infrastructure</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-none space-y-4">
      {/* Header with Title Input & Close Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-full border border-border-subtle bg-surface-alt flex items-center justify-center text-[13px] font-black text-foreground uppercase overflow-hidden shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
          <div className="flex-1 bg-surface-alt border border-border-subtle rounded-lg px-3 py-2 focus-within:border-accent/40 transition-all">
            <input
              type="text"
              placeholder="Title of project proposal or module..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent text-[13px] font-bold text-foreground placeholder:text-muted outline-none border-none p-0 focus:ring-0"
              required
              autoFocus
            />
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-lg hover:bg-surface-alt text-muted hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description Block */}
      <div className="bg-surface-alt border border-border-subtle rounded-lg p-3.5 focus-within:border-accent/40 transition-all">
        <textarea
          placeholder="Describe the scope, objectives, technology stack, and national impact of your proposal..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted outline-none border-none p-0 focus:ring-0 resize-none min-h-[90px] leading-relaxed"
          required
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Type:</span>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="bg-surface-alt border border-border-subtle rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase text-foreground hover:border-accent/40 transition-all cursor-pointer outline-none focus:ring-0"
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
            className="px-4 py-2 border border-border-subtle rounded-lg text-[11px] font-bold uppercase text-muted hover:bg-surface-alt hover:text-foreground transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description}
            className="px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:bg-surface-alt text-white rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
