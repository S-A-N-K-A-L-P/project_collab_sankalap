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
      className={`group relative overflow-hidden p-6 rounded-2xl border space-y-3 transition-shadow ${
        accent
          ? "bg-accent/10 border-accent/20"
          : "bg-surface border-border-subtle"
      }`}
    >
      <CardGlow background={background} />
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">
          {title}
        </p>
        <div className={`p-2 rounded-xl ${accent ? "bg-accent/20" : "bg-background"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-accent" : "text-muted"}`} />
        </div>
      </div>
      <p
        className={`relative z-10 text-3xl font-bold tracking-tight ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {description && (
        <p className="relative z-10 text-[11px] text-muted font-bold uppercase tracking-wider">
          {description}
        </p>
      )}
    </div>
  );
}
