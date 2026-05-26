"use client";

import ProposalCard from "./ProposalCard";
import ActivityCard from "./ActivityCard";

interface FeedItemRendererProps {
  item: any;
  type: "proposal" | "activity";
  selectedProposalId?: string | null;
  onExpandProposal?: (proposal: any) => void;
}

export default function FeedItemRenderer({ item, type, selectedProposalId, onExpandProposal }: FeedItemRendererProps) {
  if (type === "proposal") {
    return (
      <ProposalCard 
        proposal={item} 
        onExpand={onExpandProposal ? () => onExpandProposal(item) : undefined}
        isActive={selectedProposalId === item._id}
      />
    );
  }
  
  if (type === "activity") {
    return <ActivityCard activity={item} />;
  }

  return null;
}
