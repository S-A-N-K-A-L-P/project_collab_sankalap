"use client";

import { ArrowRight, Building2, CalendarDays, FolderKanban, Users } from "lucide-react";
import type { ISeasonPublic } from "@/types/season";
import { SEASON_STATUS_LABELS } from "@/types/season";

export default function SeasonCard({ season }: { season: ISeasonPublic }) {
  const starts = season.timeline?.buildingStarts || season.timeline?.registrationOpens;
  return (
    <a href={`/seasons/${season.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/35 hover:shadow-xl transition-all">
      <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${season.themeColor || "#4f46e5"}, #111827)` }}>
        {season.bannerImage && <img src={season.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 border border-white/20 backdrop-blur text-[10px] font-semibold text-white uppercase tracking-wider">
          {SEASON_STATUS_LABELS[season.status]}
        </span>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-xl font-bold leading-tight">{season.name}</h2>
          {season.tagline && <p className="text-xs text-white/70 mt-1 line-clamp-1">{season.tagline}</p>}
        </div>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{season.description}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat icon={<Building2 size={13} />} value={season.stats?.organizationCount || 0} label="Orgs" />
          <Stat icon={<Users size={13} />} value={season.stats?.mentorCount || 0} label="Mentors" />
          <Stat icon={<FolderKanban size={13} />} value={season.stats?.projectCount || 0} label="Projects" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays size={13} /> {starts ? new Date(starts).toLocaleDateString() : "Dates to be announced"}</span>
          <span className="flex items-center gap-1 text-primary font-semibold">Explore <ArrowRight size={13} /></span>
        </div>
      </div>
    </a>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="rounded-xl bg-muted-bg p-2"><div className="flex items-center justify-center gap-1 font-bold text-sm">{icon}{value}</div><div className="text-[10px] text-muted-foreground mt-0.5">{label}</div></div>;
}
