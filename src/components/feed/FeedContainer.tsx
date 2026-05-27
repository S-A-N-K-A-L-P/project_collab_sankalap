"use client";

import { useEffect, useState } from "react";
import FeedList from "./FeedList";
import FeedActions from "@/app/(app)/feed/FeedActions";
import ProposalDetailPanel from "./ProposalDetailPanel";
import { Loader2 } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT } from "@/components/layout/constants";

/*
 * Two-panel heights:
 *   - TOP_NAV_HEIGHT  = 56px  (fixed top bar)
 *   - vertical padding = 32px top + 32px bottom (from AppLayoutClient p: 4)
 *   → available inner height = 100vh - 56 - 64 = 100vh - 120px
 */
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
        // Feed shows proposals only — activities go to the Notifications page
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
        <p className="text-sm text-muted">Loading feed…</p>
      </div>
    );
  }

  const isExpanded = selectedProposal !== null;
  const selectProposal = (p: any) =>
    setSelectedProposal((prev: any) => prev?._id === p._id ? null : p);

  /* ── Single-column (no selection) ───────────────────────── */
  if (!isExpanded) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <FeedActions />
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">Latest Proposals</h2>
          <span className="text-xs text-muted">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>
        <FeedList
          items={items}
          selectedProposalId={null}
          onExpandProposal={selectProposal}
        />
      </div>
    );
  }

  /* ── Two-panel (proposal selected) — each panel scrolls independently ─── */
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        height: PANEL_H,
        overflow: "hidden",       /* parent does NOT scroll */
        alignItems: "flex-start",
      }}
    >
      {/* LEFT — feed list, scrolls independently */}
      <div
        style={{
          width: "400px",
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
            <span className="text-xs text-muted">{items.length}</span>
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
        }}
        className="scrollbar-thin"
      >
        <ProposalDetailPanel
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      </div>
    </div>
  );
}
