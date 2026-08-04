"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Loader2, Search } from "lucide-react";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import SeasonCard from "@/components/season/SeasonCard";
import type { ISeasonPublic, SeasonStatus } from "@/types/season";

const FILTERS: Array<{ value: "all" | SeasonStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "registration", label: "Registration" },
  { value: "proposal_submission", label: "Proposals" },
  { value: "applications", label: "Applications" },
  { value: "building", label: "Building" },
  { value: "judging", label: "Judging" },
  { value: "completed", label: "Completed" },
];

export default function SeasonsPage() {
  const { data: session } = useSession();
  const [seasons, setSeasons] = useState<ISeasonPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | SeasonStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seasons?status=${filter}`)
      .then((res) => res.json())
      .then((data) => setSeasons(data.seasons || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const visible = seasons.filter((season) => `${season.name} ${season.tagline} ${season.description}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayoutClient>
      <div className="w-full pb-16 text-foreground">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-tertiary/10 pointer-events-none" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-3"><CalendarRange size={15} /> Seasons of Development</div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Build with organizations and mentors</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">Join structured development seasons where organizations publish mentored proposals, contributors form teams, projects ship, and judges recognize the strongest outcomes.</p>
            {session?.user && <a href="/seasons/create" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus size={15} /> Host a season</a>}
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search seasons..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-primary" /></div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={`px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${filter === item.value ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{item.label}</button>)}
          </div>
        </div>

        {loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" /></div> : visible.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{visible.map((season) => <SeasonCard key={season._id} season={season} />)}</div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card"><CalendarRange className="mx-auto text-muted-foreground mb-3" size={34} /><h2 className="font-semibold">No seasons found</h2><p className="text-sm text-muted-foreground mt-1">New development seasons will appear here.</p></div>
        )}
      </div>
    </AppLayoutClient>
  );
}
