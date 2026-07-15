"use client";

import { motion } from "framer-motion";
import { 
  BarChart, LineChart, TrendingUp, PieChart,
  Zap, Calendar, Clock, ArrowUpRight
} from "lucide-react";

// 1. Burn-down Chart (Simplified Visualization)
export function BurnDownChart() {
  return (
    <div className="p-8 bg-card border border-border rounded-3xl space-y-8">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <TrendingUp className="w-5 h-5 text-red-500" />
             <h4 className="text-xl font-bold text-foreground uppercase italic tracking-tighter">Burn-Down Protocol</h4>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Scope: Node Phase 1</span>
             <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Cycle: 14 Days</span>
          </div>
       </div>

       <div className="relative h-48 w-full">
          {/* Ideal line */}
          <div className="absolute inset-0 border-b border-l border-border" />
          <svg className="absolute inset-0 w-full h-full overflow-visible">
             <line x1="0" y1="0" x2="100%" y2="100%" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 4" />
             <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                d="M0 0 L 100 40 L 200 80 L 300 120 L 400 150 L 500 200"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                className="w-full h-full"
                preserveAspectRatio="none"
             />
          </svg>
       </div>
       
       <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest pt-2">
          <span>Day 01</span>
          <span>Day 07 (Midpoint)</span>
          <span>Day 14 (Release)</span>
       </div>
    </div>
  );
}

// 2. Velocity Tracker (Sprints simulation)
export function VelocityTracker() {
  const sprints = [24, 32, 28, 45, 38];
  return (
    <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
       <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono font-medium tracking-widest">Velocity Telemetry</h5>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary" />
             <span className="text-[10px] font-black text-foreground italic tracking-tighter uppercase">Avg: 33.4</span>
          </div>
       </div>

       <div className="flex items-end gap-3 h-32 px-1">
          {sprints.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
               <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 50) * 100}%` }}
                  className="w-full bg-card border border-border rounded-xl hover:border-primary/50 transition-all flex items-end p-1"
               >
                  <div className="w-full bg-muted-bg rounded-lg group-hover:bg-primary/20 transition-all" style={{ height: '100%' }} />
               </motion.div>
               <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest leading-none">S{i+1}</span>
            </div>
          ))}
       </div>
    </div>
  );
}

// 3. Project Complexity Score
export function ComplexityIndicator({ score }: { score: number }) {
  return (
    <div className="p-6 bg-card border border-border rounded-3xl space-y-6 overflow-hidden relative">
       <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
       
       <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
             <Zap className="w-4 h-4 text-amber-500" />
             <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono">Complexity Metric</h5>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
       </div>

       <div className="flex flex-col items-center justify-center p-4 relative z-10">
          <div className="text-5xl font-black text-foreground tracking-tighter italic uppercase underline decoration-primary/50 underline-offset-8">
             {score}
          </div>
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-6">Protocol Weight: Tier C2</span>
       </div>
       
       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border relative z-10">
          <div className="flex flex-col">
             <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Coupling Node</span>
             <span className="text-[12px] font-bold text-emerald-500 tracking-tight uppercase">Low</span>
          </div>
          <div className="flex flex-col text-right">
             <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Depth Signal</span>
             <span className="text-[12px] font-bold text-amber-500 tracking-tight uppercase">Moderate</span>
          </div>
       </div>
    </div>
  );
}
