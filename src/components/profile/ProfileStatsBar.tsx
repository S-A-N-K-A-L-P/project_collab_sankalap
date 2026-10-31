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
  const items = [
    { label: "Followers",     value: stats.followers,  icon: UserPlus, tone: "bg-primary-light text-primary"         },
    { label: "Following",     value: stats.following,  icon: Zap,      tone: "bg-emerald-500/12 text-emerald-600"    },
    { label: "Proposals",     value: stats.proposals,  icon: FileText, tone: "bg-amber-500/12 text-amber-600"        },
    { label: "Contributions", value: stats.reputation, icon: PieChart, tone: "bg-primary-light text-primary"         },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="saas-card p-4 flex items-center gap-3.5 hover:border-primary/30 transition-all"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-none tabular-nums">{value}</p>
            <p className="text-xs font-medium text-muted mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
