"use client";

import { useMemo } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Cpu, GitMerge, GitPullRequest, ListChecks, MonitorSmartphone, ShieldCheck,
} from "lucide-react";
import { ago, boardColumn, cardCls, clock, gateSummary, labelCls, type CRData, type CRTask } from "./pipeline";
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
    if (t.setupJob?.stalled) out.push({ tone: "warn", text: `${t.setupJob.claimedByName || "A PC"} went quiet while setting up "${t.title}"`, taskId: t._id });
    if (pr?.state === "open" && pr.reviewDecision === "changes_requested") out.push({ tone: "warn", text: `PR #${pr.number}: changes requested`, taskId: t._id });
    if (pr?.lastSyncError) out.push({ tone: "warn", text: `PR #${pr.number}: ${pr.lastSyncError}`, taskId: t._id });
    if (pr?.state === "open" && t.mergeGate?.allowed) out.push({ tone: "good", text: `PR #${pr.number} "${t.title}" is ready to merge`, taskId: t._id });
    if (t.status !== "completed" && new Date(t.deadline).getTime() < nowMs) out.push({ tone: "warn", text: `"${t.title}" is past its deadline`, taskId: t._id });
  }
  for (const m of data.members) {
    if (m.activeTasks > 0 && !m.online) out.push({ tone: "warn", text: m.devices.length ? `${m.name}'s PC is offline (${m.activeTasks} active task(s))` : `${m.name} has no Syncro Desktop connected` });
    if (m.activeTasks > m.maxActiveTasks) out.push({ tone: "warn", text: `${m.name} is over capacity (${m.activeTasks}/${m.maxActiveTasks})` });
  }
  const rank = { bad: 0, warn: 1, good: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]).slice(0, 12);
}

export default function ControlRoom({ data, updatedAt, onOpenTask }: { data: CRData; updatedAt: number; onOpenTask: (id: string) => void }) {
  const nowMs = new Date(data.now).getTime();

  const k = useMemo(() => {
    const tasks = data.tasks;
    const done = tasks.filter((t) => t.status === "completed" || t.pullRequest?.state === "merged").length;
    const devicesOnline = data.members.filter((m) => m.online).length;
    const running = data.jobs.filter((j) => ["claimed", "running"].includes(j.status)).length;
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
        <Kpi icon={<ListChecks className="w-3 h-3" />} label="Tasks" value={`${k.done}/${k.total}`} sub="done" tone="text-accent" />
        <Kpi icon={<MonitorSmartphone className="w-3 h-3" />} label="Agents online" value={`${k.devicesOnline}/${k.members}`} sub="members with a live PC"
          tone={k.devicesOnline ? "text-emerald-500" : "text-muted"} />
        <Kpi icon={<Cpu className="w-3 h-3" />} label="Agent jobs" value={k.running} sub={`${k.scheduled} scheduled${k.nextJob ? ` · next ${clock(k.nextJob.runAt)}` : ""}`} />
        <Kpi icon={<GitPullRequest className="w-3 h-3" />} label="Open PRs" value={k.openPrs} sub={`${k.ready} merge-ready`} tone={k.ready ? "text-emerald-500" : "text-foreground"} />
        <Kpi icon={<GitMerge className="w-3 h-3" />} label="Merged" value={k.merged} sub="through the merge gate" />
        <Kpi icon={<ShieldCheck className="w-3 h-3" />} label="Gate pass rate" value={k.passRate === null ? "n/a" : `${k.passRate}%`} sub="Build · Tests · SAST · API"
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

        {/* Needs attention */}
        <div className={`${cardCls} overflow-hidden self-start`}>
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
      </div>
    </div>
  );
}
