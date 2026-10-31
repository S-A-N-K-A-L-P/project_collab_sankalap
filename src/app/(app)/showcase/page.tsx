"use client";

import { useEffect, useState } from "react";
import { Trophy, Filter, Loader2, Sparkles } from "lucide-react";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";

type Sort = "newest" | "views" | "featured";

export default function ShowcasePage() {
  const [projects, setProjects]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sort, setSort]               = useState<Sort>("newest");
  const [forSaleOnly, setForSaleOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    qs.set("sort", sort);
    if (forSaleOnly) qs.set("forSale", "true");
    fetch(`/api/showcase?${qs.toString()}`)
      .then(r => r.ok ? r.json() : [])
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [sort, forSaleOnly]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="saas-card-featured p-6 md:p-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Shipped Community Builds
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              Project Showcase
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Explore completed projects built by the Madhyam AI community.
              View live deployments, architecture documentation, or inquire about licensing.
            </p>
          </div>
          <div className="saas-card px-4 py-2.5 text-right shrink-0">
            <div className="text-xl font-bold text-primary tabular-nums leading-none">{projects.length}</div>
            <div className="text-[11px] font-medium text-muted mt-1">Shipped Projects</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-primary/10 flex-wrap">
          <Filter className="w-4 h-4 text-muted" />
          <div className="flex gap-1.5">
            {(["newest","featured","views"] as Sort[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all border cursor-pointer ${
                  sort === s
                    ? "bg-primary border-primary text-white shadow-[0_2px_8px_-2px_rgba(98,87,232,0.38)]"
                    : "bg-card border-border text-muted hover:text-foreground hover:border-primary/30"
                }`}
              >
                {s === "newest" ? "Newest" : s === "featured" ? "Featured" : "Most Viewed"}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forSaleOnly}
              onChange={e => setForSaleOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-xs font-semibold text-foreground">Available for licensing</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading showcase…</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 saas-card text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">No completed projects yet</p>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Once active projects ship their first release, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => <ShowcaseCard key={p._id} project={p} />)}
        </div>
      )}
    </div>
  );
}
