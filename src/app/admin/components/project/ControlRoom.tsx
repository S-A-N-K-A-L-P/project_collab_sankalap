"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Cpu, GitMerge, GitPullRequest, ListChecks, MonitorSmartphone, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ago, boardColumn, cardCls, closedWithoutPr, clock, gateSummary, isTaskDone, labelCls, stalledText, type CRData, type CRTask } from "./pipeline";
import { Avatar, Empty, Kpi, LiveDot, PipelineLane, Pill } from "./ui";

interface Attention { tone: "bad" | "warn" | "good"; text: string; taskId?: string }

function attentionItems(data: CRData, nowMs: number): Attention[] {
  const out: Attention[] = [];
  for (const t of data.tasks) {
    const pr = t.pullRequest;
    const g = gateSummary(t.verificationGate);
    if (pr?.state === "open" && t.verification === "stale") out.push({ tone: "bad", text: `PR #${pr.number} "${t.title}": new commits since Syncro verified it`, taskId: t._id });
    if (g.anyFailed) out.push({ tone: "bad", text: `"${t.title}": a verification gate failed`, taskId: t._id });
    if (t.setupJob?.status === "failed") out.push({ tone: "bad", text: `Agent setup failed for "${t.title}": ${t.setupJob.error}`, taskId: t._id });
    if (t.setupJob?.stalled) out.push({ tone: "warn", text: `Setup of "${t.title}" is waiting: ${stalledText(t.setupJob, nowMs)}. It resumes on any of ${t.assignedToName || "the member"}'s PCs once Syncro Desktop is open.`, taskId: t._id });
    if (closedWithoutPr(t)) out.push({ tone: "bad", text: `"${t.title}" is marked completed, but no pull request was opened: its ${t.commitCount || 0} commit(s) never reached ${t.baseBranch || "the base branch"}`, taskId: t._id });
    // A dependency that can never be met: the task waits for a merge that will not happen.
    for (const w of [...(t.waitingOn || []), ...(t.setupJob?.waitingOn || [])]) {
      const dep = data.tasks.find((d) => d._id === w.taskId);
      if (w.rule === "merged" && dep && (closedWithoutPr(dep) || dep.pullRequest?.state === "closed")) {
        out.push({ tone: "bad", text: `"${t.title}" waits for "${dep.title}" to merge, but it was closed without merging. Change the dependency or reopen that task.`, taskId: t._id });
        break;
      }
    }
    if (pr?.state === "open" && pr.reviewDecision === "changes_requested") out.push({ tone: "warn", text: `PR #${pr.number}: changes requested`, taskId: t._id });
    if (pr?.lastSyncError) out.push({ tone: "warn", text: `PR #${pr.number}: ${pr.lastSyncError}`, taskId: t._id });
    if (pr?.state === "open" && t.mergeGate?.allowed) out.push({ tone: "good", text: `PR #${pr.number} "${t.title}" is ready to merge`, taskId: t._id });
    if (t.status !== "completed" && new Date(t.deadline).getTime() < nowMs) out.push({ tone: "warn", text: `"${t.title}" is past its deadline`, taskId: t._id });
  }
  for (const m of data.members) {
    if (m.activeTasks > 0 && !m.online) {
      const last = m.devices.map((d) => d.lastSeenAt).filter(Boolean).sort().pop();
      out.push({ tone: "warn", text: m.devices.length ? `${m.name}'s Syncro Desktop last reported ${ago(last, nowMs)} (${m.activeTasks} active task(s))` : `${m.name} has never connected Syncro Desktop` });
    }
    if (m.activeTasks > m.maxActiveTasks) out.push({ tone: "warn", text: `${m.name} is over capacity (${m.activeTasks}/${m.maxActiveTasks})` });
  }
  const rank = { bad: 0, warn: 1, good: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]).slice(0, 12);
}

