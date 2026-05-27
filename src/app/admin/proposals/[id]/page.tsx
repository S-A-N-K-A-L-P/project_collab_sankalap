"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/app/admin/components/AdminShell";
import StatusBadge from "@/app/admin/components/StatusBadge";
import ProposerCard from "@/app/admin/components/ProposerCard";
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Loader2,
  CheckCircle, XCircle, FolderKanban, UserCheck,
} from "lucide-react";

const STAGES = [
  "proposal","planning","ideation","architecture","setup","development","completed",
] as const;

interface Proposal {
  _id: string; title: string; description: string; type: string;
  status: string; stage: string; techStack: string[];
  totalVotes: number; upvotes: number; downvotes: number; commentsCount: number;
  teamSize: number; createdAt: string;
  createdBy: any; projectLead?: any;
}

export default function ProposalDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [proposal, setProposal]       = useState<Proposal | null>(null);
  const [voteStats, setVoteStats]     = useState({ upvotes: 0, downvotes: 0 });
  const [otherProps, setOtherProps]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  // Action state
  const [stage, setStage]             = useState("");
  const [saving, setSaving]           = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({ title: "", description: "", leadId: "" });
  const [converting, setConverting]   = useState(false);
  const [convertedProject, setConvertedProject] = useState<string | null>(null);
  const [userSearch, setUserSearch]   = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [leadSelected, setLeadSelected] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/proposals/${id}`);
      const data = await res.json();
      setProposal(data.proposal);
      setVoteStats(data.voteStats ?? { upvotes: 0, downvotes: 0 });
      setOtherProps(data.otherProposals ?? []);
      setStage(data.proposal?.stage ?? "");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patch = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res  = await fetch(`/api/admin/proposals/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setProposal(updated);
        setStage(updated.stage ?? stage);
      }
    } finally {
      setSaving(false);
    }
  };

  const searchUsers = async (q: string) => {
    if (!q.trim()) { setUserResults([]); return; }
    const res  = await fetch(`/api/mobile/admin/users?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setUserResults(Array.isArray(data) ? data.slice(0, 6) : []);
  };

  const convert = async () => {
    if (!proposal) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/proposals/${id}/convert`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       convertForm.title       || proposal.title,
          description: convertForm.description || proposal.description,
          leadId:      leadSelected?._id       || undefined,
        }),
      });
      if (res.ok) {
        const { project } = await res.json();
        setConvertedProject(project._id);
        setConvertOpen(false);
        load();
      }
    } finally {
      setConverting(false);
    }
  };

  if (loading) return (
    <AdminShell>
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    </AdminShell>
  );

  if (!proposal) return (
    <AdminShell>
      <div className="text-center py-16 text-muted">Proposal not found.</div>
    </AdminShell>
  );

  const total    = voteStats.upvotes + voteStats.downvotes;
  const upPct    = total > 0 ? Math.round((voteStats.upvotes / total) * 100) : 0;
  const canConvert = ["approved", "active"].includes(proposal.status);

  return (
    <AdminShell>
      <div className="space-y-6 max-w-[1200px]">

        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/admin/proposals"
            className="p-2 rounded-xl border border-border-subtle text-muted hover:text-foreground hover:border-border-strong transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[11px] font-mono text-muted uppercase tracking-widest">
            Proposals / {proposal._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Converted banner */}
        {convertedProject && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-[13px] font-bold text-emerald-300">
                Proposal converted to a project successfully.
              </p>
            </div>
            <Link href={`/admin/projects/${convertedProject}`}
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors whitespace-nowrap">
              Open Project →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          {/* ── LEFT ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Header card */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground leading-tight">{proposal.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={proposal.status} size="md" />
                    <StatusBadge value={proposal.stage} size="md" />
                    <StatusBadge value={proposal.type} size="md" />
                  </div>
                </div>
                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {proposal.status !== "approved" && proposal.status !== "active" && (
                    <button
                      disabled={saving}
                      onClick={() => patch({ status: "approved", stage: "planning" })}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}
                  {proposal.status !== "rejected" && (
                    <button
                      disabled={saving}
                      onClick={() => patch({ status: "rejected" })}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                  {canConvert && !convertedProject && (
                    <button
                      onClick={() => { setConvertForm({ title: proposal.title, description: proposal.description, leadId: "" }); setConvertOpen(true); }}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      Convert to Project
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[14px] text-muted leading-relaxed">{proposal.description}</p>
              {proposal.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proposal.techStack.map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-accent/10 text-accent">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Vote bar */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Community Vote</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-[18px] font-bold">{voteStats.upvotes}</span>
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${upPct}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-[18px] font-bold">{voteStats.downvotes}</span>
                  <ThumbsDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted font-mono">
                <span>{total} total votes · {upPct}% approval</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {proposal.commentsCount} comments
                </span>
              </div>
            </div>

            {/* Stage + Lead controls */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
              <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Admin Controls</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stage */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Stage</label>
                  <div className="flex gap-2">
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="flex-1 py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-[12px] font-bold uppercase text-muted outline-none focus:border-accent/50 cursor-pointer"
                    >
                      {STAGES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                    <button
                      disabled={saving || stage === proposal.stage}
                      onClick={() => patch({ stage })}
                      className="px-3 py-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                    </button>
                  </div>
                </div>

                {/* Assign lead */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Project Lead</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      value={leadSelected ? leadSelected.name : userSearch}
                      onChange={(e) => {
                        setLeadSelected(null);
                        setUserSearch(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      placeholder={proposal.projectLead?.name ?? "Search member…"}
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
                    />
                    {userResults.length > 0 && !leadSelected && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-subtle rounded-xl shadow-lg z-20 overflow-hidden">
                        {userResults.map((u) => (
                          <button
                            key={u._id}
                            onClick={() => { setLeadSelected(u); setUserSearch(""); setUserResults([]); patch({ projectLead: u._id }); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background transition-colors text-left"
                          >
                            <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0">
                              {u.name[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-bold text-foreground truncate">{u.name}</p>
                              <p className="text-[10px] text-muted font-mono truncate">{u.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {proposal.projectLead && (
                    <p className="text-[10px] text-muted font-mono">
                      Current: <span className="text-accent">{proposal.projectLead.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Convert to Project modal */}
            {convertOpen && (
              <div className="bg-surface border border-accent/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">Convert to Project</p>
                  <button onClick={() => setConvertOpen(false)} className="text-muted hover:text-foreground text-[11px] font-bold uppercase tracking-wider">Cancel</button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Project Title</label>
                    <input
                      value={convertForm.title}
                      onChange={(e) => setConvertForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground outline-none focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Description</label>
                    <textarea
                      rows={3}
                      value={convertForm.description}
                      onChange={(e) => setConvertForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground outline-none focus:border-accent/50 resize-none"
                    />
                  </div>
                  {leadSelected && (
                    <p className="text-[11px] text-muted font-mono">
                      Lead: <span className="text-accent font-bold">{leadSelected.name}</span>
                      <button onClick={() => setLeadSelected(null)} className="ml-2 text-red-400 hover:text-red-300">×</button>
                    </p>
                  )}
                </div>
                <button
                  disabled={converting}
                  onClick={convert}
                  className="w-full py-3 rounded-xl bg-accent text-white text-[12px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {converting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Project"}
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT ────────────────────────────────────────────── */}
          <div className="space-y-5">
            {proposal.createdBy && (
              <ProposerCard user={proposal.createdBy} otherProposals={otherProps} />
            )}
            {/* Meta */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Meta</p>
              {[
                { label: "ID",       value: proposal._id.slice(-8).toUpperCase() },
                { label: "Team",     value: `${proposal.teamSize} member${proposal.teamSize !== 1 ? "s" : ""}` },
                { label: "Created",  value: new Date(proposal.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted font-mono uppercase tracking-wider">{label}</span>
                  <span className="text-[12px] font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
