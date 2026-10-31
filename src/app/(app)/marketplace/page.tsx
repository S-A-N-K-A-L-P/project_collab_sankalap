"use client";

import { useEffect, useState, useMemo } from "react";
import { Store, Loader2, IndianRupee, ArrowRight, Search } from "lucide-react";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");

  useEffect(() => {
    fetch("/api/showcase?forSale=true&sort=newest")
      .then(r => r.ok ? r.json() : [])
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.techStack?.some((t: string) => t.toLowerCase().includes(q))
    );
  }, [projects, query]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="saas-card-featured p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
              <Store className="w-3.5 h-3.5" />
              Project Licensing & Acquisition
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Marketplace
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Browse completed projects available for licensing, sponsorship, or one-time acquisition.
              Connect directly with project leads to discuss terms.
            </p>
          </div>
          <div className="saas-card px-4 py-2.5 text-right self-start md:self-auto shrink-0">
            <div className="text-xl font-bold text-primary tabular-nums leading-none">{projects.length}</div>
            <div className="text-[11px] font-medium text-muted mt-1">Active Listings</div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings by name, domain, or tech stack…"
              className="w-full pl-9 pr-3.5 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <IndianRupee className="w-3.5 h-3.5 text-primary" />
            <span>Direct peer-to-owner licensing and transfer agreements.</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading marketplace listings…</p>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Store size={30} />}
          title="No listings right now"
          description="Be the first to list a completed project. Publish your work to the marketplace to get discovered."
          action={
            <Button asChild>
              <Link href="/my-completed">
                Manage Completed Projects <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map(p => <ShowcaseCard key={p._id} project={p} />)}
        </div>
      )}
    </div>
  );
}
