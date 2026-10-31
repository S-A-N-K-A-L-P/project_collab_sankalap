"use client";

import { MessageSquare, Users, ChevronRight } from "lucide-react";
import { useState } from "react";
import VoteButton from "../proposal/VoteButton";
import { formatIsoDate } from "@/lib/hydration-safe-date";
import { useCardGlow, CardGlow } from "@/components/ui/card-glow";

interface ProposalCardProps {
  proposal: {
    _id: string; title: string; description: string; type: string; status: string;
    totalVotes: number; maxVotesPerUser: number; endTime: string;
    createdBy: { _id: string; name: string; avatar?: string; role?: string };
    contributors?: any[]; commentsCount?: number; techStack?: string[]; createdAt?: string;
  };
  onExpand?: () => void;
  isActive?: boolean;
}

const TYPE_COLOR: Record<string, string> = {
  project:        "pill-info",
  module:         "pill-primary",
  infrastructure: "pill-warning",
  protocol:       "pill-research",
};
const STATUS_COLOR: Record<string, string> = {
  active:   "pill-success",
  approved: "pill-success",
  rejected: "pill-error",
  proposal: "pill-warning",
  pending:  "pill-warning",
};

export default function ProposalCard({ proposal, onExpand, isActive }: ProposalCardProps) {
  const [, setTotalVotes] = useState(proposal.totalVotes || 0);
  const { onMouseMove, background } = useCardGlow();

  const createdLabel = formatIsoDate(proposal.createdAt, "");
  const typeColor    = TYPE_COLOR[proposal.type?.toLowerCase()]   ?? "pill-neutral";
  const statusColor  = STATUS_COLOR[proposal.status?.toLowerCase()] ?? "pill-neutral";

  const descPreview = (proposal.description || "")
    .replace(/^##\s+.+$/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();

  return (
    <div
      onClick={onExpand}
      onMouseMove={onMouseMove}
      className={`group relative rounded-[16px] cursor-pointer transition-all duration-200 overflow-hidden ${
        isActive
          ? "saas-card-selected"
          : "saas-card hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
      }`}
    >
      <CardGlow background={background} />

      {/* Card body */}
      <div className="relative z-10 p-5 space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-light border border-primary/15 flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden shrink-0">
              {proposal.createdBy?.avatar
                ? <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
                : proposal.createdBy?.name?.[0] || "U"
              }
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-foreground">
                {proposal.createdBy?.name || "Unknown"}
              </span>
              {createdLabel && (
                <span className="text-xs text-muted ml-1.5">· {createdLabel}</span>
              )}
            </div>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 capitalize ${typeColor}`}>
            {proposal.type}
          </span>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors">
            {proposal.title}
          </h3>
          <p className="text-xs text-muted leading-relaxed line-clamp-2">
            {descPreview}
          </p>
        </div>

        {/* Tech stack */}
        {proposal.techStack && proposal.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {proposal.techStack.slice(0, 4).map(tag => (
              <span key={tag} className="pill-info text-[10.5px] font-medium px-2.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-3 border-t border-border bg-background/45"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusColor}`}>
            {proposal.status || "pending"}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1" title="Contributors">
              <Users className="w-3.5 h-3.5" />
              {proposal.contributors?.length || 0}
            </span>
            <span className="flex items-center gap-1" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              {proposal.commentsCount || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VoteButton proposalId={proposal._id} onVoteChange={(t) => setTotalVotes(t)} />
          <button
            onClick={onExpand}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-2.5 py-1.5 rounded-xl hover:bg-primary-light cursor-pointer"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
