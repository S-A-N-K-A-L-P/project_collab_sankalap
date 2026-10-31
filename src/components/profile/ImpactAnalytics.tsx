"use client";

import React from "react";
import { Eye, Users, GitCommit, Activity, Target } from "lucide-react";

interface ImpactAnalyticsProps {
  stats: {
    projectsBuilt: number;
    views: number;
    followers: number;
    contributions: number;
    impactScore: number;
  };
}

export default function ImpactAnalytics({ stats }: ImpactAnalyticsProps) {
  const metrics = [
    { label: "Projects Built", value: stats.projectsBuilt,                icon: <Target className="text-primary" size={18} /> },
    { label: "Profile Views",  value: stats.views.toLocaleString(),       icon: <Eye className="text-primary" size={18} /> },
    { label: "Followers",      value: stats.followers.toLocaleString(),   icon: <Users className="text-emerald-600" size={18} /> },
    { label: "Contributions",  value: stats.contributions.toLocaleString(), icon: <GitCommit className="text-amber-600" size={18} /> },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-foreground">Impact & Analytics</h2>
      </div>

      <div className="saas-card overflow-hidden">
        <div className="saas-card-featured border-0 border-b border-border rounded-none flex items-center gap-5 p-5">
          <div className="h-14 w-14 rounded-2xl bg-primary-light flex items-center justify-center border border-primary/15 shrink-0">
            <Activity className="text-primary w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
              Global Impact Score
            </span>
            <div className="text-3xl text-foreground font-bold tracking-tight tabular-nums mt-0.5">
              {stats.impactScore.toLocaleString()}
            </div>
            <p className="text-xs text-muted mt-0.5">
              Calculated from shipped projects, approved contributions, and community engagement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="p-4 flex flex-col gap-1.5 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{metric.label}</span>
                {metric.icon}
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
