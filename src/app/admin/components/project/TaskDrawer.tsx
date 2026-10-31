"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock, CheckCircle2, ExternalLink, GitBranch, GitMerge, GitPullRequest, Loader2, Save, ShieldAlert, ShieldCheck, ThumbsUp, X, XCircle,
} from "lucide-react";
import { ScopeSummary, TaskScopeEditor, type LockMode } from "@/app/admin/components/GitTaskScope";
import {
  ago, clock, GATE_KEYS, gateTone, labelCls, prAction, PRIORITY_CLS, shortSha,
  type CRData, type CRTask, type PrAction,
} from "./pipeline";
import { JobRow } from "./Scheduler";
import { Avatar, GateDots, PipelineLane, Pill } from "./ui";

type DrawerTab = "overview" | "schedule" | "scope" | "agent" | "pr" | "activity";

const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
};

// ── PR panel (shared with the PR board) ────────────────────────
export type PullRequestTask = Pick<CRTask, "_id" | "title" | "latestCommitSha" | "verificationGate" | "pullRequest" | "verification" | "mergeGate">;

export function PullRequestDetail({ projectId, task, onChanged }: { projectId: string; task: PullRequestTask; onChanged: () => void }) {
  const pr = task.pullRequest;
  const [busy, setBusy] = useState<PrAction | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState<{ text: string; reasons: string[] } | null>(null);
  const [note, setNote] = useState("");

  if (!pr) return <p className="text-[12px] text-muted">No pull request yet. The member&apos;s Syncro Desktop opens it after Verify &amp; Complete passes.</p>;

  const run = async (a: PrAction) => {
    if (a === "merge" && !confirm(`Squash-merge PR #${pr.number} into its base branch?`)) return;
    setBusy(a); setErr(null);
    try {
      const d = await prAction(projectId, task._id, a, msg || undefined);
      setNote(typeof d?.note === "string" ? d.note : "");
      setMsg("");
      onChanged();
    }
    catch (e) { const er = e as Error & { reasons?: string[] }; setErr({ text: er.message, reasons: er.reasons || [] }); }
    finally { setBusy(null); }
  };
  const btn = "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider disabled:opacity-50";
  const open = pr.state === "open";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <a href={pr.url} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-foreground hover:text-accent flex items-center gap-1.5">
          <GitPullRequest className="w-4 h-4 text-violet-500" />#{pr.number}<ExternalLink className="w-3 h-3" />
        </a>
        <Pill cls={pr.state === "merged" ? "bg-emerald-500/10 text-emerald-500" : pr.state === "closed" ? "bg-zinc-500/10 text-zinc-400" : "bg-violet-500/10 text-violet-500"}>{pr.state}</Pill>
        {pr.draft && <Pill cls="bg-zinc-500/10 text-zinc-400">draft</Pill>}
        <Pill cls={pr.mergeable === false ? "bg-red-500/10 text-red-500" : pr.mergeable ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"}>
          {pr.mergeable === false ? "conflicts" : pr.mergeable ? "mergeable" : "mergeability pending"}
        </Pill>
        <span className="text-[10px] font-mono text-muted">synced {ago(pr.lastSyncedAt)}</span>
      </div>

      {/* Verified SHA vs head */}
      <div className={`rounded-xl border p-3 text-[12px] flex items-start gap-2 ${task.verification === "fresh" ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
        {task.verification === "fresh" ? <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />}
        <div>
          <p className="font-bold text-foreground">
            {task.verification === "fresh" ? "Verified commit is the PR head" : task.verification === "stale" ? "New commits since Syncro verified this PR" : "No verified commit on record"}
          </p>
          <p className="text-[10px] font-mono text-muted">verified {shortSha(task.latestCommitSha) || "none"} · head {shortSha(pr.headSha) || "?"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-subtle p-3 space-y-1.5">
          <p className={labelCls}>Syncro gates</p>
          {GATE_KEYS.map((k) => {
            const s = task.verificationGate?.[k.key]; const tone = gateTone(s);
            return (
              <p key={k.key} className="text-[11px] flex justify-between gap-2">
                <span className="font-bold text-foreground">{k.label}</span>
                <span className={`font-mono truncate ${tone === "pass" ? "text-emerald-500" : tone === "fail" ? "text-red-500" : "text-muted"}`}>{s || "not verified"}</span>
              </p>
            );
          })}
        </div>
        <div className="rounded-xl border border-border-subtle p-3 space-y-1.5">
          <p className={labelCls}>GitHub · {pr.approvals} approval(s){pr.changesRequested ? ` · ${pr.changesRequested} change request(s)` : ""}</p>
          {pr.checks.length === 0 ? <p className="text-[11px] text-muted">No GitHub checks reported.</p> : pr.checks.map((c, i) => (
            <a key={i} href={c.url || pr.url} target="_blank" rel="noreferrer" className="text-[11px] flex justify-between gap-2 hover:text-accent">
              <span className="truncate text-foreground">{c.name}</span>
              <span className={`font-mono ${c.conclusion === "success" ? "text-emerald-500" : c.status !== "completed" ? "text-amber-500" : ["failure", "timed_out", "cancelled", "action_required"].includes(c.conclusion) ? "text-red-500" : "text-muted"}`}>
                {c.status !== "completed" ? c.status : c.conclusion || "done"}
              </span>
            </a>
          ))}
        </div>
      </div>

      {task.mergeGate && !task.mergeGate.allowed && open && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1">Merge blocked because:</p>
          <ul className="list-disc pl-5 text-[11px] text-foreground space-y-0.5">{task.mergeGate.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}
      {open && (task.mergeGate?.warnings || []).length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-background p-3">
          <p className="text-[11px] font-bold text-muted mb-1">Scope warnings</p>
          <ul className="list-disc pl-5 text-[11px] text-foreground space-y-0.5">{(task.mergeGate?.warnings ?? []).map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}
      {pr.lastSyncError && <p className="text-[11px] text-red-500">{pr.lastSyncError}</p>}

      {open && (
        <div className="space-y-2">
          <textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Optional review comment…"
            className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50 resize-none" />
          <div className="flex flex-wrap gap-2">
            <button disabled={!!busy} onClick={() => run("approve")} className={`${btn} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20`}>
              {busy === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}Approve
            </button>
            <button disabled={!!busy} onClick={() => run("request_changes")} className={`${btn} bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20`}>
              {busy === "request_changes" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}Request changes
            </button>
            <button disabled={!!busy || !task.mergeGate?.allowed} onClick={() => run("merge")}
              title={task.mergeGate?.allowed ? "All gates passed" : task.mergeGate?.reasons.join("\n")}
              className={`${btn} ml-auto bg-accent text-white hover:bg-accent/90`}>
              {busy === "merge" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitMerge className="w-3.5 h-3.5" />}Merge
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={!!busy} onClick={() => run("refresh")} className={`${btn} bg-background text-muted hover:text-foreground border border-border-subtle`}>
          {busy === "refresh" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}Refresh
        </button>
        <button disabled={!!busy} onClick={() => run("reconcile")} className={`${btn} bg-background text-muted hover:text-foreground border border-border-subtle`}>
          {busy === "reconcile" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}Reconcile with GitHub
        </button>
      </div>
      {note && <p className="text-[11px] text-foreground">{note}</p>}
      {err && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-[11px]">
          <p className="font-bold text-red-500">{err.text}</p>
          {err.reasons.length > 0 && <ul className="list-disc pl-5 mt-1 text-foreground">{err.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>}
        </div>
      )}
    </div>
  );
}

// ── Schedule editor ────────────────────────────────────────────
function ScheduleEditor({ projectId, task, data, onSaved }: { projectId: string; task: CRTask; data: CRData; onSaved: () => void }) {
  const [startAt, setStartAt] = useState(toLocalInput(task.startAt));
  const [deps, setDeps] = useState<string[]>(task.dependsOn);
  const [rule, setRule] = useState(task.dependencyRule);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const others = data.tasks.filter((t) => t._id !== task._id);

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks/${task._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: startAt ? new Date(startAt).toISOString() : null, dependsOn: deps, dependencyRule: rule }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not save the schedule");
      onSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted">
        The agent setup job for this task is <b className="text-foreground">not claimable</b> before the start time, and not until every dependency is met.
        Saving re-queues the setup job with the new schedule.
      </p>
      <div className="space-y-1.5">
        <label className={labelCls}>Start at (empty = immediately)</label>
        <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50" />
      </div>
      <div className="space-y-1.5">
        <label className={labelCls}>Start after these tasks</label>
        <div className="max-h-48 overflow-y-auto rounded-xl border border-border-subtle divide-y divide-border-subtle">
          {others.length === 0 ? <p className="text-[11px] text-muted p-3">No other tasks.</p> : others.map((o) => (
            <label key={o._id} className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer hover:bg-background/60">
              <input type="checkbox" checked={deps.includes(o._id)} onChange={(e) => setDeps((d) => e.target.checked ? [...d, o._id] : d.filter((x) => x !== o._id))} />
              <span className="font-bold text-foreground truncate">{o.title}</span>
              <span className="text-[10px] font-mono text-muted ml-auto">{o.assignedToName}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={labelCls}>Dependency is met when</label>
        <div className="flex gap-2">
          {(["completed", "merged"] as const).map((r) => (
            <button key={r} onClick={() => setRule(r)}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider ${rule === r ? "bg-accent text-white" : "bg-background text-muted border border-border-subtle"}`}>
              {r === "completed" ? "Task completed" : "PR merged"}
            </button>
          ))}
        </div>
      </div>
      {err && <p className="text-[11px] text-red-500">{err}</p>}
      <button disabled={saving} onClick={save}
        className="w-full py-2.5 rounded-xl bg-accent text-white text-[12px] font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save schedule
      </button>
    </div>
  );
}

