"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/app/admin/components/AdminShell";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { Search, ChevronLeft, ChevronRight, Loader2, ArrowUpRight, ThumbsUp, ThumbsDown } from "lucide-react";

const STATUSES = ["proposal", "approved", "active", "rejected", "closed", "draft"];
const STAGES   = ["proposal", "planning", "ideation", "architecture", "setup", "development", "completed"];
const TYPES    = ["idea", "research", "implementation", "collaboration", "protocol", "node", "infrastructure"];

interface ProposalRow {
  _id: string;
  title: string;
  type: string;
  status: string;
  stage: string;
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  createdBy: { _id: string; name: string; avatar?: string; role: string };
  projectLead?: { _id: string; name: string };
  techStack: string[];
  createdAt: string;
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusF, setStatusF]     = useState("");
  const [stageF, setStageF]       = useState("");
  const [typeF, setTypeF]         = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchProposals = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (search)  params.set("search",  search);
    if (statusF) params.set("status",  statusF);
    if (stageF)  params.set("stage",   stageF);
    if (typeF)   params.set("type",    typeF);
    try {
      const res  = await fetch(`/api/admin/proposals?${params}`);
      const data = await res.json();
      setProposals(data.proposals ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [search, statusF, stageF, typeF]);

  useEffect(() => { fetchProposals(1); }, [fetchProposals]);

  const quickPatch = async (id: string, status: string) => {
    setActioning(id);
    try {
      const res = await fetch("/api/admin/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setProposals((prev) => prev.map((p) => p._id === id ? { ...p, status } : p));
      }
    } finally {
      setActioning(null);
    }
  };

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
              onKeyDown={(e) => e.key === "Enter" && fetchProposals(1)}
              placeholder="Search proposals…"
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
            />
          </div>
          {[
            { value: statusF, set: setStatusF, opts: STATUSES, placeholder: "Status" },
            { value: stageF,  set: setStageF,  opts: STAGES,   placeholder: "Stage" },
            { value: typeF,   set: setTypeF,   opts: TYPES,    placeholder: "Type" },
          ].map(({ value, set, opts, placeholder }) => (
            <select
              key={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="py-2.5 px-3 bg-surface border border-border-subtle rounded-xl text-[12px] font-bold uppercase text-muted outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="">{placeholder}</option>
              {opts.map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
            </select>
          ))}
          <button
            onClick={() => fetchProposals(1)}
            className="py-2.5 px-4 bg-accent text-white rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all"
          >
            Filter
          </button>
          <span className="text-[11px] text-muted font-mono ml-auto">
            {total} proposal{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Proposal", "By", "Type", "Status", "Stage", "Votes", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-mono font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" /></td></tr>
                ) : proposals.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-[13px] text-muted">No proposals found</td></tr>
                ) : proposals.map((p) => (
                  <tr key={p._id} className="hover:bg-background/50 transition-colors group">
                    {/* Title */}
                    <td className="px-5 py-4 max-w-[260px]">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-foreground line-clamp-2 leading-snug">{p.title}</p>
                          {p.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {p.techStack.slice(0, 3).map((t) => (
                                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Link href={`/admin/proposals/${p._id}`} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="w-4 h-4 text-accent" />
                        </Link>
                      </div>
                    </td>
                    {/* Author */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-[12px] font-bold text-foreground">{p.createdBy?.name ?? "—"}</p>
                      <StatusBadge value={p.createdBy?.role ?? ""} />
                    </td>
                    {/* Type */}
                    <td className="px-5 py-4"><StatusBadge value={p.type} /></td>
                    {/* Status */}
                    <td className="px-5 py-4"><StatusBadge value={p.status} /></td>
                    {/* Stage */}
                    <td className="px-5 py-4"><StatusBadge value={p.stage} /></td>
                    {/* Votes */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[12px] font-mono">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ThumbsUp className="w-3 h-3" />{p.upvotes}
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <ThumbsDown className="w-3 h-3" />{p.downvotes}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {p.status !== "approved" && p.status !== "active" && (
                          <button
                            disabled={actioning === p._id}
                            onClick={() => quickPatch(p._id, "approved")}
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            {actioning === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                          </button>
                        )}
                        {p.status !== "rejected" && p.status !== "active" && (
                          <button
                            disabled={actioning === p._id}
                            onClick={() => quickPatch(p._id, "rejected")}
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        <Link
                          href={`/admin/proposals/${p._id}`}
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-muted font-mono">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => fetchProposals(page - 1)}
                  className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={page >= pages} onClick={() => fetchProposals(page + 1)}
                  className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