export default function ControlRoom({ data, updatedAt, onOpenTask, org }: {
  data: CRData; updatedAt: number; onOpenTask: (id: string) => void; org?: { name: string; slug: string } | null;
}) {
  const nowMs = new Date(data.now).getTime();

  const k = useMemo(() => {
    const tasks = data.tasks;
    const done = tasks.filter((t) => isTaskDone(t, nowMs)).length;
    const devicesOnline = data.members.filter((m) => m.online).length;
    const running = data.jobs.filter((j) => ["claimed", "running"].includes(j.status) && !j.stalled).length;
    const scheduled = data.jobs.filter((j) => j.status === "queued" && (j.waitingOn.length || new Date(j.runAt).getTime() > nowMs));
    const nextJob = scheduled.filter((j) => !j.waitingOn.length).sort((a, b) => +new Date(a.runAt) - +new Date(b.runAt))[0];
    const openPrs = tasks.filter((t) => t.pullRequest?.state === "open");
    const ready = openPrs.filter((t) => t.mergeGate?.allowed).length;
    const verified = tasks.filter((t) => gateSummary(t.verificationGate).verified);
    const passing = verified.filter((t) => { const g = gateSummary(t.verificationGate); return g.proved && !g.anyFailed; });
    return {
      done, total: tasks.length, devicesOnline, members: data.members.length, running, scheduled: scheduled.length, nextJob,
      openPrs: openPrs.length, ready, merged: tasks.filter((t) => t.pullRequest?.state === "merged").length,
      passRate: verified.length ? Math.round((passing.length / verified.length) * 100) : null,
    };
  }, [data, nowMs]);

  // Active work first, merged last.
  const order = ["blocked", "review", "verified", "progress", "setup", "scheduled", "merged"];
  const lanes = [...data.tasks].sort((a, b) => order.indexOf(boardColumn(a, nowMs)) - order.indexOf(boardColumn(b, nowMs)));
  const attention = attentionItems(data, nowMs);

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi icon={<ListChecks className="w-3 h-3" />} label="Tasks" value={`${k.done}/${k.total}`} sub="done = merged on GitHub" tone="text-accent" />
        <Kpi icon={<MonitorSmartphone className="w-3 h-3" />} label="Agents online" value={`${k.devicesOnline}/${k.members}`} sub="Syncro Desktop seen in 2½ min"
          tone={k.devicesOnline ? "text-emerald-500" : "text-muted"} />
        <Kpi icon={<Cpu className="w-3 h-3" />} label="Agent jobs" value={k.running} sub={`${k.scheduled} scheduled${k.nextJob ? ` · next ${clock(k.nextJob.runAt)}` : ""}`} />
        <Kpi icon={<GitPullRequest className="w-3 h-3" />} label="Open PRs" value={k.openPrs} sub={`${k.ready} merge-ready`} tone={k.ready ? "text-emerald-500" : "text-foreground"} />
        <Kpi icon={<GitMerge className="w-3 h-3" />} label="Merged" value={k.merged} sub="through the merge gate" />
        <Kpi icon={<ShieldCheck className="w-3 h-3" />} label="Gate pass rate" value={k.passRate === null ? "n/a" : `${k.passRate}%`} sub="reported by Syncro Desktop"
          tone={k.passRate === null ? "text-muted" : k.passRate >= 80 ? "text-emerald-500" : "text-amber-500"} />
      </div>

      {/* Live pipeline */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between">
          <p className={labelCls}>Live pipeline: assign, agent setup, code, verify, PR, review, merge</p>
          <LiveDot updatedAt={updatedAt} />
        </div>
        {lanes.length === 0 ? (
          <Empty>No tasks yet. Create one in the Tasks tab and its lane appears here.</Empty>
        ) : (
          <div className="divide-y divide-border-subtle">
            {lanes.map((t: CRTask) => (
              <button key={t._id} onClick={() => onOpenTask(t._id)}
                className="w-full text-left px-5 py-3 grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-3 items-center hover:bg-background/60 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={t.assignedToName || "?"} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate">{t.title}</p>
                    <p className="text-[10px] font-mono text-muted truncate">{t.assignedToName} · {t.targetBranch || "no branch"}</p>
                  </div>
                </div>
                <PipelineLane task={t} nowMs={nowMs} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
        {/* Activity */}
        <div className={`${cardCls} overflow-hidden`}>
          <div className="px-5 py-3.5 border-b border-border-subtle">
            <p className={labelCls}><Activity className="w-3.5 h-3.5 inline mr-1.5" />Live activity</p>
          </div>
          {data.activity.length === 0 ? <Empty>No activity yet.</Empty> : (
            <div className="divide-y divide-border-subtle max-h-[360px] overflow-y-auto">
              {data.activity.map((a) => (
                <div key={a.id} className="px-5 py-2.5 flex gap-3 text-[12px]">
                  <span className="text-[10px] font-mono text-muted w-16 flex-shrink-0 pt-0.5">{ago(a.createdAt, nowMs)}</span>
                  <p className="text-foreground leading-snug min-w-0">
                    {a.action}
                    {a.userName && <span className="text-muted"> · {a.userName}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 self-start">
        {/* Needs attention */}
        <div className={`${cardCls} overflow-hidden`}>
          <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between">
            <p className={labelCls}><AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />Needs attention</p>
            <Pill cls={attention.some((a) => a.tone === "bad") ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}>
              {attention.filter((a) => a.tone !== "good").length} open
            </Pill>
          </div>
          {attention.length === 0 ? (
            <p className="px-5 py-8 text-[12px] text-emerald-500 text-center flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> All clear</p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {attention.map((a, i) => (
                <button key={i} disabled={!a.taskId} onClick={() => a.taskId && onOpenTask(a.taskId)}
                  className="w-full text-left px-5 py-2.5 flex gap-2.5 items-start text-[12px] hover:bg-background/60 disabled:hover:bg-transparent">
                  {a.tone === "good"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    : a.tone === "bad"
                      ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      : <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />}
                  <span className="text-foreground leading-snug">{a.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Connections data={data} org={org ?? null} nowMs={nowMs} />
        </div>
      </div>
    </div>
  );
}

interface NodeStatus { paired: boolean; nodeId?: string; hostName?: string; url?: string | null; lastOnlineAt?: string | null; lastOfflineAt?: string | null }

/**
 * Where Syncro is connected for this project: each member's desktop (from its heartbeats) and the org's server
 * (from the public node status). Read-only: pairing is for the org's owners and admins, on the org's own admin page.
 */
function Connections({ data, org, nowMs }: { data: CRData; org: { name: string; slug: string } | null; nowMs: number }) {
  const [node, setNode] = useState<NodeStatus | null | "error">(null);
  useEffect(() => {
    if (!org?.slug) return;
    let stop = false;
    fetch(`/api/orgs/${encodeURIComponent(org.slug)}/node`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: NodeStatus) => { if (!stop) setNode(d); })
      .catch(() => { if (!stop) setNode("error"); });
    return () => { stop = true; };
  }, [org?.slug]);

  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="px-5 py-3.5 border-b border-border-subtle">
        <p className={labelCls}><MonitorSmartphone className="w-3.5 h-3.5 inline mr-1.5" />Syncro connections</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {data.members.map((m) => {
          const d = [...m.devices].sort((a, b) => +new Date(b.lastSeenAt || 0) - +new Date(a.lastSeenAt || 0))[0];
          return (
            <div key={m.userId} className="px-5 py-2.5 flex items-center gap-2.5 text-[12px]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.online ? "bg-emerald-500" : "bg-zinc-400"}`} />
              <span className="font-bold text-foreground truncate">{m.name}</span>
              <span className="text-muted truncate ml-auto text-[11px]">
                {d ? `${d.name || "PC"} · ${m.online ? "online" : `last seen ${ago(d.lastSeenAt, nowMs)}`}` : "never connected"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-border-subtle text-[12px] space-y-1.5">
        {!org ? (
          <p className="text-muted">This project has no org, so it has no org server.</p>
        ) : node === null ? (
          <p className="text-muted">Checking {org.name}&apos;s org server…</p>
        ) : node === "error" ? (
          <p className="text-muted">Couldn&apos;t read {org.name}&apos;s org server status.</p>
        ) : !node.paired ? (
          <p className="text-foreground">{org.name} has no org server paired yet.</p>
        ) : (
          <p className="text-foreground">
            {org.name}&apos;s org server{node.hostName ? ` (${node.hostName}'s PC)` : ""}: {node.url ? "announced online" : "offline"}
            <span className="text-muted">{node.url ? (node.lastOnlineAt ? ` since ${ago(node.lastOnlineAt, nowMs)}` : "") : (node.lastOfflineAt ? ` since ${ago(node.lastOfflineAt, nowMs)}` : "")}</span>
          </p>
        )}
        {org && (
          <p className="text-[11px] text-muted">
            <Link href={`/orgs/${org.slug}/admin/node`} className="text-accent font-bold hover:underline">Org Server page</Link>
            {node && node !== "error" && node.paired && node.url ? <> · <Link href={`/orgs/${org.slug}/console`} className="text-accent font-bold hover:underline">Open console</Link></> : null}
            {" "}· pairing is for {org.name}&apos;s owners and admins
          </p>
        )}
      </div>
    </div>
  );
}
