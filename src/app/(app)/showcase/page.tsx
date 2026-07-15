"use client";

import { useEffect, useState } from "react";
import { Trophy, Filter, Loader2 } from "lucide-react";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";

type Sort = "newest" | "views" | "featured";

export default function ShowcasePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState<Sort>("newest");
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card border-l-4 border-l-primary border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Project Showcase
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Browse completed projects from the S.A.N.K.A.L.P. community.
              View live demos, read business docs, or inquire about licensing.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border flex-wrap">
          <Filter className="w-4 h-4 text-muted" />
          <div className="flex gap-1.5">
            {(["newest","featured","views"] as Sort[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all border ${
                  sort === s
                    ? "bg-gradient-to-r from-primary to-primary-hover dark:from-indigo-500 dark:to-purple-500 border-transparent text-primary-foreground dark:text-white shadow-sm"
                    : "bg-card dark:bg-white/5 border-border text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80 hover:border-primary/40 dark:hover:border-white/20"
                }`}
              >
                {s === "newest" ? "Newest" : s === "featured" ? "Featured" : "Most viewed"}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forSaleOnly}
              onChange={e => setForSaleOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs font-medium text-foreground">For sale only</span>
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
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <Trophy className="w-12 h-12 text-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No completed projects yet</p>
          <p className="text-xs text-muted mt-1 max-w-sm text-center">
            Once active projects ship their first release, they'll appear here.
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
