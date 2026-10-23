"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- API payloads are runtime-shaped. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { GitPullRequest, Github, Link2, Loader2, RefreshCw, Settings2, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { ago, type Gate, type PRSnapshot } from "@/app/admin/components/project/pipeline";
import { GateDots, LiveDot, Pill } from "@/app/admin/components/project/ui";
import { PullRequestDetail } from "@/app/admin/components/project/TaskDrawer";

interface Item {
  taskId: string; title: string; assignedToName: string; targetBranch: string; baseBranch: string;
  latestCommitSha: string; verificationGate: Gate; pullRequest: PRSnapshot;
  verification: "fresh" | "stale" | "unknown"; mergeGate: { allowed: boolean; reasons: string[] };
}
interface Payload {
  configured: boolean; githubMode: "app" | "token" | "none"; githubRepo: string; githubInstallationId: string;
  githubLastWebhookAt: string | null; pullRequests: Item[];
}

type Col = "checks" | "review" | "changes" | "ready" | "done";
const COLS: { id: Col; label: string; accent: string }[] = [
  { id: "checks", label: "Checks running", accent: "border-t-sky-500" },
  { id: "review", label: "Needs review", accent: "border-t-violet-500" },
  { id: "changes", label: "Changes / blocked", accent: "border-t-amber-500" },
  { id: "ready", label: "Merge ready", accent: "border-t-emerald-500" },
  { id: "done", label: "Merged / closed", accent: "border-t-zinc-400" },
];

function column(i: Item): Col {
  const pr = i.pullRequest;
  if (pr.state === "merged" || pr.state === "closed") return "done";
  if (i.mergeGate.allowed) return "ready";
  if (pr.reviewDecision === "changes_requested" || i.verification === "stale" || pr.mergeable === false) return "changes";
  if ((pr.checks || []).some((c) => c.status !== "completed")) return "checks";
  return "review";
}

const toDetail = (i: Item) => ({
  _id: i.taskId, title: i.title, latestCommitSha: i.latestCommitSha, verificationGate: i.verificationGate,
  pullRequest: i.pullRequest, verification: i.verification, mergeGate: i.mergeGate,
});

