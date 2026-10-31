"use client";

import ProposalCard from "./ProposalCard";
import { FileText } from "lucide-react";

interface FeedListProps {
  items: any[];
  selectedProposalId?: string | null;
  onExpandProposal?: (proposal: any) => void;
}

export default function FeedList({ items, selectedProposalId, onExpandProposal }: FeedListProps) {
  // Only render proposals — activity items belong in the Notifications/right panel
  const proposals = items.filter(
    item => item.feedType === "proposal" || !["VOTE","JOIN","CREATE_PROPOSAL","FOLLOW","COMMENT"].includes(item.type)
  );

  if (!proposals.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl text-center">
        <FileText className="w-10 h-10 text-muted/30 mb-3" />
        <p className="text-sm font-medium text-foreground">No proposals yet</p>
        <p className="text-xs text-muted mt-1">Be the first to submit one above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((item) => (
        <ProposalCard
          key={item._id}
          proposal={item}
          isActive={selectedProposalId === item._id}
          onExpand={onExpandProposal ? () => onExpandProposal(item) : undefined}
        />
      ))}
    </div>
  );
}
