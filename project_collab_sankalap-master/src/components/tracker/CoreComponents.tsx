"use client";

import { motion } from "framer-motion";
import { Shield, Layout, Settings, Share2, MoreHorizontal, Zap } from "lucide-react";

export function ProjectHeader({ project }: { project: any }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-8 relative overflow-hidden group shadow-none">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Layout className="w-32 h-32 rotate-12" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 flex items-center gap-1.5 animate-pulse">
              <Shield className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">
                {project?.orgId?.name || "Global Project"}
              </span>
            </div>
            <ProjectStatusBadge status={project?.status || "active"} />
          </div>
          
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">
            {project?.title}
          </h1>
          <p className="text-muted text-[14px] font-medium leading-relaxed max-w-xl">
            {project?.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-surface-alt border border-border-subtle text-foreground hover:border-border-strong hover:bg-surface transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-3 rounded-2xl bg-surface-alt border border-border-subtle text-foreground hover:border-border-strong hover:bg-surface transition-all">
            <Settings className="w-4 h-4" />
          </button>
          <button className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-[12px] uppercase tracking-widest transition-all">
            Join Project Team
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const colors: any = {
    planning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    active: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    completed: "text-accent bg-accent/10 border-accent/20",
    archived: "text-muted bg-surface-alt border-border-subtle",
  };

  return (
    <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-widest ${colors[status] || colors.planning}`}>
      <div className="w-1.5 h-1.5 rounded-full fill-current animate-pulse" />
      {status}
    </div>
  );
}

export function ProjectProgressBar({ progress }: { progress: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-foreground uppercase tracking-[0.2em]">Progress Completed</span>
        <span className="text-[13px] font-black text-foreground italic uppercase tracking-tighter">{progress}% COMPLETE</span>
      </div>
      <div className="h-3 bg-surface-alt border border-border-subtle rounded-full overflow-hidden p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full"
        />
      </div>
    </div>
  );
}

export function ProjectMetaInfo({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Lead Architect", value: project?.lead?.name || "Initializing...", icon: Zap },
        { label: "Team Members", value: `${project?.members?.length || 0} Members`, icon: MoreHorizontal },
        { label: "Repository Link", value: project?.githubRepo ? "GitHub/v2" : "Local Repository", icon: Layout },
        { label: "Quality Score", value: "98.2% Nominal", icon: Shield },
      ].map((item, i) => (
        <div key={i} className="p-5 bg-surface border border-border-subtle rounded-xl hover:border-border-strong hover:bg-surface-alt/50 shadow-none transition-all">
          <div className="flex items-center gap-2 mb-2">
            <item.icon className="w-3.5 h-3.5 text-muted" />
            <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">{item.label}</span>
          </div>
          <p className="text-[13px] font-bold text-foreground tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
