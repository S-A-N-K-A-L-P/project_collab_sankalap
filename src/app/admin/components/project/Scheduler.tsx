"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Cpu, Link2, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import {
  ago, boardColumn, cardCls, clock, labelCls, until,
  type BoardColumn, type CRData, type CRJob, type CRTask,
} from "./pipeline";
import { Empty, Pill } from "./ui";

export async function jobAction(projectId: string, jobId: string, action: "run-now" | "cancel" | "retry" | "reschedule", runAt?: string) {
  const res = await fetch(`/api/admin/projects/${projectId}/jobs/${jobId}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, runAt }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || "Action failed");
  return d;
}

const BAR_CLS: Record<BoardColumn, string> = {
  scheduled: "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300",
  setup: "bg-sky-500/20 border-sky-500 text-sky-700 dark:text-sky-300",
  progress: "bg-accent/20 border-accent text-accent",
  verified: "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300",
  review: "bg-violet-500/20 border-violet-500 text-violet-700 dark:text-violet-300",
  merged: "bg-emerald-500/25 border-emerald-500 text-emerald-700 dark:text-emerald-300",
  blocked: "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300",
};

const DAY = 86_400_000;
const ROW_H = 40;

// ── Timeline ───────────────────────────────────────────────────
export function Timeline({ data, onOpenTask }: { data: CRData; onOpenTask: (id: string) => void }) {
  const nowMs = new Date(data.now).getTime();

  const { rows, start, end, days } = useMemo(() => {
    const rows = [...data.tasks].sort((a, b) =>
      (a.assignedToName || "").localeCompare(b.assignedToName || "") ||
      +new Date(a.startAt || a.createdAt) - +new Date(b.startAt || b.createdAt));
    const starts = rows.map((t) => +new Date(t.startAt || t.createdAt));
    const ends = rows.map((t) => +new Date(t.deadline));
    const lo = Math.min(nowMs, ...starts);
    const hi = Math.max(nowMs + DAY, ...ends);
    const start = new Date(lo); start.setHours(0, 0, 0, 0);
    const end = new Date(hi); end.setHours(24, 0, 0, 0);
    const days: Date[] = [];
    for (let d = +start; d < +end; d += DAY) days.push(new Date(d));
    return { rows, start: +start, end: +end, days };
  }, [data.tasks, nowMs]);

  if (rows.length === 0) return <div className={cardCls}><Empty>No tasks to schedule yet.</Empty></div>;

  const span = end - start;
  const pct = (ms: number) => Math.min(100, Math.max(0, ((ms - start) / span) * 100));
  const rowIndex = new Map(rows.map((t, i) => [t._id, i]));
  const bar = (t: CRTask) => {
    const s = +new Date(t.startAt || t.createdAt);
    const e = Math.max(+new Date(t.deadline), s + DAY / 8);
    return { left: pct(s), right: pct(e) };
  };
  const links: { from: number; to: number; x1: number; x2: number; met: boolean }[] = [];
  rows.forEach((t, i) => {
    for (const dep of t.dependsOn) {
      const j = rowIndex.get(dep);
      if (j === undefined) continue;
      links.push({ from: j, to: i, x1: bar(rows[j]).right, x2: bar(t).left, met: !t.waitingOn.some((w) => w.taskId === dep) });
    }
  });
  const height = rows.length * ROW_H;
  const showEvery = days.length > 21 ? 7 : days.length > 10 ? 2 : 1;

  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="px-5 py-3.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
        <p className={labelCls}><CalendarClock className="w-3.5 h-3.5 inline mr-1.5" />Timeline: start → deadline, dependency links</p>
        <div className="flex flex-wrap gap-1.5">
          {(["scheduled", "setup", "progress", "review", "merged", "blocked"] as BoardColumn[]).map((c) => (
            <span key={c} className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${BAR_CLS[c]}`}>{c}</span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[860px] grid grid-cols-[210px_1fr]">
          {/* header */}
          <div className="border-b border-border-subtle px-4 py-2 text-[10px] font-mono text-muted">Task · member</div>
          <div className="border-b border-border-subtle relative h-8">
            {days.map((d, i) => i % showEvery === 0 && (
              <span key={+d} className="absolute top-2 text-[10px] font-mono text-muted -translate-x-1/2 whitespace-nowrap" style={{ left: `${pct(+d + DAY / 2)}%` }}>
                {d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" })}
              </span>
            ))}
          </div>

          {/* labels */}
          <div>
            {rows.map((t) => (
              <button key={t._id} onClick={() => onOpenTask(t._id)} style={{ height: ROW_H }}
                className="w-full text-left px-4 border-b border-border-subtle/60 flex flex-col justify-center hover:bg-background/60">
                <span className="text-[12px] font-bold text-foreground truncate">{t.title}</span>
                <span className="text-[10px] font-mono text-muted truncate">{t.assignedToName}</span>
              </button>
            ))}
          </div>

          {/* bars */}
          <div className="relative" style={{ height }}>
            {days.map((d) => (
              <div key={+d} className={`absolute top-0 bottom-0 border-l ${[0, 6].includes(d.getDay()) ? "border-border-subtle bg-background/40" : "border-border-subtle/50"}`}
                style={{ left: `${pct(+d)}%`, width: `${(DAY / span) * 100}%` }} />
            ))}
            {rows.map((_, i) => <div key={i} className="absolute left-0 right-0 border-b border-border-subtle/60" style={{ top: (i + 1) * ROW_H - 1 }} />)}

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
              {links.map((l, i) => {
                const y1 = l.from * ROW_H + ROW_H / 2, y2 = l.to * ROW_H + ROW_H / 2;
                const mid = (l.x1 + l.x2) / 2;
                return (
                  <path key={i} d={`M ${l.x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${l.x2} ${y2}`}
                    fill="none" stroke={l.met ? "#10b981" : "#f59e0b"} strokeWidth={2} strokeDasharray={l.met ? "0" : "5 4"}
                    vectorEffect="non-scaling-stroke" />
                );
              })}
            </svg>

            {rows.map((t, i) => {
              const b = bar(t);
              const col = boardColumn(t, nowMs);
              return (
                <button key={t._id} onClick={() => onOpenTask(t._id)}
                  className={`absolute h-6 rounded-md border text-[10px] font-bold px-1.5 truncate text-left flex items-center gap-1 hover:ring-2 hover:ring-accent/40 ${BAR_CLS[col]}`}
                  style={{ top: i * ROW_H + (ROW_H - 24) / 2, left: `${b.left}%`, width: `${Math.max(1.5, b.right - b.left)}%` }}
                  title={`${t.title}\n${clock(t.startAt || t.createdAt)} → ${clock(t.deadline)}${t.waitingOn.length ? `\nwaiting on ${t.waitingOn.map((w) => w.title).join(", ")}` : ""}`}>
                  {t.dependsOn.length > 0 && <Link2 className="w-3 h-3 flex-shrink-0" />}
                  <span className="truncate">{t.title}</span>
                </button>
              );
            })}

            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${pct(nowMs)}%` }}>
              <span className="absolute -top-0 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-red-500 rounded px-1">now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Job queue ──────────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = { "setup-task": "Setup", verify: "Verify", simulate: "Simulate", "open-pr": "Open PR" };

export function JobRow({ job, projectId, nowMs, onChanged }: { job: CRJob; projectId: string; nowMs: number; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const act = async (a: "run-now" | "cancel" | "retry") => {
    setBusy(a); setErr("");
    try { await jobAction(projectId, job.id, a); onChanged(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  };
  const future = job.status === "queued" && new Date(job.runAt).getTime() > nowMs;
  const btn = "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg disabled:opacity-50 flex items-center gap-1";

  return (
    <div className="px-4 py-2.5 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-foreground truncate">{job.title || job.type}</p>
          <p className="text-[10px] font-mono text-muted truncate">
            {TYPE_LABEL[job.type] || job.type} → {job.targetUserName || "member"}{job.claimedByName ? ` · ${job.claimedByName}` : ""} · try {job.attempts}/{job.maxAttempts}
          </p>
        </div>
        <Pill cls={job.stalled ? "bg-amber-500/10 text-amber-500" : job.status === "done" ? "bg-emerald-500/10 text-emerald-500" : job.status === "failed" ? "bg-red-500/10 text-red-500" : job.status === "cancelled" ? "bg-zinc-500/10 text-zinc-400" : "bg-sky-500/10 text-sky-500"}>
          {job.stalled ? "stalled" : job.status}
        </Pill>
      </div>
      {job.status === "queued" && (
        <p className="text-[10px] text-amber-500">
          {job.waitingOn.length ? `Waiting on ${job.waitingOn.map((w) => `"${w.title}" (${w.rule})`).join(", ")}`
            : future ? `Scheduled ${clock(job.runAt)} (in ${until(job.runAt, nowMs)})` : "Due now: next PC poll (≤30 s) picks it up"}
        </p>
      )}
      {job.note && ["claimed", "running", "cancelled"].includes(job.status) && <p className="text-[10px] text-muted">{job.note}</p>}
      {job.error && <p className="text-[10px] text-red-500">{job.error}</p>}
      {job.status === "done" && job.result?.headSha && (
        <p className="text-[10px] font-mono text-emerald-500 truncate">{job.result.branch} @ {String(job.result.headSha).slice(0, 7)} · {ago(job.finishedAt, nowMs)}</p>
      )}
      <div className="flex gap-1.5">
        {job.status === "queued" && (future || job.waitingOn.length > 0) && (
          <button disabled={!!busy} onClick={() => act("run-now")} className={`${btn} bg-accent/10 text-accent hover:bg-accent/20`}>
            {busy === "run-now" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}Run now
          </button>
        )}
        {["queued", "claimed", "running"].includes(job.status) && (
          <button disabled={!!busy} onClick={() => act("cancel")} className={`${btn} bg-red-500/10 text-red-500 hover:bg-red-500/20`}>
            {busy === "cancel" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}Cancel
          </button>
        )}
        {["failed", "cancelled"].includes(job.status) && (
          <button disabled={!!busy} onClick={() => act("retry")} className={`${btn} bg-accent/10 text-accent hover:bg-accent/20`}>
            {busy === "retry" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}Retry
          </button>
        )}
      </div>
      {err && <p className="text-[10px] text-red-500">{err}</p>}
    </div>
  );
}

export function JobQueue({ data, projectId, onChanged, jobs }: { data: CRData; projectId: string; onChanged: () => void; jobs?: CRJob[] }) {
  const nowMs = new Date(data.now).getTime();
  const list = jobs ?? data.jobs;
  const cols: { id: string; label: string; items: CRJob[] }[] = [
    { id: "upcoming", label: "Upcoming", items: list.filter((j) => j.status === "queued" && (j.waitingOn.length > 0 || new Date(j.runAt).getTime() > nowMs)) },
    { id: "active", label: "Ready & running", items: list.filter((j) => (j.status === "queued" && !j.waitingOn.length && new Date(j.runAt).getTime() <= nowMs) || (["claimed", "running"].includes(j.status) && !j.stalled)) },
    { id: "done", label: "Done", items: list.filter((j) => j.status === "done").slice(0, 15) },
    { id: "failed", label: "Failed, stalled & cancelled", items: list.filter((j) => j.stalled || ["failed", "cancelled"].includes(j.status)).slice(0, 15) },
  ];
  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="px-5 py-3.5 border-b border-border-subtle">
        <p className={labelCls}><Cpu className="w-3.5 h-3.5 inline mr-1.5" />Agent job queue</p>
        <p className="text-[11px] text-muted mt-1">Each member&apos;s Syncro Desktop polls every 30 s and claims due jobs whose dependencies are met. No server cron needed.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
        {cols.map((c) => (
          <div key={c.id} className="min-w-0">
            <div className="px-4 py-2 bg-background/50 flex items-center justify-between border-b border-border-subtle">
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">{c.label}</p>
              <span className="text-[10px] font-mono text-muted">{c.items.length}</span>
            </div>
            <div className="divide-y divide-border-subtle max-h-[420px] overflow-y-auto">
              {c.items.length === 0 ? <p className="text-[11px] text-muted text-center py-6">None</p>
                : c.items.map((j) => <JobRow key={j.id} job={j} projectId={projectId} nowMs={nowMs} onChanged={onChanged} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Scheduler({ data, projectId, onChanged, onOpenTask }: { data: CRData; projectId: string; onChanged: () => void; onOpenTask: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <Timeline data={data} onOpenTask={onOpenTask} />
      <JobQueue data={data} projectId={projectId} onChanged={onChanged} />
    </div>
  );
}
