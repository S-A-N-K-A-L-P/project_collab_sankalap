"use client";

import { useState } from "react";
import { Check, UserPlus, Loader2 } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 border-t pt-4 md:border-t-0 md:pt-0">
      <div className="w-full sm:w-48">
        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Assign Lead</label>
        <select
          value={selectedLead}
          onChange={(e) => setSelectedLead(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a Lead</option>
          {leads.map(lead => (
            <option key={lead._id} value={lead._id}>{lead.name}</option>
          ))}
        </select>
      </div>
      <button
        disabled={loading}
        onClick={handleApprove}
        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-500/20 disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Approve & Activate</>}
      </button>
    </div>
  );
}
