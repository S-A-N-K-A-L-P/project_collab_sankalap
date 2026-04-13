"use client";

import FeedItemRenderer from "./FeedItemRenderer";

interface FeedListProps {
  items: any[];
}

export default function FeedList({ items }: FeedListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-16 text-center bg-[var(--surface-primary)] rounded-2xl border border-[var(--border-color)]">
        <p className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-widest font-black">No network signals detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedItemRenderer
          key={item._id}
          item={item}
          type={item.type ? (["VOTE", "JOIN", "CREATE_PROPOSAL", "FOLLOW", "COMMENT"].includes(item.type) ? "activity" : "proposal") : "proposal"}
        />
      ))}
    </div>
  );
}
