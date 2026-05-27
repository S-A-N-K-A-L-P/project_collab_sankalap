"use client";

import { MessageSquare, Users, ChevronRight } from "lucide-react";
import { useState } from "react";
import VoteButton from "../proposal/VoteButton";
import { formatIsoDate } from "@/lib/hydration-safe-date";

interface ProposalCardProps {
    proposal: {
        _id: string;
        title: string;
        description: string;
        type: string;
        status: string;
        totalVotes: number;
        maxVotesPerUser: number;
        endTime: string;
        createdBy: {
            _id: string;
            name: string;
            avatar?: string;
            role?: string;
        };
        contributors?: any[];
        commentsCount?: number;
        sharesCount?: number;
        techStack?: string[];
        createdAt?: string;
    };
    onExpand?: () => void;
    isActive?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  project:        "bg-blue-100 text-blue-800",
  module:         "bg-indigo-100 text-indigo-800",
  infrastructure: "bg-amber-100 text-amber-800",
  protocol:       "bg-purple-100 text-purple-800",
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  proposal: "bg-yellow-100 text-yellow-800",
  pending:  "bg-yellow-100 text-yellow-800",
};

export default function ProposalCard({ proposal, onExpand, isActive }: ProposalCardProps) {
    const [currentTotalVotes, setCurrentTotalVotes] = useState(proposal.totalVotes || 0);

    const createdLabel = formatIsoDate(proposal.createdAt, "");

    const handleVoteChange = (newTotal: number, _newUserVotes: number) => {
        setCurrentTotalVotes(newTotal);
    };

    const typeColor  = TYPE_COLORS[proposal.type?.toLowerCase()]  ?? "bg-gray-100 text-gray-700";
    const statusColor = STATUS_COLORS[proposal.status?.toLowerCase()] ?? "bg-gray-100 text-gray-700";

    return (
        <div
            onClick={onExpand}
            className={`
                bg-card rounded-xl shadow-sm cursor-pointer transition-all duration-150
                ${isActive
                    ? "border-l-4 border-l-primary border border-primary/20 shadow-md"
                    : "border border-border hover:shadow-md hover:border-border-strong"}
            `}
        >
            {/* Card body */}
            <div className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden shrink-0">
                            {proposal.createdBy?.avatar ? (
                                <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                proposal.createdBy?.name?.[0] || "U"
                            )}
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
                        {proposal.description}
                    </p>
                </div>

                {/* Tech stack tags */}
                {proposal.techStack && proposal.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {proposal.techStack.map(tag => (
                            <span key={tag} className="text-[10px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Action bar */}
            <div
                className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-background/40 rounded-b-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-4">
                    {/* Status pill */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                        {proposal.status || "pending"}
                    </span>

                    {/* Stats */}
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
                    <VoteButton
                        proposalId={proposal._id}
                        onVoteChange={handleVoteChange}
                    />
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
