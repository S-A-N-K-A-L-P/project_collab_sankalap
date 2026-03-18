"use client";

import { motion } from "framer-motion";
import { Zap, UserPlus, ThumbsUp, CheckCircle2 } from "lucide-react";

const activities = [
  { id: 1, type: "vote", user: "Tushar", target: "AI Code Reviewer", icon: ThumbsUp, color: "text-blue-500", time: "2m ago" },
  { id: 2, type: "join", user: "Aman", target: "Open Source Tracker", icon: UserPlus, color: "text-green-500", time: "5m ago" },
  { id: 3, type: "complete", user: "Riya", target: "Pixel Platform", icon: CheckCircle2, color: "text-purple-500", time: "12m ago" },
  { id: 4, type: "proposal", user: "Sankalp", target: "Web3 Wallet", icon: Zap, color: "text-amber-500", time: "15m ago" },
];

export default function LiveActivityStream() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Activity</h3>
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      
      <div className="space-y-3">
        {activities.map((act, i) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-default"
          >
            <div className={`mt-0.5 p-1.5 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors ${act.color}`}>
              <act.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                <span className="font-bold text-slate-900 dark:text-white">{act.user}</span> 
                {" "}
                {act.type === "vote" && "upvoted"}
                {act.type === "join" && "joined"}
                {act.type === "complete" && "completed task in"}
                {act.type === "proposal" && "shared"}
                {" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">{act.target}</span>
              </p>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1 block">{act.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
