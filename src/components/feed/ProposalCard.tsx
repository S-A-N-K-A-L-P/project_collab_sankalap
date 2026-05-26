"use client";

import { ArrowBigUp, MessageSquare, Users } from "lucide-react";
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

export default function ProposalCard({ proposal, onExpand, isActive }: ProposalCardProps) {
    const [currentTotalVotes, setCurrentTotalVotes] = useState(proposal.totalVotes || 0);
    const [userVotes, setUserVotes] = useState(0);

    const createdLabel = formatIsoDate(proposal.createdAt, "unknown-date");

    const handleVoteChange = (newTotal: number, newUserVotes: number) => {
        setCurrentTotalVotes(newTotal);
        setUserVotes(newUserVotes);
    };

    return (
        <div 
            onClick={onExpand}
            className={`bg-surface border ${isActive ? "border-accent bg-accent/5 ring-1 ring-accent/10" : "border-border-subtle hover:border-border-strong"} rounded-xl p-4 transition-all duration-150 cursor-pointer space-y-3 shadow-none`}
        >
            {/* Header: Identity must be strong */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-border-subtle bg-surface-alt flex items-center justify-center text-xs font-bold text-foreground uppercase overflow-hidden shrink-0">
                        {proposal.createdBy?.avatar ? (
                            <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            proposal.createdBy?.name?.[0] || "U"
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12px] font-bold text-foreground leading-none">
                                {proposal.createdBy?.name || "Unknown User"}
                            </span>
                            <span className="text-[10px] text-muted font-mono leading-none">
                                • {proposal.createdBy?.role?.replace('_', ' ') || "Member"}
                            </span>
                            <span className="text-[10px] text-muted font-mono leading-none">
                                • {createdLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <span className="text-[8px] font-mono font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20 shrink-0">
                    {proposal.type}
                </span>
            </div>

            {/* Body */}
            <div className="space-y-1">
                <h3 className="text-[13.5px] font-bold text-foreground tracking-tight leading-snug">
                    {proposal.title}
                </h3>
                <p className="text-[12px] text-muted leading-relaxed line-clamp-2">
                    {proposal.description}
                </p>
            </div>

            {/* Tech Stack Context */}
            {proposal.techStack && proposal.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {proposal.techStack.map(tag => (
                        <span key={tag} className="text-[9px] font-mono font-bold text-muted bg-surface-alt px-2 py-0.5 rounded border border-border-subtle/50 uppercase tracking-tight">
                            #{tag.toLowerCase()}
                        </span>
                    ))}
                </div>
            )}

            {/* Action Bar (Scannable, compact) */}
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-muted uppercase tracking-tight">
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted" />
                        <span>{proposal.contributors?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ArrowBigUp className="w-3.5 h-3.5 text-accent fill-accent/10" />
                        <span>{currentTotalVotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-muted" />
                        <span>{proposal.commentsCount || 0}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <VoteButton proposalId={proposal._id} onVoteChange={handleVoteChange} />
                    <button 
                        onClick={onExpand}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase text-accent hover:bg-accent/10 transition-all flex items-center gap-1 shrink-0"
                    >
                        Expand →
                    </button>
                </div>
            </div>
        </div>
    );
}
