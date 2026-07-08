"use client";

import { useEffect, useState } from "react";
import { Store, Loader2, IndianRupee, ArrowRight } from "lucide-react";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/showcase?forSale=true&sort=newest")
      .then(r => r.ok ? r.json() : [])
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card border-l-4 border-l-emerald-600 border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="w-6 h-6 text-emerald-600" />
          Marketplace
        </h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Browse completed projects available for licensing or one-time purchase.
          Contact the project owners directly to discuss terms.
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>All transactions handled off-platform between buyer and project owner.</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading marketplace…</p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Store size={32} />}
          title="No listings right now"
          description="Be the first to list a completed project. Publish your work to the marketplace to get discovered."
          action={
            <Button asChild className="bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md">
              <Link href="/projects/new">
                Publish your first project <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => <ShowcaseCard key={p._id} project={p} />)}
        </div>
      )}
    </div>
  );
}
