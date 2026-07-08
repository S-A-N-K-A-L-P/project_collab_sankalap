"use client";

import React from "react";
import { Download, Eye, Users, Star, GitCommit, Activity, Target } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { TypographySection, TypographySubtitle, TypographyTitle } from "@/components/ui/typography";
import { AnimatedButton } from "@/components/ui/animated-button";

interface ImpactAnalyticsProps {
  stats: {
    projectsBuilt: number;
    downloads: number;
    views: number;
    followers: number;
    contributions: number;
    stars: number;
    impactScore: number;
  };
}

export default function ImpactAnalytics({ stats }: ImpactAnalyticsProps) {
  const metrics = [
    { label: "Projects Built", value: stats.projectsBuilt, icon: <Target className="text-primary" size={20} /> },
    { label: "Downloads", value: stats.downloads.toLocaleString(), icon: <Download className="text-success" size={20} /> },
    { label: "Profile Views", value: stats.views.toLocaleString(), icon: <Eye className="text-info" size={20} /> },
    { label: "Followers", value: stats.followers.toLocaleString(), icon: <Users className="text-warning" size={20} /> },
    { label: "Contributions", value: stats.contributions.toLocaleString(), icon: <GitCommit className="text-os" size={20} /> },
    { label: "Stars Earned", value: stats.stars.toLocaleString(), icon: <Star className="text-yellow-400" size={20} /> },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <TypographySection>Impact & Analytics</TypographySection>
      </div>

      <PremiumCard className="p-0 overflow-hidden bg-gradient-to-br from-card to-muted/20 border-border dark:border-white/10">
        <div className="flex items-center gap-6 p-6 border-b border-border dark:border-white/5">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-inner">
            <Activity className="text-primary w-10 h-10" />
          </div>
          <div>
            <TypographySubtitle className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold mb-1">
              Global Impact Score
            </TypographySubtitle>
            <div className="flex items-end gap-2">
              <TypographyTitle className="text-4xl text-foreground font-black tracking-tighter">
                {stats.impactScore.toLocaleString()}
              </TypographyTitle>
              <span className="text-success text-sm font-semibold mb-1 flex items-center">
                ↑ Top 5%
              </span>
            </div>
            <TypographySubtitle className="text-xs mt-1 max-w-sm">
              Impact score is calculated based on project usage, community contributions, and active downloads.
            </TypographySubtitle>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-border dark:divide-white/5">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className={`p-5 flex flex-col gap-2 hover:bg-muted/30 transition-colors ${i >= 3 ? "border-t md:border-t-0 border-border dark:border-white/5 mt-[-1px] md:mt-0" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{metric.label}</span>
                {metric.icon}
              </div>
              <span className="text-2xl font-bold text-foreground mt-1">{metric.value}</span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </section>
  );
}
