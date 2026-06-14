"use client";

import { useState } from "react";
import Link from "next/link";
import ProposalCard from "./ProposalCard";
import ProposalDetailPanel from "./ProposalDetailPanel";
import { FileText } from "lucide-react";

interface ProposalFeedProps {
  proposals: any[];
  title?: string;
}

export default function ProposalFeed({ proposals, title }: ProposalFeedProps) {
  const [selected, setSelected] = useState<any | null>(null);

  const selectProposal = (p: any) =>
    setSelected((prev: any) => (prev?._id === p._id ? null : p));

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">No proposals yet</h3>
          <p className="text-sm text-muted mt-1">Be the first to share a project idea!</p>
        </div>
        <Link
          href="/ideas/create"
          className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Create Proposal
        </Link>
      </div>
    );
  }

  return (
    <div className={selected ? "flex gap-5 items-start" : "space-y-3"}>
      {/* Card list */}
      <div className={`space-y-3 ${selected ? "w-[400px] shrink-0" : "w-full"}`}>
        {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal._id}
            proposal={proposal}
            onExpand={() => selectProposal(proposal)}
            isActive={selected?._id === proposal._id}
          />
        ))}
      </div>

      {/* Detail panel — fixed height, scrolls internally */}
      {selected && (
        <div
          className="flex-1 min-w-0 overflow-y-auto scrollbar-thin"
          style={{ maxHeight: "calc(100vh - 140px)", position: "sticky", top: "80px" }}
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
