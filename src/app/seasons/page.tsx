"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Loader2, Search, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import SeasonCard from "@/components/season/SeasonCard";
import type { ISeasonPublic, SeasonStatus } from "@/types/season";

const FILTERS: Array<{ value: "all" | SeasonStatus; label: string }> = [
  { value: "all",                 label: "All Programmes" },
  { value: "registration",        label: "Registration" },
  { value: "proposal_submission", label: "Proposals" },
  { value: "applications",        label: "Applications" },
  { value: "building",            label: "Building" },
  { value: "judging",             label: "Judging" },
  { value: "completed",           label: "Completed" },
];

export default function SeasonsPage() {
  const { data: session } = useSession();
  const [seasons, setSeasons] = useState<ISeasonPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | SeasonStatus>("all");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seasons?status=${filter}`)
      .then((res) => res.json())
      .then((data) => setSeasons(data.seasons || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const visible = seasons.filter((season) =>
    `${season.name} ${season.tagline} ${season.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AppLayoutClient>
      <div className="w-full space-y-6 pb-12 text-foreground">
        {/* Featured SaaS Hero Card */}
        <section className="saas-card-featured p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
                <CalendarRange size={13} /> Development Seasons
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Build with organizations and mentors
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                Join structured development seasons where organizations publish mentored proposals, contributors form teams, projects ship, and judges recognize the strongest outcomes.
              </p>
            </div>
            {session?.user && (
              <a
                href="/seasons/create"
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-[0_3px_12px_-2px_rgba(98,87,232,0.40)] transition-all self-start md:self-auto shrink-0"
              >
                <Plus size={15} /> Host a Season
              </a>
            )}
          </div>
        </section>

        {/* Search & Milestone Status Filter Bar */}
        <div className="saas-card p-3.5 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search development seasons by name, theme, or organization…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:bg-card focus:ring-3 focus:ring-primary/15 transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            {FILTERS.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-primary border-primary text-white shadow-[0_2px_8px_-2px_rgba(98,87,232,0.38)]"
                      : "bg-card border-border text-muted hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seasons Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={24} />
            <p className="text-xs text-muted">Loading development seasons…</p>
          </div>
        ) : visible.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map((season) => (
              <SeasonCard key={season._id} season={season} />
            ))}
          </div>
        ) : (
          <div className="saas-card text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
              <CalendarRange className="text-primary" size={22} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">No seasons found</h2>
            <p className="text-xs text-muted mt-1">New development seasons will appear here.</p>
          </div>
        )}
      </div>
    </AppLayoutClient>
  );
}
