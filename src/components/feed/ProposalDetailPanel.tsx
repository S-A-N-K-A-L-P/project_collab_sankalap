"use client";

import { useState } from "react";
import { X, Users, Edit, Trash2, Tag, Clock, Activity, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import VoteButton from "../proposal/VoteButton";
import VoteLimitIndicator from "../proposal/VoteLimitIndicator";
import VotingTimer from "../proposal/VotingTimer";
import EditProposalModal from "../proposal/EditProposalModal";
import ProposalComments from "../proposal/ProposalComments";
import { formatIsoDate } from "@/lib/hydration-safe-date";

interface Proposal {
  _id: string; title: string; description: string; type: string; status: string;
  totalVotes: number; maxVotesPerUser: number; endTime: string;
  createdBy: { _id: string; name: string; avatar?: string; role?: string };
  contributors?: any[]; commentsCount?: number; techStack?: string[]; createdAt?: string;
}

const TYPE_COLOR: Record<string, string> = {
  project: "pill-info", module: "pill-primary",
  infrastructure: "pill-warning", protocol: "pill-research",
};
const STATUS_COLOR: Record<string, string> = {
  active: "pill-success", approved: "pill-success",
  rejected: "pill-error", proposal: "pill-warning",
  pending: "pill-warning",
};

function parseDescription(desc: string) {
  if (!desc) return [];
  const parts = desc.split(/\n?##\s+/);
  return parts.reduce<{ title: string; content: string }[]>((acc, part, i) => {
    const t = part.trim(); if (!t) return acc;
    if (i === 0 && !desc.startsWith("##")) { acc.push({ title: "Overview", content: t }); }
    else { const [h, ...rest] = t.split("\n"); acc.push({ title: h.trim(), content: rest.join("\n").trim() }); }
    return acc;
  }, []);
}

export default function ProposalDetailPanel({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
  const { data: session } = useSession();
  const [totalVotes, setTotalVotes] = useState(proposal.totalVotes || 0);
  const [userVotes, setUserVotes]   = useState(0);
  const [showEdit, setShowEdit]     = useState(false);

  const createdLabel = formatIsoDate(proposal.createdAt, "");
  const isAuthor     = (session?.user as any)?.id === proposal.createdBy?._id;
  const sections     = parseDescription(proposal.description);
  const typeColor    = TYPE_COLOR[proposal.type?.toLowerCase()]   ?? "pill-neutral";
  const statusColor  = STATUS_COLOR[proposal.status?.toLowerCase()] ?? "pill-neutral";

  const handleDelete = async () => {
    if (!confirm("Delete this proposal? This cannot be undone.")) return;
    const res = await fetch(`/api/proposals?id=${proposal._id}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
  };

  return (
    <div
      className="bg-card rounded-xl overflow-hidden divide-y divide-border elevation-3"
      style={{ border: "1.5px solid var(--border-strong)" }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex items-center justify-between bg-background/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden shrink-0">
            {proposal.createdBy?.avatar
              ? <img src={proposal.createdBy.avatar} alt="" className="w-full h-full object-cover" />
              : proposal.createdBy?.name?.[0] || "U"
            }
          </div>
          <div>
            <Link
              href={`/profile/${proposal.createdBy?._id || "#"}`}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              {proposal.createdBy?.name || "Unknown"}
            </Link>
            {createdLabel && (
              <p className="text-xs text-muted">Submitted {createdLabel}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isAuthor && (
            <>
              <button onClick={() => setShowEdit(true)} title="Edit"
                className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-primary transition-colors">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDelete} title="Delete"
                className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-foreground transition-colors border border-border ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Metadata grid ──────────────────────────────────── */}
      <div className="px-5 py-3.5 bg-background/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Type</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor}`}>
              {proposal.type}
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Status</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
              {proposal.status}
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Contributors</span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {(proposal.contributors?.length || 0) + 1}
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Voting Ends</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              <VotingTimer endTime={proposal.endTime} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Proposal content ────────────────────────────────── */}
      <div className="px-5 py-5 space-y-5">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <h2 className="text-base font-bold text-foreground leading-snug">
            {proposal.title}
          </h2>
        </div>

        <div className="space-y-4">
          {sections.map(sec => (
            <div key={sec.title}>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                {sec.title}
              </h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {proposal.techStack && proposal.techStack.length > 0 && (
          <div className="pt-3 border-t border-border">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {proposal.techStack.map(tag => (
                <span key={tag} className="pill-info text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-3 bg-background/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {totalVotes} upvote{totalVotes !== 1 ? "s" : ""}
          </span>
          <VoteLimitIndicator current={userVotes} max={proposal.maxVotesPerUser} />
        </div>
        <div className="flex items-center gap-2">
          <VoteButton proposalId={proposal._id} onVoteChange={(t, u) => { setTotalVotes(t); setUserVotes(u); }} />
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:text-foreground hover:border-border-strong hover:bg-background transition-colors">
            <Users className="w-3.5 h-3.5" /> Request to Join
          </button>
        </div>
      </div>

      {/* ── Comments ────────────────────────────────────────── */}
      <div className="px-5 py-4">
        <ProposalComments proposalId={proposal._id} />
      </div>

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
