"use client";

import { motion } from "framer-motion";
import { 
  Users, Award, Cpu, BarChart2, Activity,
  Zap, Shield, Globe, Terminal, Briefcase
} from "lucide-react";

// 1. Skill Matrix (Spider/Radar style visualized by grid)
export function SkillMatrix({ skills }: { skills: any[] }) {
  return (
    <div className="p-8 bg-[#121214] border border-[#1f1f23] rounded-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#6366f1]" />
          <h4 className="text-xl font-bold text-[#e5e7eb] uppercase italic tracking-tighter">Tactical Expertise Matrix</h4>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-[9px] font-black uppercase tracking-widest">
           Synced 100%
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {skills.map((skill, i) => (
          <div key={i} className="space-y-3">
             <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-mono font-bold text-[#e5e7eb] uppercase tracking-widest">{skill.name}</span>
                <span className="text-[12px] font-black text-[#6366f1] italic italic">{skill.value}%</span>
             </div>
             <div className="h-2 bg-[#17171a] border border-[#1f1f23] rounded-full overflow-hidden p-0.5">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${skill.value}%` }} 
                   className="h-full bg-[#6366f1] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"
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
    <div className="p-6 bg-[#121214] border border-[#1f1f23] rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
         <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1f1f23] font-mono">Node Bandwidth Pulse</h5>
         <div className="flex items-center gap-4 text-[9px] font-mono font-bold text-[#1f1f23] uppercase">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> Tactical</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#1f1f23]" /> Latency</span>
         </div>
      </div>

      <div className="space-y-5">
        {team.map((member, i) => (
          <div key={i} className="space-y-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-lg bg-[#b0b0b0]/5 border border-[#1f1f23] flex items-center justify-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} className="w-full h-full object-cover" />
                   </div>
                   <span className="text-[12px] font-bold text-[#e5e7eb] uppercase tracking-tight">{member.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">{member.load}% LOAD</span>
             </div>
             <div className="flex gap-0.5 h-4">
                {[...Array(20)].map((_, j) => (
                  <div key={j} className={`flex-1 rounded-sm border border-[#1f1f23]/20 ${j < (member.load / 5) ? 'bg-[#6366f1]' : 'bg-[#17171a]'}`} />
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
    <div className="p-6 bg-[#121214] border border-[#1f1f23] rounded-3xl space-y-6">
       <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#6366f1]" />
          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e5e7eb] font-mono">Collective Deployment Heatmap</h5>
       </div>
       
       <div className="grid grid-cols-12 gap-1 px-1">
          {[...Array(72)].map((_, i) => {
                  const intensity = getIntensity(i);
            return (
              <div 
                key={i} 
                className="aspect-square rounded-sm border border-[#1f1f23]/50 transition-all hover:scale-110" 
                style={{ 
                  backgroundColor: intensity > 0.8 ? '#6366f1' : 
                                   intensity > 0.5 ? 'rgba(99, 102, 241, 0.4)' : 
                                   intensity > 0.2 ? 'rgba(99, 102, 241, 0.1)' : 
                                   '#17171a'
                }} 
              />
            );
          })}
       </div>
       <div className="flex justify-between items-center pt-2">
          <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase">Signal Latency</span>
          <div className="flex items-center gap-1.5">
             <span className="text-[8px] font-mono text-[#1f1f23] uppercase font-bold">Cold</span>
             <div className="flex gap-1">
                {[0.1, 0.3, 0.6, 1].map(v => <div key={v} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgba(99, 102, 241, ${v})` }} />)}
             </div>
             <span className="text-[8px] font-mono text-[#1f1f23] uppercase font-bold">Hot</span>
          </div>
       </div>
    </div>
  );
}

// 4. Reputation Breakdown (XP Allocation)
export function ReputationAllocation() {
  return (
    <div className="p-6 bg-[#121214] border border-[#1f1f23] rounded-3xl space-y-6">
       <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-emerald-500" />
          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e5e7eb] font-mono">XP Allocation Quota</h5>
       </div>
       
       <div className="space-y-4">
          {[
            { label: "Core Protocol", value: 450, color: "bg-[#6366f1]" },
            { label: "Design Matrix", value: 320, color: "bg-emerald-500" },
            { label: "Governance Audit", value: 180, color: "bg-amber-500" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
               <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-[#9ca3af] uppercase tracking-wider">{item.label}</span>
                  <span className="text-[#e5e7eb] italic uppercase tracking-tighter">{item.value} XP</span>
               </div>
               <div className="h-1.5 w-full bg-[#17171a] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.value / 600) * 100}%` }} />
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
