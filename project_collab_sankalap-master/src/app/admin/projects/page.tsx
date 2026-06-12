"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/app/admin/components/AdminShell";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { Search, ChevronLeft, ChevronRight, Loader2, ArrowUpRight, Users } from "lucide-react";

const STATUSES = ["planning", "active", "completed", "archived"];

interface ProjectRow {
  _id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  techStack: string[];
  lead?: { _id: string; name: string; avatar?: string };
  orgId?: { name: string };
  proposalId?: { title: string; totalVotes: number };
  members?: unknown[];
  createdAt: string;
}

function ProgressBar({ value }: { value: number }) {
  const pct   = Math.max(0, Math.min(100, value));
  const color =
    pct >= 100 ? "bg-emerald-500" :
    pct >= 60  ? "bg-accent"      :
    pct >= 30  ? "bg-yellow-500"  : "bg-red-400";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono text-muted w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("");

  const fetchProjects = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (search)  params.set("search", search);
    if (statusF) params.set("status", statusF);
    try {
      const res  = await fetch(`/api/admin/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [search, statusF]);

  useEffect(() => { fetchProjects(1); }, [fetchProjects]);

  return (
    <AdminShell>
      <div className="space-y-6">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProjects(1)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
            />
          </div>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="py-2.5 px-3 bg-surface border border-border-subtle rounded-xl text-[12px] font-bold uppercase text-muted outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <button
            onClick={() => fetchProjects(1)}
            className="py-2.5 px-4 bg-accent text-white rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all"
          >
            Filter
          </button>
          <span className="text-[11px] text-muted font-mono ml-auto">
            {total} project{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid cards */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-48 items-center justify-center bg-surface border border-border-subtle rounded-2xl">
            <p className="text-[13px] text-muted">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <Link
                key={proj._id}
                href={`/admin/projects/${proj._id}`}
                className="group bg-surface border border-border-subtle rounded-2xl p-5 hover:border-accent/30 transition-all flex flex-col gap-4"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                      {proj.title}
                    </p>
                    {proj.orgId && (
                      <p className="text-[10px] text-muted font-mono mt-0.5">{proj.orgId.name}</p>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
                </div>

                {/* Status + Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge value={proj.status} />
                    <ProgressBar value={proj.progress} />
                  </div>
                </div>

                {/* Tech stack */}
                {proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                    ))}
                    {proj.techStack.length > 4 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface text-muted">+{proj.techStack.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Footer: lead + members */}
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                      {proj.lead?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-[11px] text-muted font-mono truncate max-w-[120px]">
                      {proj.lead?.name ?? "No lead"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
                    <Users className="w-3 h-3" />
                    {(proj.members as any[])?.length ?? 0}
                  </div>
                </div>

                {/* Source proposal */}
                {proj.proposalId && (
                  <p className="text-[10px] text-muted font-mono line-clamp-1">
                    From: {proj.proposalId.title} · {proj.proposalId.totalVotes} votes
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted font-mono">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchProjects(page - 1)}
                className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= pages} onClick={() => fetchProjects(page + 1)}
                className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
