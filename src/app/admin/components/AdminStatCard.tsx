"use client";

import { LucideIcon } from "lucide-react";
import { useCardGlow, CardGlow } from "@/components/ui/card-glow";

interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  accent?: boolean;
}

export default function AdminStatCard({
  title,
  value,
  icon: Icon,
  description,
  accent,
}: AdminStatCardProps) {
  const { onMouseMove, background } = useCardGlow();

  return (
    <div
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden p-5 rounded-[16px] space-y-2.5 transition-all ${
        accent
          ? "saas-card-featured"
          : "saas-card"
      }`}
    >
      <CardGlow background={background} />
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted">
          {title}
        </p>
        <div className={`p-2 rounded-xl ${accent ? "bg-primary-light border border-primary/15" : "bg-background border border-border"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted"}`} />
        </div>
      </div>
      <p
        className={`relative z-10 text-2xl font-bold tracking-tight tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {description && (
        <p className="relative z-10 text-[11px] text-muted font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
