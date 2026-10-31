"use client";

import { ArrowRight, Building2, CalendarDays, FolderKanban, Users } from "lucide-react";
import type { ISeasonPublic } from "@/types/season";
import { SEASON_STATUS_LABELS } from "@/types/season";

export default function SeasonCard({ season }: { season: ISeasonPublic }) {
  const starts = season.timeline?.buildingStarts || season.timeline?.registrationOpens;
  return (
    <a
      href={`/seasons/${season.slug}`}
      className="group saas-card overflow-hidden flex flex-col hover:border-primary/35 hover:shadow-[var(--shadow-md)] transition-all duration-200"
    >
      {/* Top Banner */}
      <div
        className="relative h-36 overflow-hidden border-b border-border"
        style={{
          background: `linear-gradient(135deg, ${season.themeColor || "#6257E8"} 0%, #24243A 100%)`,
        }}
      >
        {season.bannerImage && (
          <img
            src={season.bannerImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-[10.5px] font-semibold text-primary uppercase tracking-wider shadow-2xs">
          {SEASON_STATUS_LABELS[season.status]}
        </span>
        <div className="absolute bottom-3.5 left-4 right-4 text-white">
          <h2 className="text-lg font-bold leading-tight">{season.name}</h2>
          {season.tagline && (
            <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{season.tagline}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
          {season.description}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center mt-auto">
          <Stat icon={<Building2 size={13} className="text-primary" />} value={season.stats?.organizationCount || 0} label="Orgs" />
          <Stat icon={<Users size={13} className="text-primary" />} value={season.stats?.mentorCount || 0} label="Mentors" />
          <Stat icon={<FolderKanban size={13} className="text-primary" />} value={season.stats?.projectCount || 0} label="Projects" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
          <span className="flex items-center gap-1.5 text-muted">
            <CalendarDays size={13} className="text-primary" />
            {starts ? new Date(starts).toLocaleDateString() : "Dates TBA"}
          </span>
          <span className="flex items-center gap-1 text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
            Explore <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </a>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-background border border-border p-2">
      <div className="flex items-center justify-center gap-1 font-bold text-xs text-foreground">
        {icon}
        {value}
      </div>
      <div className="text-[10.5px] text-muted mt-0.5">{label}</div>
    </div>
  );
}
