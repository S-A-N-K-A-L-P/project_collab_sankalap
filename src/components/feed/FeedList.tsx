"use client";

import FeedItemRenderer from "./FeedItemRenderer";

interface FeedListProps {
  items: any[];
  selectedProposalId?: string | null;
  onExpandProposal?: (proposal: any) => void;
}

export default function FeedList({ items, selectedProposalId, onExpandProposal }: FeedListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-surface rounded-xl border border-border-subtle">
        <p className="text-muted font-mono text-[10px] uppercase tracking-widest font-black">No feed activity detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedItemRenderer
          key={item._id}
          item={item}
          type={item.type ? (["VOTE", "JOIN", "CREATE_PROPOSAL", "FOLLOW", "COMMENT"].includes(item.type) ? "activity" : "proposal") : "proposal"}
          selectedProposalId={selectedProposalId}
          onExpandProposal={onExpandProposal}
        />
      ))}
    </div>
  );
}
