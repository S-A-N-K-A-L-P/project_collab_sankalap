"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminControls({ proposalId, leads }: { proposalId: string; leads: any[] }) {
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState("");
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          proposalId, 
          status: "active", 
          projectLead: selectedLead || undefined 
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 border-t border-[#1f1f23] pt-4 md:border-t-0 md:pt-0">
      <div className="w-full sm:w-48">
        <label className="text-[9px] font-bold text-[#9ca3af] uppercase mb-1.5 block tracking-[0.1em] font-mono">Assign Architect</label>
        <select
          value={selectedLead}
          onChange={(e) => setSelectedLead(e.target.value)}
          className="w-full px-3 py-2 bg-[#0b0b0c] border border-[#1f1f23] rounded-xl text-[11px] font-mono font-bold uppercase outline-none focus:border-[#6366f1]/50 text-[#e5e7eb] cursor-pointer"
        >
          <option value="">DEFERRED</option>
          {leads.map(lead => (
            <option key={lead._id} value={lead._id}>{lead.name}</option>
          ))}
        </select>
      </div>
      <button
        disabled={loading}
        onClick={handleApprove}
        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-4 h-4" /> Initialize Protocol</>}
      </button>
    </div>
  );
}
