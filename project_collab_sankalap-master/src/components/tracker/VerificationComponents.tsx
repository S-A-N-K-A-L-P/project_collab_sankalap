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
    <div className="space-y-4">
      <div className="bg-surface border border-border-subtle p-5 rounded-xl space-y-2">
         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent font-mono">Pending Reviews</h4>
         <p className="text-[13px] text-muted font-medium">Pending contributions awaiting administrator review.</p>
      </div>

      <div className="space-y-3">
        {contributions.filter(c => c.status === 'pending').map((con, i) => (
          <div key={i} className="p-5 bg-surface border border-border-subtle rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-border-strong">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-surface-alt border border-border-subtle flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-muted" />
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[13px] font-bold text-foreground tracking-tight">{con.userId?.name}</span>
                       <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[8px] font-black uppercase tracking-widest">{con.type}</span>
                    </div>
                    <p className="text-[13px] text-muted leading-relaxed line-clamp-2">{con.description}</p>
                    <div className="flex items-center gap-2 mt-2 font-mono text-[9px] font-bold text-muted uppercase">
                       <Clock className="w-3 h-3 text-muted" /> Submitted {formatSubmittedDate(con.createdAt)}
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => onVerify(con._id, 'rejected')}
                   className="px-4 py-2 rounded-lg border border-border-subtle text-red-500 hover:bg-red-500/5 hover:border-red-500/30 transition-all font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                 >
                    <XCircle className="w-4 h-4" /> Reject
                 </button>
                 <button 
                   onClick={() => onVerify(con._id, 'approved')}
                   className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-all font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                 >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                 </button>
              </div>
          </div>
        ))}

        {contributions.filter(c => c.status === 'pending').length === 0 && (
          <div className="p-12 text-center border border-dashed border-border-subtle rounded-xl bg-surface/50">
             <span className="text-[10px] font-mono font-black text-muted uppercase tracking-[0.3em]">All Reviews Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContributionLog() {
  return (
    <div className="bg-surface border border-border-subtle p-6 rounded-xl space-y-4">
       <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
             <Send className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-[15px] font-black text-foreground tracking-tight uppercase italic">Submit Contribution Details</h3>
       </div>

       <textarea 
          placeholder="Describe your contribution (tasks completed, pull requests, files)..."
          className="w-full h-28 bg-surface-alt border border-border-subtle rounded-xl p-3.5 text-foreground text-[13px] placeholder:text-muted/60 focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all outline-none resize-none"
       />

       <div className="flex items-center justify-between gap-4 pt-1">
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-wider hover:text-foreground transition-colors">
             <Paperclip className="w-3.5 h-3.5 text-muted" /> Attach Deliverables (Files/Logs)
          </button>
          <button className="px-5 py-2.5 rounded-lg bg-accent text-white font-black text-[11px] uppercase tracking-widest hover:bg-accent/90 transition-all">
             Submit Contribution
          </button>
       </div>
    </div>
  );
}
