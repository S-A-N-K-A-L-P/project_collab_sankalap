"use client";

import { MessageSquare, Users, ChevronRight } from "lucide-react";
import { useState } from "react";
import VoteButton from "../proposal/VoteButton";
import { formatIsoDate } from "@/lib/hydration-safe-date";

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
  project:        "bg-blue-100 text-blue-700",
  module:         "bg-indigo-100 text-indigo-700",
  infrastructure: "bg-amber-100 text-amber-700",
  protocol:       "bg-purple-100 text-purple-700",
};
const STATUS_COLOR: Record<string, string> = {
  active:   "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  proposal: "bg-yellow-100 text-yellow-800",
  pending:  "bg-yellow-100 text-yellow-800",
};

export default function ProposalCard({ proposal, onExpand, isActive }: ProposalCardProps) {
  const [totalVotes, setTotalVotes] = useState(proposal.totalVotes || 0);

  const createdLabel = formatIsoDate(proposal.createdAt, "");
  const typeColor    = TYPE_COLOR[proposal.type?.toLowerCase()]   ?? "bg-gray-100 text-gray-700";
  const statusColor  = STATUS_COLOR[proposal.status?.toLowerCase()] ?? "bg-gray-100 text-gray-700";

  // Strip ## markdown section headers so the preview shows clean prose
  const descPreview = (proposal.description || "")
    .replace(/^##\s+.+$/gm, "")   // remove ## header lines
    .replace(/\n{2,}/g, " ")       // collapse blank lines
    .replace(/\n/g, " ")           // remaining newlines → space
    .trim();

  return (
    <div
      onClick={onExpand}
      className="bg-card rounded-xl cursor-pointer transition-all duration-200"
      style={{
        /* MudBlazor-style multi-layer shadow */
        border: isActive
          ? "2px solid #6366f1"
          : "1.5px solid var(--border)",
        borderLeft: isActive ? "4px solid #4f46e5" : undefined,
        boxShadow: isActive
          ? "0 4px 12px rgba(99,102,241,0.15), 0 2px 6px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.02)",
      }}
      onMouseEnter={e => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.03)";
      }}
      onMouseLeave={e => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.02)";
      }}
    >
      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden shrink-0">
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
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${typeColor}`}>
            {proposal.type}
          </span>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-sm font-bold text-foreground leading-snug mb-1">
            {proposal.title}
          </h3>
          <p className="text-xs text-muted leading-relaxed line-clamp-2">
            {descPreview}
          </p>
        </div>

        {/* Tech stack */}
        {proposal.techStack && proposal.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {proposal.techStack.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action bar — separated with subtle top border + lighter bg */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-b-xl"
        style={{
          borderTop: "1.5px solid var(--border)",
          background: "color-mix(in srgb, var(--background) 60%, transparent)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
            {proposal.status || "pending"}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {proposal.contributors?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {proposal.commentsCount || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VoteButton proposalId={proposal._id} onVoteChange={(t) => setTotalVotes(t)} />
          <button
            onClick={onExpand}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
