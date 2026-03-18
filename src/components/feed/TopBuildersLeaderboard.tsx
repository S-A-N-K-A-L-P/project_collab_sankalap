"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowUp } from "lucide-react";

const rankings = [
  { rank: 1, name: "Tushar", points: 120, trend: "+12" },
  { rank: 2, name: "Aman", points: 95, trend: "+8" },
  { rank: 3, name: "Sankalp", points: 88, trend: "+15" },
];

export default function TopBuildersLeaderboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Weekly Top Builders</h3>
      </div>
      
      <div className="space-y-2">
        {rankings.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400 w-4">#{r.rank}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{r.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{r.points}</span>
              <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5">
                <ArrowUp className="w-2.5 h-2.5" /> {r.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
