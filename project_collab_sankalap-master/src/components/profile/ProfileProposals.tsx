"use client";

import { useState } from "react";
import FeedList from "@/components/feed/FeedList";
import ProposalDetailPanel from "@/components/feed/ProposalDetailPanel";

export default function ProfileProposals({ proposals }: { proposals: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);

  const handleExpand = (p: any) =>
    setSelected((prev: any) => (prev?._id === p._id ? null : p));

  return (
    <div className={selected ? "flex gap-5 items-start" : undefined}>
      {/* Card list — pushed to left edge */}
      <div className={selected ? "w-[340px] shrink-0 space-y-3" : "space-y-3"}>
        <h2 className="text-sm font-semibold text-foreground">
          Proposals
          <span className="ml-2 text-xs font-normal text-muted">({proposals.length})</span>
        </h2>
        <FeedList
          items={proposals}
          selectedProposalId={selected?._id}
          onExpandProposal={handleExpand}
        />
      </div>

      {/* Detail panel — square-ish, fixed size */}
      {selected && (
        <div
          className="overflow-y-auto shrink-0"
          style={{
            width: "480px",
            maxHeight: "480px",
            position: "sticky",
            top: "80px",
          }}
        >
          <ProposalDetailPanel
            proposal={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}