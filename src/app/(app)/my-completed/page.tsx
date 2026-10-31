"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { Trophy, Loader2, Settings, CheckCircle2 } from "lucide-react";
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

  const userId   = (session?.user as any)?.id;
  const leadOf   = projects.filter(p => p.lead?._id === userId);
  const memberOf = projects.filter(p => p.lead?._id !== userId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <div className="saas-card-featured p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed Work & Outcomes
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            My Completed Projects
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            Projects you&apos;ve led or contributed to that have shipped.
            Manage showcase visibility, documentation, and releases from here.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <div className="saas-card px-4 py-2.5 text-center">
            <div className="text-lg font-bold text-primary tabular-nums leading-none">{leadOf.length}</div>
            <div className="text-[11px] font-medium text-muted mt-1">As Lead</div>
          </div>
          <div className="saas-card px-4 py-2.5 text-center">
            <div className="text-lg font-bold text-foreground tabular-nums leading-none">{memberOf.length}</div>
            <div className="text-[11px] font-medium text-muted mt-1">As Contributor</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading completed projects…</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 saas-card text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">No completed projects yet</p>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Mark a project complete from its workspace page when you&apos;ve shipped v1.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lead-of section */}
          {leadOf.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-foreground">
                  Led by You <span className="text-muted font-medium ml-1">({leadOf.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {leadOf.map(p => (
                  <div key={p._id} className="relative">
                    <ShowcaseCard project={p} />
                    <NextLink
                      href={`/projects/${p._id}/showcase`}
                      className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 bg-card/95 backdrop-blur-sm border border-border rounded-xl text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-xs"
                    >
                      <Settings className="w-3 h-3" /> Manage
                    </NextLink>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Member-of section */}
          {memberOf.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-foreground">
                  Contributed To <span className="text-muted font-medium ml-1">({memberOf.length})</span>
                </h2>
              </div>
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
