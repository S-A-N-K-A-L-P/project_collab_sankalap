"use client";

import { useEffect, useState } from "react";
import FeedList from "./FeedList";
import FeedActions from "@/app/(app)/feed/FeedActions";
import ProposalDetailPanel from "./ProposalDetailPanel";
import { Loader2, Sparkles, ArrowUpRight, Layers, CheckCircle2 } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT } from "@/components/layout/constants";
import Link from "next/link";

const PANEL_H = `calc(100vh - ${TOP_NAV_HEIGHT + 64}px)`;

export default function FeedContainer() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const { setIsRightPanelCollapsed } = useLayout();

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed");
        if (!res.ok) { setItems([]); return; }
        const data = await res.json();
        const proposals = Array.isArray(data?.proposals) ? data.proposals : [];
        const combined  = proposals
          .map((p: any) => ({ ...p, feedType: "proposal" }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(combined);
      } catch { setItems([]); }
      finally  { setLoading(false); }
    }
    fetchFeed();
  }, []);

  useEffect(() => {
    setIsRightPanelCollapsed(selectedProposal !== null);
    return () => setIsRightPanelCollapsed(false);
  }, [selectedProposal, setIsRightPanelCollapsed]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted">Loading community feed…</p>
      </div>
    );
  }

  const isExpanded = selectedProposal !== null;
  const selectProposal = (p: any) =>
    setSelectedProposal((prev: any) => prev?._id === p._id ? null : p);

  const activeCount = items.filter(
    (p) => ["active", "approved"].includes((p.status || "").toLowerCase())
  ).length;

  /* ── Single-column (no selection) ───────────────────────── */
  if (!isExpanded) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-5">
        {/* Featured Workspace Banner */}
        <div className="saas-card-featured p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              Madhyam AI Workspace
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Community Proposals & Engineering Feed
            </h1>
            <p className="text-xs text-muted leading-relaxed max-w-md">
              Discover technical proposals, collaborate on active modules, and track engineering progress across organizations.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ideas/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-[0_2px_10px_-2px_rgba(98,87,232,0.4)]"
            >
              New Proposal
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="saas-card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground leading-none tabular-nums">{items.length}</p>
              <p className="text-[11px] font-medium text-muted mt-0.5">Total Proposals</p>
            </div>
          </div>
          <div className="saas-card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/12 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground leading-none tabular-nums">{activeCount}</p>
              <p className="text-[11px] font-medium text-muted mt-0.5">Active & Approved</p>
            </div>
          </div>
          <Link href="/tasks" className="saas-card px-4 py-3 flex items-center justify-between hover:border-primary/30 transition-all group">
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Task Board</p>
              <p className="text-[11px] text-muted mt-0.5">View Kanban</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <FeedActions />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Latest Proposals</h2>
          </div>
          <span className="pill-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {items.length} proposal{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <FeedList
          items={items}
          selectedProposalId={null}
          onExpandProposal={selectProposal}
        />
      </div>
    );
  }

  /* ── Two-panel (proposal selected) ──────────────────────── */
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        height: PANEL_H,
        overflow: "hidden",
        alignItems: "flex-start",
      }}
    >
      {/* LEFT — feed list, scrolls independently */}
      <div
        style={{
          width: "410px",
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "4px",
        }}
        className="scrollbar-thin"
      >
        <div className="space-y-4 pb-4">
          <FeedActions />
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">Latest Proposals</h2>
            <span className="pill-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{items.length}</span>
          </div>
          <FeedList
            items={items}
            selectedProposalId={selectedProposal._id}
            onExpandProposal={selectProposal}
          />
        </div>
      </div>

      {/* RIGHT — detail panel, scrolls independently */}
      <div
        style={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: 0,
        }}
        className="scrollbar-thin"
      >
        <ProposalDetailPanel
          key={selectedProposal._id}
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      </div>
    </div>
  );
}
