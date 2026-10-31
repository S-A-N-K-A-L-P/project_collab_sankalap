"use client";

import { useEffect, useState } from "react";
import {
  GitBranch, Star, Terminal, Activity, CheckCircle2
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

  const totalCommits = repos.reduce((acc, r) => acc + (r.stats?.commits || 0), 0);
  const totalStars = repos.reduce((acc, r) => acc + (r.stats?.stars || 0), 0);
  const totalRepos = repos.length;
  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recent" : date.toISOString().split("T")[0];
  };

  return (
    <div className="saas-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <GitBranch className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Git Activity</h3>
        </div>
        <span className="pill-primary text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          Synced
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: Terminal, label: "Commits", value: totalCommits, color: "text-primary bg-primary-light" },
          { icon: Star, label: "Stars", value: totalStars, color: "text-amber-600 bg-amber-500/12" },
          { icon: GitBranch, label: "Repos", value: totalRepos, color: "text-emerald-600 bg-emerald-500/12" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-3 bg-muted-bg/60 border border-border rounded-xl flex flex-col items-center gap-1 transition-all hover:border-primary/25"
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-foreground tabular-nums leading-tight mt-0.5">
              {stat.value}
            </span>
            <span className="text-[11px] font-medium text-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2.5 pt-1">
        {repos.slice(0, 3).map((repo, i) => (
          <div
            key={i}
            className="p-3 bg-card border border-border rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-light/70 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">{repo.repoName}</span>
                <span className="text-[11px] text-muted">Updated {formatDate(repo.updatedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1 text-xs font-semibold text-foreground tabular-nums">
                <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stats?.stars || 0}
              </span>
              <span className="pill-success text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
