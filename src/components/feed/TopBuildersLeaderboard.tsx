"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowUp, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBuildersLeaderboard() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    try {
      // In a real app, this would be a dedicated leaderboard API
      // For now, we'll fetch top users by something or mock but with 'dynamic' intention
      const res = await fetch("/api/builders/rankings");
      const data = await res.json();
          const ranked = data.map((u: any, i: number) => ({
              ...u,
              rank: i + 1,
              points: u.points || 0,
              trend: u.trend || "SYNC"
          }));
          setRankings(ranked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Top Pulse Nodes</h3>
      </div>
      
      <div className="space-y-2">
        {rankings.map((r, i) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 transition-all group cursor-default"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-black text-slate-400 w-4">0{r.rank}</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{r.name}</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">LVL {Math.floor(r.points / 20)} BUILDER</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{r.points} XP</div>
                <div className="text-[8px] font-bold text-green-500 flex items-center justify-end gap-0.5">
                    <ArrowUp className="w-2 h-2" /> {r.trend}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {loading && <div className="text-center py-4 text-[10px] font-mono text-slate-500 uppercase animate-pulse">Calculating rankings...</div>}
      </div>
    </div>
  );
}
