"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, FileText, Send, Paperclip, Clock } from "lucide-react";

export function VerificationPanel({ contributions, onVerify }: { contributions: any[], onVerify: (id: string, status: string) => void }) {
   const formatSubmittedDate = (value?: string) => {
      if (!value) return "unknown-date";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "unknown-date" : date.toISOString().split('T')[0];
   };

  return (
    <div className="space-y-6">
      <div className="bg-[#121214] border border-[#1f1f23] p-6 rounded-3xl space-y-4">
         <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6366f1] font-mono">Mission Audit Queue</h4>
         <p className="text-[13px] text-[#9ca3af] font-medium italic">Pending verification signals awaiting authority confirmation.</p>
      </div>

      <div className="space-y-4">
        {contributions.filter(c => c.status === 'pending').map((con, i) => (
          <div key={i} className="p-6 bg-[#121214] border border-[#1f1f23] rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#17171a] border border-[#1f1f23] flex items-center justify-center shrink-0">
                   <FileText className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#e5e7eb] tracking-tight">{con.userId?.name}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#6366f1]/10 text-[#6366f1] text-[8px] font-black uppercase tracking-widest">{con.type}</span>
                   </div>
                   <p className="text-[13px] text-[#9ca3af] leading-relaxed line-clamp-2">{con.description}</p>
                   <div className="flex items-center gap-2 mt-2 font-mono text-[9px] font-bold text-[#1f1f23] uppercase">
                      <Clock className="w-3 h-3" /> Submitted {formatSubmittedDate(con.createdAt)}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <button 
                  onClick={() => onVerify(con._id, 'rejected')}
                  className="px-6 py-2.5 rounded-xl border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all font-bold text-[11px] uppercase tracking-wider flex items-center gap-2"
                >
                   <XCircle className="w-4 h-4" /> Reject
                </button>
                <button 
                  onClick={() => onVerify(con._id, 'approved')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                   <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
             </div>
          </div>
        ))}

        {contributions.filter(c => c.status === 'pending').length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-[#1f1f23] rounded-3xl">
             <span className="text-[11px] font-mono font-black text-[#1f1f23] uppercase tracking-[0.3em]">Queue Terminal Clear</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContributionLog() {
  return (
    <div className="bg-[#121214] border border-[#1f1f23] p-8 rounded-3xl space-y-6">
       <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20">
             <Send className="w-5 h-5 text-[#6366f1]" />
          </div>
          <h3 className="text-xl font-bold text-[#e5e7eb] tracking-tight uppercase italic">Broadcast Operational Data</h3>
       </div>

       <textarea 
          placeholder="Describe your tactical contribution (tasks, code hubs, design nodes)..."
          className="w-full h-32 bg-[#17171a] border border-[#1f1f23] rounded-2xl p-4 text-[#e5e7eb] text-[14px] focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all outline-none resize-none"
       />

       <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-[11px] font-bold text-[#1f1f23] uppercase tracking-wider hover:text-[#9ca3af] transition-colors">
             <Paperclip className="w-4 h-4" /> Attach Signal (Media/Logs)
          </button>
          <button className="px-8 py-3 rounded-2xl bg-[#6366f1] text-white font-black text-[12px] uppercase tracking-widest hover:bg-[#4f46e5] transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
             Broadcast Contribution
          </button>
       </div>
    </div>
  );
}
