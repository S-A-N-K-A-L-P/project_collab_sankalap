"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, Star, GitFork,
  Terminal, Activity, Zap
} from "lucide-react";

export default function GitProfileMetrics({ userId }: { userId: string }) {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGitData = async () => {
      try {
        const res = await fetch(`/api/git/user?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setRepos(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGitData();
  }, [userId]);

  if (loading || repos.length === 0) return null;

  // Aggregate stats
  const totalCommits = repos.reduce((acc, r) => acc + (r.stats?.commits || 0), 0);
  const totalStars = repos.reduce((acc, r) => acc + (r.stats?.stars || 0), 0);
  const totalRepos = repos.length;
  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'unknown-date' : date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] font-mono">Tactical Git Intelligence</h3>
        <span className="text-[9px] font-mono font-bold text-muted uppercase">Collective Frequency: 98.2hz</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Terminal, label: "COMMITS", value: totalCommits, color: "text-foreground" },
          { icon: Star, label: "STARS", value: totalStars, color: "text-amber-500" },
          { icon: GitBranch, label: "REPOS", value: totalRepos, color: "text-accent" },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col items-center gap-1 hover:border-border-strong transition-all group">
            <stat.icon className={`w-4 h-4 mb-1 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            <span className="text-xl font-black text-foreground tracking-tighter italic leading-none">{stat.value}</span>
            <span className="text-[8px] font-mono font-bold text-muted uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {repos.slice(0, 3).map((repo, i) => (
          <div key={i} className="p-4 bg-surface border border-border-subtle rounded-2xl flex items-center justify-between group hover:border-accent/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background border border-border-subtle flex items-center justify-center">
                <Activity className="w-4 h-4 text-muted group-hover:text-accent transition-all" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-foreground tracking-tight">{repo.repoName}</span>
                <span className="text-[8px] font-mono font-bold text-muted uppercase">SYNCED: {formatDate(repo.updatedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono font-black text-foreground italic">
              <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-amber-500" /> {repo.stats?.stars || 0}</span>
              <span className="px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[8px] uppercase tracking-widest not-italic">verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
