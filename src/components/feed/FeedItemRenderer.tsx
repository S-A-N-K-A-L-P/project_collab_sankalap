"use client";

import ProposalCard from "./ProposalCard";
import ActivityCard from "./ActivityCard";

interface FeedItemRendererProps {
  item: any;
  type: "proposal" | "activity";
}

export default function FeedItemRenderer({ item, type }: FeedItemRendererProps) {
  if (type === "proposal") {
    return <ProposalCard proposal={item} />;
  }
  
  if (type === "activity") {
    return <ActivityCard activity={item} />;
  }

  return null;
}
