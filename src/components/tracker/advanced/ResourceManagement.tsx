"use client";

import { motion } from "framer-motion";
import { 
  Users, Award, Cpu, BarChart2, Activity,
  Zap, Shield, Globe, Terminal, Briefcase
} from "lucide-react";

// 1. Skill Matrix (Spider/Radar style visualized by grid)
export function SkillMatrix({ skills }: { skills: any[] }) {
  return (
    <div className="p-8 bg-card border border-border rounded-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary" />
          <h4 className="text-xl font-bold text-foreground uppercase italic tracking-tighter">Tactical Expertise Matrix</h4>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-[9px] font-black uppercase tracking-widest">
           Synced 100%
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {skills.map((skill, i) => (
          <div key={i} className="space-y-3">
             <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">{skill.name}</span>
                <span className="text-[12px] font-black text-primary italic italic">{skill.value}%</span>
             </div>
             <div className="h-2 bg-muted-bg border border-border rounded-full overflow-hidden p-0.5">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${skill.value}%` }} 
                   className="h-full bg-primary rounded-full shadow-[0_0_10px_var(--ring)]"
                />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Resource Bandwidth Pulse (Gantt-lite)
export function BandwidthTracker({ team }: { team: any[] }) {
  return (
    <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
         <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">Node Bandwidth Pulse</h5>
         <div className="flex items-center gap-4 text-[9px] font-mono font-bold text-muted-foreground uppercase">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Tactical</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-muted-bg" /> Latency</span>
         </div>
      </div>

      <div className="space-y-5">
        {team.map((member, i) => (
          <div key={i} className="space-y-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-lg bg-muted-foreground/5 border border-border flex items-center justify-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} className="w-full h-full object-cover" />
                   </div>
                   <span className="text-[12px] font-bold text-foreground uppercase tracking-tight">{member.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{member.load}% LOAD</span>
             </div>
             <div className="flex gap-0.5 h-4">
                {[...Array(20)].map((_, j) => (
                  <div key={j} className={`flex-1 rounded-sm border border-border/20 ${j < (member.load / 5) ? 'bg-primary' : 'bg-muted-bg'}`} />
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Team Heatmap (Commit/Activity density)
export function TeamHeatmap() {
   const getIntensity = (index: number) => ((index * 37) % 100) / 100;

  return (
    <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
       <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono">Collective Deployment Heatmap</h5>
       </div>
       
       <div className="grid grid-cols-12 gap-1 px-1">
          {[...Array(72)].map((_, i) => {
                  const intensity = getIntensity(i);
            return (
              <div 
                key={i} 
                className="aspect-square rounded-sm border border-border/50 transition-all hover:scale-110" 
                style={{
                  backgroundColor: intensity > 0.8 ? 'var(--primary)' :
                                   intensity > 0.5 ? 'color-mix(in srgb, var(--primary) 40%, transparent)' :
                                   intensity > 0.2 ? 'color-mix(in srgb, var(--primary) 10%, transparent)' :
                                   'var(--muted)'
                }}
              />
            );
          })}
       </div>
       <div className="flex justify-between items-center pt-2">
          <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Signal Latency</span>
          <div className="flex items-center gap-1.5">
             <span className="text-[8px] font-mono text-muted-foreground uppercase font-bold">Cold</span>
             <div className="flex gap-1">
                {[0.1, 0.3, 0.6, 1].map(v => <div key={v} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `color-mix(in srgb, var(--primary) ${v * 100}%, transparent)` }} />)}
             </div>
             <span className="text-[8px] font-mono text-muted-foreground uppercase font-bold">Hot</span>
          </div>
       </div>
    </div>
  );
}

// 4. Reputation Breakdown (XP Allocation)
export function ReputationAllocation() {
  return (
    <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
       <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-emerald-500" />
          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono">XP Allocation Quota</h5>
       </div>
       
       <div className="space-y-4">
          {[
            { label: "Core Protocol", value: 450, color: "bg-primary" },
            { label: "Design Matrix", value: 320, color: "bg-emerald-500" },
            { label: "Governance Audit", value: 180, color: "bg-amber-500" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
               <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  <span className="text-foreground italic uppercase tracking-tighter">{item.value} XP</span>
               </div>
               <div className="h-1.5 w-full bg-muted-bg rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.value / 600) * 100}%` }} />
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
