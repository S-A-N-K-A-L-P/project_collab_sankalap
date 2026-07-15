"use client";

import { motion } from "framer-motion";
import { 
  Cpu, Activity, Shield, Terminal, 
  GitBranch, Server, Zap, AlertTriangle,
  FileCode, Play, Monitor, Gauge
} from "lucide-react";

const LOG_TIMESTAMPS = ["00:00:01", "00:00:02", "00:00:03", "00:00:04", "00:00:05", "00:00:06"];

// 1. Deployment Pulse (Deployment status card)
export function DeploymentPulse({ project }: { project: any }) {
  return (
    <div className="p-8 bg-surface border border-border-subtle rounded-2xl space-y-8 group hover:border-border-strong transition-all shadow-none">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-border-subtle flex items-center justify-center">
                <Server className="w-6 h-6 text-accent group-hover:animate-pulse" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-[0.2em]">Deployment Instance</span>
                <span className="text-xl font-black text-foreground uppercase italic tracking-tighter">VERCEL-ALPHA-01</span>
             </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Status: Online</span>
          </div>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Build Logs", value: "Verified", status: "emerald" },
            { label: "Latency", value: "24ms", status: "emerald" },
            { label: "CPU Load", value: "0.24%", status: "emerald" },
            { label: "Memory", value: "1.2GB", status: "amber" },
          ].map((stat, i) => (
             <div key={i} className="p-4 bg-surface-alt border border-border-subtle rounded-xl flex flex-col gap-1.5 hover:border-border-strong transition-all">
                <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-wider">{stat.label}</span>
                <span className={`text-[13px] font-black italic uppercase tracking-tighter ${
                  stat.status === 'emerald' ? 'text-emerald-500' : 'text-amber-500'
                }`}>{stat.value}</span>
             </div>
          ))}
       </div>
    </div>
  );
}

// 2. Build Log Viewer (Streaming-lite simulation)
export function BuildLogViewer() {
  const logs = [
    "Compiling application routes...",
    "Initializing interface styles...",
    "Verifying commit integrity (SHA: abc1)...",
    "Deployment target VERCEL-ALPHA-01 ready.",
    "Fetching latest project activity...",
    "Connection established. Synchronizing telemetry...",
  ];

  return (
    <div className="p-6 bg-surface border border-border-subtle rounded-2xl space-y-4 shadow-none">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Terminal className="w-4 h-4 text-emerald-500" />
             <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono font-medium">Build Logs Activity</h5>
          </div>
          <span className="text-[9px] font-mono font-bold text-muted uppercase">REVISION: v4.2.0</span>
       </div>
       
       <div className="p-4 bg-background border border-border-subtle rounded-2xl font-mono text-[11px] space-y-2 overflow-hidden max-h-[160px]">
          {logs.map((log, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, x: -5 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.2 }}
               className="flex gap-3 leading-relaxed"
            >
               <span className="text-muted font-bold">[{LOG_TIMESTAMPS[i] || "00:00:00"}]</span>
               <span className="text-muted-foreground">{log}</span>
            </motion.div>
          ))}
          <div className="w-1.5 h-3 bg-accent animate-pulse inline-block align-middle ml-1" />
       </div>
    </div>
  );
}

// 3. GitHub Sync Card
export function GitHubSyncCard({ repo }: { repo: any }) {
  return (
    <div className="p-6 bg-surface border border-border-subtle rounded-2xl space-y-6 shadow-none">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <GitBranch className="w-4 h-4 text-accent" />
             <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono">GitHub Sync</h5>
          </div>
          <button className="p-2 rounded-lg bg-surface-alt border border-border-subtle hover:text-accent transition-all">
             <Zap className="w-3.5 h-3.5 text-muted hover:text-accent" />
          </button>
       </div>

       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
             <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className="w-6 h-6 invert" />
          </div>
          <div className="flex flex-col">
             <span className="text-[14px] font-bold text-foreground tracking-tight uppercase italic">{repo?.repoName || "NOT LINKED"}</span>
             <span className="text-[9px] font-mono font-bold text-muted uppercase">{repo?.owner || "N/A"} / {repo?.defaultBranch || "main"}</span>
          </div>
       </div>
       
       <div className="pt-4 border-t border-border-subtle grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-mono font-bold text-muted uppercase">Status</span>
             <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest italic">{repo?.syncStatus || "DISCONNECTED"}</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-mono font-bold text-muted uppercase">Audit SHA</span>
             <span className="text-[11px] font-mono font-bold text-muted uppercase tracking-tighter">ABC1DE2...</span>
          </div>
       </div>
    </div>
  );
}

// 4. Activity Pulse (Real-time chart simulation)
export function ActivityPulse() {
   const bars = Array.from({ length: 30 }, (_, i) => ({
      height: `${20 + ((i * 17) % 80)}%`,
      duration: 1 + ((i % 5) * 0.25),
   }));

  return (
    <div className="p-6 bg-surface border border-border-subtle rounded-2xl space-y-6 overflow-hidden shadow-none">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Activity className="w-4 h-4 text-accent" />
             <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono">Activity Frequency</h5>
          </div>
          <span className="text-[10px] font-mono font-black text-emerald-500 uppercase italic">98.2hz</span>
       </div>
       
       <div className="h-24 flex items-end gap-1 px-1">
          {bars.map((bar, i) => (
            <motion.div 
               key={i}
               initial={{ height: 2 }}
               animate={{ height: bar.height }}
               transition={{ repeat: Infinity, duration: bar.duration, repeatType: "reverse" }}
               className="flex-1 bg-gradient-to-t from-accent/20 to-accent rounded-t-sm"
            />
          ))}
       </div>
    </div>
  );
}
