"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

export function ProjectTimeline({ activities }: { activities: any[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted font-mono mb-6 px-1">Activity Timeline</h3>
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border-strong">
        {activities.map((act, i) => (
          <div key={i} className="relative flex items-start gap-8 group">
            <div className="relative z-10 mt-1 w-10 h-10 rounded-xl bg-surface-alt border border-border-subtle flex items-center justify-center group-hover:border-accent/30 transition-all shrink-0">
               <Clock className="w-4 h-4 text-muted" />
            </div>
            <div className="flex-1 pb-4 border-b border-border-subtle/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-bold text-foreground tracking-tight">{act.title}</p>
                <span className="text-[10px] font-mono font-bold text-muted uppercase">{act.time}</span>
              </div>
              <p className="text-[12px] text-muted leading-relaxed italic">{act.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectHealthIndicator() {
  return (
    <div className="p-6 bg-surface border border-border-subtle rounded-2xl space-y-6 shadow-none">
       <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted font-mono">Project Health</span>
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
       </div>
       
       <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className={`h-8 rounded-lg border border-border-subtle ${i < 7 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-surface-alt'}`} />
          ))}
       </div>
       <p className="text-[11px] text-muted font-medium leading-relaxed">
          All project modules and task deliveries are currently on schedule. 
          No critical bottlenecks detected in the current sprint.
       </p>
    </div>
  );
}

export function ProjectOrgBadge({ org }: { org: any }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface border border-border-subtle rounded-xl group hover:border-border-strong hover:bg-surface-alt/50 transition-all shadow-none">
       <div className="w-12 h-12 rounded-xl bg-surface-alt border border-border-subtle flex items-center justify-center font-black text-foreground text-xl italic group-hover:text-accent">
          {org?.name?.[0] || "O"}
       </div>
       <div className="flex flex-col">
          <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">Organization</span>
          <span className="text-[14px] font-bold text-foreground tracking-tighter uppercase italic">{org?.name || "Initializing..."}</span>
       </div>
    </div>
  );
}

export function ProjectLeadCard({ lead }: { lead: any }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface border border-border-subtle rounded-xl group hover:border-border-strong hover:bg-surface-alt/50 transition-all shadow-none">
       <div className="w-12 h-12 rounded-full border-2 border-border-subtle overflow-hidden grayscale group-hover:grayscale-0 transition-all">
          <img src={lead?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=tushar"} alt="Lead" className="w-full h-full object-cover" />
       </div>
       <div className="flex flex-col">
          <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">Lead Architect</span>
          <span className="text-[14px] font-bold text-foreground tracking-tight uppercase hover:text-accent transition-colors cursor-pointer">{lead?.name || "Tushar G."}</span>
       </div>
    </div>
  );
}
