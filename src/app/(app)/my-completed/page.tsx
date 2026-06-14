"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { Trophy, Loader2, ExternalLink, Settings } from "lucide-react";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";

export default function MyCompletedPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/user/completed-projects")
      .then(r => r.ok ? r.json() : [])
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const userId = (session?.user as any)?.id;
  const leadOf = projects.filter(p => p.lead?._id === userId);
  const memberOf = projects.filter(p => p.lead?._id !== userId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-card border-l-4 border-l-amber-500 border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          My Completed Projects
        </h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Projects you've led or contributed to that have shipped.
          Manage showcase settings and push new releases from here.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading…</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl text-center">
          <Trophy className="w-12 h-12 text-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No completed projects yet</p>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Mark a project complete from its detail page when you've shipped v1.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lead-of section */}
          {leadOf.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 px-1">
                As Lead <span className="text-muted font-normal">({leadOf.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {leadOf.map(p => (
                  <div key={p._id} className="relative">
                    <ShowcaseCard project={p} />
                    <NextLink href={`/projects/${p._id}/showcase`}
                      className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm border border-border rounded-lg text-xs font-medium text-foreground hover:bg-card hover:text-primary transition-colors">
                      <Settings className="w-3 h-3" /> Edit
                    </NextLink>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Member-of section */}
          {memberOf.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 px-1">
                As Contributor <span className="text-muted font-normal">({memberOf.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {memberOf.map(p => <ShowcaseCard key={p._id} project={p} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
