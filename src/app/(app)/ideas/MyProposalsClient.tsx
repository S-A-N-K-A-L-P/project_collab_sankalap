"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT } from "@/components/layout/constants";
import ProposalCard from "@/components/feed/ProposalCard";
import ProposalDetailPanel from "@/components/feed/ProposalDetailPanel";
import {
  Plus, Search, FileText, Layers, CheckCircle2, Clock,
  XCircle, TrendingUp, ArrowLeft, Lightbulb,
} from "lucide-react";

interface Proposal {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  stage?: string;
  totalVotes: number;
  maxVotesPerUser: number;
  endTime: string;
  createdBy: { _id: string; name: string; avatar?: string; role?: string };
  contributors?: any[];
  commentsCount?: number;
  techStack?: string[];
  createdAt?: string;
}

const PANEL_H = `calc(100vh - ${TOP_NAV_HEIGHT + 56}px)`;

/* ── Status filter definitions ───────────────────────────────────────── */
const FILTERS = [
  { id: "all",      label: "All"          },
  { id: "active",   label: "Active"       },
  { id: "proposal", label: "Under Review" },
  { id: "approved", label: "Approved"     },
  { id: "rejected", label: "Rejected"     },
  { id: "draft",    label: "Drafts"       },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

/* ── Stat tile ───────────────────────────────────────────────────────── */
function StatTile({
  label, value, icon: Icon, tone, active, onClick,
}: {
  label: string; value: number; icon: any;
  tone: "primary" | "green" | "amber" | "blue";
  active?: boolean; onClick?: () => void;
}) {
  const tones: Record<string, { bg: string; text: string; ring: string }> = {
    primary: { bg: "bg-primary/10",     text: "text-primary",     ring: "ring-primary"     },
    green:   { bg: "bg-green-500/10",   text: "text-green-600",   ring: "ring-green-500"   },
    amber:   { bg: "bg-amber-500/10",   text: "text-amber-600",   ring: "ring-amber-500"   },
    blue:    { bg: "bg-blue-500/10",    text: "text-blue-600",    ring: "ring-blue-500"    },
  };
  const t = tones[tone];
  return (
    <button
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 flex items-center gap-3 text-left transition-all hover:shadow-md ${
        active ? `ring-2 ${t.ring} ring-offset-1 ring-offset-background` : ""
      }`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className={`w-10 h-10 rounded-lg ${t.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${t.text}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none tabular-nums">{value}</p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>
    </button>
  );
}

export default function MyProposalsClient({ proposals }: { proposals: Proposal[] }) {
  const { setIsRightPanelCollapsed } = useLayout();
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [filter, setFilter]     = useState<FilterId>("all");
  const [query, setQuery]       = useState("");

  // Collapse the global right panel while a proposal is expanded (more room)
  useEffect(() => {
    setIsRightPanelCollapsed(selected !== null);
    return () => setIsRightPanelCollapsed(false);
  }, [selected, setIsRightPanelCollapsed]);

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    proposals.length,
    active:   proposals.filter(p => p.status === "active").length,
    review:   proposals.filter(p => p.status === "proposal").length,
    approved: proposals.filter(p => p.status === "approved").length,
  }), [proposals]);

  // ── Filtered + searched list ───────────────────────────────────────
  const visible = useMemo(() => {
    let list = proposals;
    if (filter !== "all") list = list.filter(p => p.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.techStack?.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [proposals, filter, query]);

  const selectProposal = (p: Proposal) =>
    setSelected(prev => (prev?._id === p._id ? null : p));

  const isExpanded = selected !== null;

  // ── Count badges per filter ─────────────────────────────────────────
  const filterCount = (id: FilterId) =>
    id === "all" ? proposals.length : proposals.filter(p => p.status === id).length;

  /* ═══════════════════════ EXPANDED (two-panel) ═══════════════════════ */
  if (isExpanded && selected) {
    return (
      <div className="w-full">
        {/* Compact toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All proposals
          </button>
          <span className="text-xs text-muted">·</span>
          <span className="text-sm font-semibold text-foreground">{selected.title}</span>
        </div>

        <div
          style={{ display: "flex", gap: 20, height: PANEL_H, overflow: "hidden", alignItems: "flex-start" }}
        >
          {/* LEFT — list */}
          <div
            style={{ width: 380, flexShrink: 0, height: "100%", overflowY: "auto", paddingRight: 4 }}
            className="scrollbar-thin"
          >
            <div className="space-y-3 pb-4">
              {visible.map(p => (
                <ProposalCard
                  key={p._id}
                  proposal={p}
                  isActive={selected._id === p._id}
                  onExpand={() => selectProposal(p)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — detail */}
          <div
            style={{ flex: 1, height: "100%", overflowY: "auto" }}
            className="scrollbar-thin"
          >
            <ProposalDetailPanel
              proposal={selected as any}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════ DEFAULT (single column) ═══════════════════ */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div
        className="bg-card border border-border rounded-xl p-6 relative overflow-hidden"
        style={{ borderLeft: "4px solid var(--primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              My Proposals
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed max-w-lg">
              Manage your submitted project proposals, track their review status,
              gather votes, and collaborate with contributors.
            </p>
          </div>
          <NextLink
            href="/ideas/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> New Proposal
          </NextLink>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Total"        value={stats.total}    icon={Layers}       tone="primary" active={filter === "all"}      onClick={() => setFilter("all")} />
        <StatTile label="Active"       value={stats.active}   icon={TrendingUp}   tone="green"   active={filter === "active"}   onClick={() => setFilter("active")} />
        <StatTile label="Under Review" value={stats.review}   icon={Clock}        tone="amber"   active={filter === "proposal"} onClick={() => setFilter("proposal")} />
        <StatTile label="Approved"     value={stats.approved} icon={CheckCircle2} tone="blue"    active={filter === "approved"} onClick={() => setFilter("approved")} />
      </div>

      {/* Search + filters */}
      <div className="bg-card border border-border rounded-xl p-3 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your proposals by title, description, or tech…"
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => {
            const count = filterCount(f.id);
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:text-foreground hover:bg-card-hover border border-border"
                }`}
              >
                {f.label}
                <span className={`text-[10px] tabular-nums ${active ? "text-white/80" : "text-muted/70"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List / empty states */}
      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No proposals yet</h3>
          <p className="text-sm text-muted mt-1 max-w-sm">
            Share your first project idea to start gathering votes and building a team.
          </p>
          <NextLink
            href="/ideas/create"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Create your first proposal
          </NextLink>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 bg-card border border-border rounded-xl text-center">
          <XCircle className="w-10 h-10 text-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No matching proposals</p>
          <p className="text-xs text-muted mt-1">Try a different filter or search term.</p>
          <button
            onClick={() => { setFilter("all"); setQuery(""); }}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">
              {filter === "all" ? "All Proposals" : FILTERS.find(f => f.id === filter)?.label}
              <span className="ml-2 text-xs font-normal text-muted">({visible.length})</span>
            </h2>
          </div>
          {visible.map(p => (
            <ProposalCard
              key={p._id}
              proposal={p}
              isActive={false}
              onExpand={() => selectProposal(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
