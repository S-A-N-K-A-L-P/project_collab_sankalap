"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedActions() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "protocol",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: "", description: "", type: "protocol" });
        // Refresh the feed automatically
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 shadow-sm transition-all duration-150 hover:border-[#2a2a2f]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#17171a] border border-[#1f1f23] flex items-center justify-center text-[#6366f1] shadow-sm">
          <Plus className="w-5 h-5" />
        </div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Initialize new protocol..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent text-[15px] font-bold text-[#e5e7eb] placeholder-[#9ca3af] outline-none border-none p-0 focus:ring-0"
              required
            />
            <textarea
              placeholder="Broadcast technical specifications and mission objectives..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-transparent text-[13px] text-[#9ca3af] placeholder-[#1f1f23] outline-none border-none p-0 focus:ring-0 resize-none min-h-[60px]"
              required
            />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-[#1f1f23]">
            <div className="flex gap-2">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="bg-[#17171a] border border-[#1f1f23] rounded-md px-3 py-1.5 text-[11px] font-mono font-bold uppercase text-[#9ca3af] hover:text-[#e5e7eb] transition-all cursor-pointer outline-none focus:ring-0"
              >
                <option value="protocol">Protocol</option>
                <option value="node">Node</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.description}
              className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:bg-[#1a1a1d] text-white rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all shadow-sm flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Broadcast Signal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
