"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowUp, Activity, Hexagon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopBuildersLeaderboard() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    try {
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
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500/50" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1f1f23] font-mono">Pulse Leaders</h3>
        </div>
        <button className="text-[9px] font-bold text-[#6366f1] uppercase tracking-tight hover:underline">View All</button>
      </div>
      
      <div className="space-y-2">
        {rankings.map((r, i) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-center justify-between p-3 bg-[#121214] border border-[#1f1f23] rounded-2xl hover:border-[#2a2a2f] transition-all cursor-default"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-black text-[#1f1f23] w-4">
                {r.rank < 10 ? `0${r.rank}` : r.rank}
              </span>
              <div className="flex flex-col">
                <Link href={`/profile/${r._id}`} className="text-[12px] font-bold text-[#e5e7eb] uppercase tracking-tighter hover:text-[#6366f1] transition-colors">
                  {r.name}
                </Link>
                <span className="text-[8px] font-mono font-bold text-[#9ca3af] uppercase tracking-widest opacity-60">
                    S-RANK BUILDER
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-mono font-black text-[#6366f1]">{r.points} P</div>
                <div className="text-[8px] font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                    <ArrowUp className="w-2 h-2" /> {r.trend}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {loading && (
            <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-[#121214] border border-[#1f1f23] rounded-2xl animate-pulse" />)}
            </div>
        )}
      </div>
    </div>
  );
}
