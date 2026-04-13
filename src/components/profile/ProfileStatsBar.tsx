"use client";

import { PieChart, Zap, UserPlus, FileText } from "lucide-react";

interface ProfileStatsBarProps {
  stats: {
    followers: number;
    following: number;
    proposals: number;
    reputation: number;
  };
}

export default function ProfileStatsBar({ stats }: ProfileStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[var(--border-strong)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center border border-[var(--border-color)]">
          <UserPlus className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <div>
          <p className="text-[9px] font-mono font-black text-[var(--text-muted)] uppercase tracking-widest">Nodes</p>
          <p className="text-lg font-bold text-[var(--text-primary)] leading-none">{stats.followers}</p>
        </div>
      </div>

      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[var(--border-strong)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center border border-[var(--border-color)]">
          <Zap className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-[9px] font-mono font-black text-[var(--text-muted)] uppercase tracking-widest">Syncs</p>
          <p className="text-lg font-bold text-[var(--text-primary)] leading-none">{stats.following}</p>
        </div>
      </div>

      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[var(--border-strong)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center border border-[var(--border-color)]">
          <FileText className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-[9px] font-mono font-black text-[var(--text-muted)] uppercase tracking-widest">Signals</p>
          <p className="text-lg font-bold text-[var(--text-primary)] leading-none">{stats.proposals}</p>
        </div>
      </div>

      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[var(--border-strong)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center border border-[var(--border-color)]">
          <PieChart className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <p className="text-[9px] font-mono font-black text-[var(--text-muted)] uppercase tracking-widest">Rep</p>
          <p className="text-lg font-bold text-[var(--text-primary)] leading-none">{stats.reputation}</p>
        </div>
      </div>
    </div>
  );
}