// ── Drawer ─────────────────────────────────────────────────────
export default function TaskDrawer({ projectId, taskId, data, onClose, onChanged }: {
  projectId: string; taskId: string; data: CRData; onClose: () => void; onChanged: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("overview");
  const task = data.tasks.find((t) => t._id === taskId);
  const nowMs = new Date(data.now).getTime();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!task) return null;
  const jobs = data.jobs.filter((j) => j.taskId === task._id);
  const activity = data.activity.filter((a) => a.metadata?.taskId === task._id);
  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "overview", label: "Overview" }, { id: "schedule", label: "Schedule" }, { id: "scope", label: "Scope" },
    { id: "agent", label: `Agent (${jobs.length})` }, { id: "pr", label: task.pullRequest ? `PR #${task.pullRequest.number}` : "PR" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="relative w-full max-w-[640px] h-full bg-surface border-l border-border-subtle shadow-2xl flex flex-col">
        <header className="px-6 py-4 border-b border-border-subtle space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-snug">{task.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Avatar name={task.assignedToName || "?"} size={20} />
                <span className="text-[12px] text-muted">{task.assignedToName}</span>
                <Pill cls={PRIORITY_CLS[task.priority]}>{task.priority}</Pill>
                <span className="text-[10px] font-mono text-muted flex items-center gap-1"><GitBranch className="w-3 h-3" />{task.baseBranch} → {task.targetBranch}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1 overflow-x-auto -mb-4 pt-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 whitespace-nowrap ${tab === t.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "overview" && (
            <div className="space-y-5">
              <PipelineLane task={task} nowMs={nowMs} />
              {task.description && <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>}
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="rounded-xl border border-border-subtle p-3"><p className={labelCls}>Status</p><p className="font-bold text-foreground mt-1">{task.status} · {task.progress}%</p></div>
                <div className="rounded-xl border border-border-subtle p-3"><p className={labelCls}>Deadline</p><p className="font-bold text-foreground mt-1">{clock(task.deadline)}</p></div>
                <div className="rounded-xl border border-border-subtle p-3"><p className={labelCls}>Starts</p><p className="font-bold text-foreground mt-1">{task.startAt ? clock(task.startAt) : "immediately"}</p></div>
                <div className="rounded-xl border border-border-subtle p-3"><p className={labelCls}>Commits</p><p className="font-bold text-foreground mt-1">{task.commitCount} · {shortSha(task.latestCommitSha) || "none"}</p></div>
              </div>
              {task.waitingOn.length > 0 && (
                <p className="text-[12px] text-amber-500 flex items-center gap-1.5"><CalendarClock className="w-4 h-4" />Waiting on {task.waitingOn.map((w) => `"${w.title}" (${w.rule})`).join(", ")}</p>
              )}
              <div className="space-y-1.5"><p className={labelCls}>Verification gates</p><GateDots gate={task.verificationGate} labels /></div>
              <ScopeSummary task={{ ...task, fileLockMode: task.fileLockMode as LockMode }} />
            </div>
          )}

          {tab === "schedule" && <ScheduleEditor projectId={projectId} task={task} data={data} onSaved={onChanged} />}

          {tab === "scope" && (
            <TaskScopeEditor projectId={projectId} task={{ ...task, fileLockMode: task.fileLockMode as LockMode }} onCancel={() => setTab("overview")} onSaved={() => { onChanged(); setTab("overview"); }} />
          )}

          {tab === "agent" && (
            jobs.length === 0
              ? <p className="text-[12px] text-muted">No agent jobs for this task yet. A setup job is queued when a task with a repo is assigned.</p>
              : <div className="rounded-xl border border-border-subtle divide-y divide-border-subtle">{jobs.map((j) => <JobRow key={j.id} job={j} projectId={projectId} nowMs={nowMs} onChanged={onChanged} />)}</div>
          )}

          {tab === "pr" && <PullRequestDetail projectId={projectId} task={task} onChanged={onChanged} />}

          {tab === "activity" && (
            activity.length === 0 ? <p className="text-[12px] text-muted">No activity recorded for this task in the last 30 project events.</p> : (
              <div className="space-y-2">
                {activity.map((a) => (
                  <p key={a.id} className="text-[12px] text-foreground flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                    <span>{a.action} <span className="text-muted text-[10px] font-mono">· {ago(a.createdAt, nowMs)}</span></span>
                  </p>
                ))}
              </div>
            )
          )}
        </div>
      </aside>
    </div>
  );
}
