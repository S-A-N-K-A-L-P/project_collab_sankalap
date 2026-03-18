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

  const isAuthor = (session?.user as any)?.id === proposal.createdBy._id;

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
    <div className="bg-[#17171a] border border-[#1f1f23] rounded-2xl overflow-hidden shadow-sm transition-all duration-150 hover:border-[#2a2a2f]">
        <div className="p-5 space-y-4">
            {/* Header: User Info & Timer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#121214] border border-[#1f1f23] flex items-center justify-center text-[11px] font-black text-[#e5e7eb] uppercase overflow-hidden">
                        {proposal.createdBy.avatar ? (
                            <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            proposal.createdBy.name[0]
                        )}
                    </div>
                    <div>
                        <Link href={`/profile/${proposal.createdBy._id}`} className="text-[14px] font-bold text-[#e5e7eb] hover:underline underline-offset-4 decoration-1">
                            {proposal.createdBy.name}
                        </Link>
                        <p className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-[0.05em] leading-none mt-1">
                            {proposal.createdBy.role?.replace('_', ' ') || "unverified"} • {new Date(proposal.createdAt || '').toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <VotingTimer endTime={proposal.endTime} />
                    {isAuthor && (
                        <div className="relative">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1 px-2 rounded-lg hover:bg-white/5 text-[#1f1f23] hover:text-[#e5e7eb] transition-all"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-[#121214] border border-[#1f1f23] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1f1f23]"
                                    >
                                        <button 
                                            onClick={() => { setShowEdit(true); setShowMenu(false); }}
                                            className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-[#6366f1] hover:bg-white/[0.02] flex items-center gap-3"
                                        >
                                            <Edit className="w-4 h-4" /> Edit Signal
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-red-500 hover:bg-red-500/5 flex items-center gap-3"
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
                    <span className="text-[9px] font-mono font-black text-[#6366f1] uppercase tracking-[0.15em] bg-[#6366f1]/10 px-1.5 py-0.5 rounded-md border border-[#6366f1]/20">
                        {proposal.type}
                    </span>
                    <h3 className="text-[17px] font-bold text-[#e5e7eb] tracking-tight leading-tight">{proposal.title}</h3>
                </div>
                <p className="text-[14px] text-[#9ca3af] leading-relaxed line-clamp-2 font-medium">
                    {proposal.description}
                </p>
            </div>

            {/* Tech Stack Tags */}
            {proposal.techStack && proposal.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {proposal.techStack.map(tag => (
                        <span key={tag} className="text-[10px] font-mono font-bold text-[#1f1f23] bg-[#121214] px-2.5 py-1 rounded-lg border border-[#1f1f23] uppercase tracking-tighter">
                            #{tag.toLowerCase()}
                        </span>
                    ))}
                </div>
            )}

            {/* Engagement Stats Bar */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-5 text-[11px] font-mono font-black text-[#9ca3af] uppercase tracking-tight">
                    <div className="flex items-center gap-1.5 group cursor-pointer hover:text-[#e5e7eb] transition-colors">
                        <Users className="w-4 h-4 text-[#1f1f23] fill-current" />
                        {proposal.contributors?.length || 0}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowBigUp className="w-4 h-4 text-[#6366f1] fill-current" />
                        {currentTotalVotes} Endorsements
                    </div>
                    <div className="flex items-center gap-1.5 group cursor-pointer hover:text-[#6366f1] transition-colors">
                        <MessageSquare className="w-4 h-4 text-[#1f1f23]" />
                        {proposal.commentsCount || 0}
                    </div>
                </div>

                {/* Vote Allocation Visualizer */}
                <VoteLimitIndicator current={userVotes} max={proposal.maxVotesPerUser} />
            </div>
        </div>

        {/* Action Bar (Professional System Style) */}
        <div className="px-5 py-3 bg-[#121214] border-t border-[#1f1f23] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <VoteButton proposalId={proposal._id} onVoteChange={handleVoteChange} />
                
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase text-[#9ca3af] hover:bg-white/[0.04] hover:text-[#e5e7eb] transition-all">
                    <Users className="w-4 h-4" /> Join Team
                </button>
                
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase text-[#9ca3af] hover:bg-white/[0.04] hover:text-[#e5e7eb] transition-all">
                    <Share2 className="w-4 h-4" /> Broadcast
                </button>
            </div>
            
            <Link 
                href={`/feed`} 
                className="text-[11px] font-black uppercase text-[#6366f1] hover:text-[#e5e7eb] transition-colors flex items-center gap-1.5 group"
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
