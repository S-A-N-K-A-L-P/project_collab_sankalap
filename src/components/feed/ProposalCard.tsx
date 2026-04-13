"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowBigUp,
    MessageSquare,
    Share2,
    Users,
    MoreHorizontal,
    ExternalLink,
    Trash2,
    Edit
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import VoteButton from "../proposal/VoteButton";
import VoteLimitIndicator from "../proposal/VoteLimitIndicator";
import VotingTimer from "../proposal/VotingTimer";
import EditProposalModal from "../proposal/EditProposalModal";
import { useSession } from "next-auth/react";
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
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
    const { data: session } = useSession();
    const [currentTotalVotes, setCurrentTotalVotes] = useState(proposal.totalVotes || 0);
    const [userVotes, setUserVotes] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const createdLabel = formatIsoDate(proposal.createdAt, "unknown-date");

    const isAuthor = (session?.user as any)?.id === proposal.createdBy?._id;

    const handleVoteChange = (newTotal: number, newUserVotes: number) => {
        setCurrentTotalVotes(newTotal);
        setUserVotes(newUserVotes);
    };

    const handleDelete = async () => {
        if (!confirm("Confirm neutralizing this protocol? This action cannot be reversed.")) return;
        try {
            const res = await fetch(`/api/proposals?id=${proposal._id}`, { method: "DELETE" });
            if (res.ok) window.location.reload();
        } catch (err) {
            console.error("Deletion failed", err);
        }
    };

    return (
        <>
            <div className="bg-surface-alt border border-border-subtle rounded-2xl overflow-hidden shadow-sm transition-all duration-150 hover:border-border-strong">
                <div className="p-5 space-y-4">
                    {/* Header: User Info & Timer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-[11px] font-black text-foreground uppercase overflow-hidden">
                                {proposal.createdBy?.avatar ? (
                                    <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    proposal.createdBy?.name?.[0] || "U"
                                )}
                            </div>
                            <div>
                                <Link href={`/profile/${proposal.createdBy?._id || '#'}`} className="text-[14px] font-bold text-foreground hover:underline underline-offset-4 decoration-1">
                                    {proposal.createdBy?.name || "Unknown Agent"}
                                </Link>
                                <p className="text-[10px] text-muted font-mono uppercase tracking-[0.05em] leading-none mt-1">
                                    {proposal.createdBy?.role?.replace('_', ' ') || "unverified"} • {createdLabel}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <VotingTimer endTime={proposal.endTime} />
                            {isAuthor && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-1 px-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-muted hover:text-foreground transition-all"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    <AnimatePresence>
                                        {showMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-border-subtle"
                                            >
                                                <button
                                                    onClick={() => { setShowEdit(true); setShowMenu(false); }}
                                                    className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted hover:text-accent hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] flex items-center gap-3"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit Signal
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted hover:text-red-500 hover:bg-red-500/5 flex items-center gap-3"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Neutralize
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[9px] font-mono font-black text-accent uppercase tracking-[0.15em] bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/20">
                                {proposal.type}
                            </span>
                            <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-tight">{proposal.title}</h3>
                        </div>
                        <p className="text-[14px] text-muted leading-relaxed line-clamp-2 font-medium">
                            {proposal.description}
                        </p>
                    </div>

                    {/* Tech Stack Tags */}
                    {proposal.techStack && proposal.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {proposal.techStack.map(tag => (
                                <span key={tag} className="text-[10px] font-mono font-bold text-muted bg-surface px-2.5 py-1 rounded-lg border border-border-subtle uppercase tracking-tighter">
                                    #{tag.toLowerCase()}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Engagement Stats Bar */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-5 text-[11px] font-mono font-black text-muted uppercase tracking-tight">
                            <div className="flex items-center gap-1.5 group cursor-pointer hover:text-foreground transition-colors">
                                <Users className="w-4 h-4 text-muted fill-current" />
                                {proposal.contributors?.length || 0}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ArrowBigUp className="w-4 h-4 text-accent fill-current" />
                                {currentTotalVotes} Endorsements
                            </div>
                            <Link
                                href={`/ideas/${proposal._id}#comments`}
                                className="flex items-center gap-1.5 group cursor-pointer hover:text-accent transition-colors"
                                aria-label="Open proposal comments"
                            >
                                <MessageSquare className="w-4 h-4 text-muted" />
                                {proposal.commentsCount || 0}
                            </Link>
                        </div>

                        {/* Vote Allocation Visualizer */}
                        <VoteLimitIndicator current={userVotes} max={proposal.maxVotesPerUser} />
                    </div>
                </div>

                {/* Action Bar (Professional System Style) */}
                <div className="px-5 py-3 bg-surface border-t border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <VoteButton proposalId={proposal._id} onVoteChange={handleVoteChange} />

                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase text-muted hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] hover:text-foreground transition-all">
                            <Users className="w-4 h-4" /> Join Team
                        </button>

                        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase text-muted hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] hover:text-foreground transition-all">
                            <Share2 className="w-4 h-4" /> Broadcast
                        </button>
                    </div>

                    <Link
                        href={`/ideas/${proposal._id}`}
                        className="text-[11px] font-black uppercase text-accent hover:text-foreground transition-colors flex items-center gap-1.5 group"
                    >
                        Read Specs <ExternalLink className="w-3 h-3 transition-transform group-hover:rotate-45" />
                    </Link>
                </div>
            </div>

            <AnimatePresence>
                {showEdit && (
                    <EditProposalModal
                        proposal={proposal}
                        onClose={() => setShowEdit(false)}
                        onSuccess={() => window.location.reload()}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