export default function PullRequestsPanel({ projectId }: { projectId: string; repo?: string; installationId?: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [showConn, setShowConn] = useState(false);
  const [install, setInstall] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (refresh = false) => {
    const res = await fetch(`/api/admin/projects/${projectId}/pull-requests${refresh ? "?refresh=1" : ""}`, { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { setError(body.error || "Could not load pull requests"); return; }
    setError(""); setData(body); setUpdatedAt(Date.now());
    setInstall((v) => v || body.githubInstallationId || "");
  }, [projectId]);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 20_000);
    return () => clearInterval(t);
  }, [load]);

  const grouped = useMemo(() => {
    const m = new Map<Col, Item[]>(COLS.map((c) => [c.id, []]));
    for (const i of data?.pullRequests || []) m.get(column(i))!.push(i);
    return m;
  }, [data]);

  const saveInstallation = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ githubInstallationId: install }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save GitHub installation");
      await load(true);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };

  if (!data) return <div className="flex h-40 items-center justify-center">{error ? <p className="text-[12px] text-red-500">{error}</p> : <Loader2 className="w-5 h-5 animate-spin text-accent" />}</div>;

  const current = data.pullRequests.find((i) => i.taskId === open);
  const counts = { open: data.pullRequests.filter((i) => i.pullRequest.state === "open").length, ready: grouped.get("ready")!.length };

  return (
    <div className="space-y-4">
      {/* Connection bar */}
      <div className="bg-surface border border-border-subtle rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3">
        <Github className="w-4 h-4 text-foreground" />
        <span className="text-[12px] font-bold text-foreground truncate max-w-[280px]">{data.githubRepo || "No repository linked"}</span>
        <Pill cls={data.configured ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}>
          {data.githubMode === "app" ? "GitHub App" : data.githubMode === "token" ? "Token" : "Not connected"}
        </Pill>
        <span className="text-[10px] font-mono text-muted">webhook {data.githubLastWebhookAt ? ago(data.githubLastWebhookAt) : "not received (polling every 20 s)"}</span>
        <span className="text-[10px] font-mono text-muted">· {counts.open} open · {counts.ready} merge-ready</span>
        <span className="ml-auto flex items-center gap-2">
          <LiveDot updatedAt={updatedAt} />
          <button onClick={() => load(true)} className="p-1.5 rounded-lg text-muted hover:text-accent" title="Refresh all from GitHub"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button onClick={() => setShowConn((v) => !v)} className="p-1.5 rounded-lg text-muted hover:text-accent" title="Connection settings"><Settings2 className="w-3.5 h-3.5" /></button>
        </span>
      </div>

      {(showConn || !data.configured) && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3">
          <p className="text-[12px] text-muted">
            Connect GitHub with the Syncro GitHub App (enter this repository&apos;s installation ID) or set <code className="font-mono text-foreground">GITHUB_TOKEN</code> on the server.
            Credentials never leave the server; members&apos; PCs only push their own branch.
          </p>
          <div className="flex flex-wrap gap-2">
            <input value={install} onChange={(e) => setInstall(e.target.value.replace(/\D/g, ""))} placeholder="GitHub App installation ID"
              className="flex-1 min-w-[220px] px-3 py-2 bg-background border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50" />
            <button onClick={saveInstallation} disabled={busy} className="px-4 py-2 rounded-xl bg-accent text-white text-[11px] font-bold disabled:opacity-50">
              {busy ? "Saving…" : "Save connection"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      {data.pullRequests.length === 0 ? (
        <div className="bg-surface border border-border-subtle rounded-2xl px-5 py-12 text-center text-[12px] text-muted">
          <GitPullRequest className="w-6 h-6 mx-auto mb-2 text-muted" />
          No pull requests yet. When a member passes Verify &amp; Complete in Syncro Desktop, the branch is pushed and its PR appears here.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLS.map((c) => {
            const items = grouped.get(c.id) || [];
            return (
              <div key={c.id} className={`w-[270px] flex-shrink-0 bg-background/60 border border-border-subtle border-t-2 ${c.accent} rounded-2xl flex flex-col max-h-[72vh]`}>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">{c.label}</p>
                  <span className="text-[10px] font-mono text-muted bg-surface border border-border-subtle rounded-md px-1.5">{items.length}</span>
                </div>
                <div className="px-2 pb-2 space-y-2 overflow-y-auto">
                  {items.length === 0 ? <p className="text-[10px] text-muted text-center py-4">None</p> : items.map((i) => {
                    const pr = i.pullRequest;
                    const pending = (pr.checks || []).filter((x) => x.status !== "completed").length;
                    const failed = (pr.checks || []).filter((x) => ["failure", "timed_out", "cancelled", "action_required"].includes(x.conclusion)).length;
                    return (
                      <button key={i.taskId} onClick={() => setOpen(i.taskId)}
                        className="w-full text-left bg-surface border border-border-subtle rounded-xl p-3 space-y-2 hover:border-accent/50 hover:shadow-md transition-all">
                        <div className="flex items-start gap-2">
                          <GitPullRequest className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pr.state === "merged" ? "text-emerald-500" : "text-violet-500"}`} />
                          <p className="text-[12px] font-bold text-foreground leading-snug line-clamp-2">#{pr.number} {i.title}</p>
                        </div>
                        <p className="text-[10px] font-mono text-muted truncate">{i.assignedToName} · {i.targetBranch} → {i.baseBranch}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono text-muted">SYNCRO</span><GateDots gate={i.verificationGate} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Pill cls={failed ? "bg-red-500/10 text-red-500" : pending ? "bg-sky-500/10 text-sky-500" : "bg-emerald-500/10 text-emerald-500"}>
                            {failed ? `${failed} check(s) failed` : pending ? `${pending} running` : `${pr.checks.length} checks ✓`}
                          </Pill>
                          <Pill cls={pr.reviewDecision === "changes_requested" ? "bg-amber-500/10 text-amber-500" : pr.approvals ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"}>
                            {pr.reviewDecision === "changes_requested" ? "changes req." : `${pr.approvals} approval(s)`}
                          </Pill>
                          {pr.mergeable === false && <Pill cls="bg-red-500/10 text-red-500">conflicts</Pill>}
                        </div>
                        <p className={`text-[10px] font-bold flex items-center gap-1 ${i.verification === "fresh" ? "text-emerald-500" : "text-red-500"}`}>
                          {i.verification === "fresh" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {i.verification === "fresh" ? "Verified = head" : i.verification === "stale" ? "Stale verification" : "No verified SHA"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(null)} />
          <aside className="relative w-full max-w-[600px] h-full bg-surface border-l border-border-subtle shadow-2xl flex flex-col">
            <header className="px-6 py-4 border-b border-border-subtle flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-foreground">{current.title}</p>
                <p className="text-[11px] font-mono text-muted flex items-center gap-1"><Link2 className="w-3 h-3" />{current.assignedToName} · {current.targetBranch} → {current.baseBranch}</p>
              </div>
              <button onClick={() => setOpen(null)} className="p-1.5 rounded-lg text-muted hover:text-foreground"><X className="w-4 h-4" /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <PullRequestDetail projectId={projectId} task={toDetail(current)} onChanged={() => load()} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
