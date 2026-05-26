"use client";

import { useState } from "react";
import { 
  X, 
  ArrowBigUp, 
  Users, 
  MessageSquare, 
  Edit, 
  Trash2 
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import VoteButton from "../proposal/VoteButton";
import VoteLimitIndicator from "../proposal/VoteLimitIndicator";
import VotingTimer from "../proposal/VotingTimer";
import EditProposalModal from "../proposal/EditProposalModal";
import ProposalComments from "../proposal/ProposalComments";
import { formatIsoDate } from "@/lib/hydration-safe-date";

interface ProposalDetailPanelProps {
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
  onClose: () => void;
}

// Enterprise content parser: splits raw markdown-like headers into structured semantic blocks
function parseDescription(description: string): { title: string; content: string }[] {
  if (!description) return [];
  
  const parts = description.split(/\n?##\s+/);
  const sections: { title: string; content: string }[] = [];
  
  parts.forEach((part, index) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    if (index === 0 && !description.startsWith("##")) {
      sections.push({ title: "Overview", content: trimmed });
    } else {
      const lines = trimmed.split("\n");
      const title = lines[0].trim();
      const content = lines.slice(1).join("\n").trim();
      sections.push({ title, content });
    }
  });
  
  return sections;
}

export default function ProposalDetailPanel({ proposal, onClose }: ProposalDetailPanelProps) {
  const { data: session } = useSession();
  const [currentTotalVotes, setCurrentTotalVotes] = useState(proposal.totalVotes || 0);
  const [userVotes, setUserVotes] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  const createdLabel = formatIsoDate(proposal.createdAt, "unknown-date");
  const isAuthor = (session?.user as any)?.id === proposal.createdBy?._id;

  const handleVoteChange = (newTotal: number, newUserVotes: number) => {
    setCurrentTotalVotes(newTotal);
    setUserVotes(newUserVotes);
  };

  const handleDelete = async () => {
    if (!confirm("Confirm deleting this proposal? This action cannot be reversed.")) return;
    try {
      const res = await fetch(`/api/proposals?id=${proposal._id}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error("Deletion failed", err);
    }
  };

  const sections = parseDescription(proposal.description);

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden shadow-none divide-y divide-border-subtle/50 h-[calc(100vh-140px)] sticky top-24 overflow-y-auto no-scrollbar">
      {/* 1. Header: Meta details & Close */}
      <div className="p-4 flex items-center justify-between bg-surface-alt/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-xs font-bold text-foreground uppercase overflow-hidden shrink-0">
            {proposal.createdBy?.avatar ? (
              <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              proposal.createdBy?.name?.[0] || "U"
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/profile/${proposal.createdBy?._id || '#'}`} className="text-[12px] font-bold text-foreground hover:underline hover:text-accent transition-colors">
                {proposal.createdBy?.name || "Unknown User"}
              </Link>
              <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-[8px] font-mono font-bold uppercase tracking-wider">
                {proposal.createdBy?.role?.replace('_', ' ') || "Member"}
              </span>
            </div>
            <p className="text-[9px] text-muted font-mono leading-none mt-0.5">
              Submitted {createdLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isAuthor && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowEdit(true)}
                className="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-accent transition-all"
                title="Edit Proposal"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-1.5 rounded hover:bg-red-500/5 text-muted hover:text-red-500 transition-all"
                title="Delete Proposal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-all ml-1 border border-border-subtle/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Structured Metadata Grid / Property Sheet */}
      <div className="p-4 bg-surface-alt/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-surface border border-border-subtle rounded-lg text-xs leading-normal">
          <div>
            <span className="block text-[8px] font-mono text-muted uppercase tracking-wider">Protocol Type</span>
            <span className="font-bold text-foreground uppercase tracking-tight">{proposal.type}</span>
          </div>
          <div>
            <span className="block text-[8px] font-mono text-muted uppercase tracking-wider">Status Mode</span>
            <span className="font-bold text-foreground uppercase tracking-tight">{proposal.status}</span>
          </div>
          <div>
            <span className="block text-[8px] font-mono text-muted uppercase tracking-wider">Node Syncs</span>
            <span className="font-bold text-foreground tracking-tight">{(proposal.contributors?.length || 0) + 1} Active</span>
          </div>
          <div>
            <span className="block text-[8px] font-mono text-muted uppercase tracking-wider">Time Remaining</span>
            <div className="font-bold text-foreground uppercase tracking-tight shrink-0 scale-95 origin-left">
              <VotingTimer endTime={proposal.endTime} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Proposal Content Canvas (Constrained max-w-2xl) */}
      <div className="p-5 space-y-5">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-[15px] font-bold text-foreground tracking-tight leading-snug uppercase">
            {proposal.title}
          </h2>
          
          {/* Render structured content sections */}
          <div className="space-y-4 pt-1">
            {sections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider">{sec.title}</p>
                <p className="text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{sec.content}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          {proposal.techStack && proposal.techStack.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-border-subtle/30">
              <h4 className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider">Technologies Utilized</h4>
              <div className="flex flex-wrap gap-1.5">
                {proposal.techStack.map(tag => (
                  <span key={tag} className="text-[9px] font-mono font-bold text-muted bg-surface-alt px-2.5 py-0.5 rounded border border-border-subtle uppercase tracking-tight">
                    #{tag.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Action Panel & Engagement Metrics */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono font-bold text-muted uppercase tracking-tight">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{proposal.contributors?.length || 0} Team Members</span>
          </div>
          <VoteLimitIndicator current={userVotes} max={proposal.maxVotesPerUser} />
        </div>

        <div className="flex items-center gap-2">
          <VoteButton proposalId={proposal._id} onVoteChange={handleVoteChange} />

          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-alt hover:bg-surface border border-border-subtle rounded text-[11px] font-bold uppercase text-muted hover:text-foreground transition-all">
            <Users className="w-3.5 h-3.5" /> Join Team
          </button>
        </div>
      </div>

      {/* 5. Embedded Live Comments */}
      <div className="p-4 bg-surface-alt/10">
        <ProposalComments proposalId={proposal._id} />
      </div>

      {/* Edit Proposal Modal */}
      {showEdit && (
        <EditProposalModal 
          proposal={proposal} 
          onClose={() => setShowEdit(false)} 
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
