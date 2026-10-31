"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
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

  const medalColor = (rank: number) => {
    if (rank === 1) return "text-amber-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-700";
    return "text-muted";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Top Contributors</h3>
        </div>
        <Link href="/discover" className="text-xs text-primary hover:underline font-medium">View all</Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {rankings.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card transition-colors"
            >
              <span className={`text-sm font-bold w-5 text-center shrink-0 ${medalColor(r.rank)}`}>
                {r.rank <= 3 ? ["🥇","🥈","🥉"][r.rank - 1] : r.rank}
              </span>
              <Link
                href={`/profile/${r._id}`}
                className="flex-1 min-w-0 text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
              >
                {r.name}
              </Link>
              <span className="text-xs font-semibold text-primary tabular-nums shrink-0">
                {r.points.toLocaleString()} pts
              </span>
            </motion.div>
          ))}

          {rankings.length === 0 && (
            <p className="text-xs text-muted text-center py-4">No contributors ranked yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
