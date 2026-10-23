"use client";

import { useMemo, useState } from "react";
import { Clock, FileCode2, GitBranch, GitPullRequest, Link2, Lock, MonitorSmartphone, Search } from "lucide-react";
import {
  BOARD_COLUMNS, boardColumn, clock, PRIORITY_CLS, laneSteps,
  type BoardColumn, type CRData, type CRTask,
} from "./pipeline";
import { Avatar, GateDots, Pill } from "./ui";

const COLUMN_ACCENT: Record<BoardColumn, string> = {
  scheduled: "border-t-amber-500",
  setup: "border-t-sky-500",
  progress: "border-t-accent",
  verified: "border-t-teal-500",
  review: "border-t-violet-500",
  merged: "border-t-emerald-500",
  blocked: "border-t-red-500",
};

function TaskCard({ t, nowMs, onOpen }: { t: CRTask; nowMs: number; onOpen: () => void }) {
  const steps = laneSteps(t, nowMs);
  const current = steps.find((s) => s.state !== "done") || steps[steps.length - 1];
  const job = t.setupJob;
  return (
    <button onClick={onOpen}
      className="w-full text-left bg-surface border border-border-subtle rounded-xl p-3 space-y-2 hover:border-accent/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-bold text-foreground leading-snug line-clamp-2">{t.title}</p>
        <Pill cls={PRIORITY_CLS[t.priority]}>{t.priority}</Pill>
      </div>
      <div className="flex items-center gap-2">
        <Avatar name={t.assignedToName || "?"} size={20} />
        <span className="text-[11px] text-muted truncate">{t.assignedToName || "Unassigned"}</span>
      </div>
      <p className="text-[10px] font-mono text-muted flex items-center gap-1 truncate">
        <GitBranch className="w-3 h-3 flex-shrink-0" />{t.baseBranch} → {t.targetBranch || "?"}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill cls="bg-background text-muted"><FileCode2 className="w-2.5 h-2.5" />{t.assignedFiles.length + t.allowedGlobs.length} scope</Pill>
        <Pill cls="bg-background text-muted"><Lock className="w-2.5 h-2.5" />{t.fileLockMode}</Pill>
        {t.pullRequest && (
          <Pill cls={t.pullRequest.state === "merged" ? "bg-emerald-500/10 text-emerald-500" : "bg-violet-500/10 text-violet-500"}>
            <GitPullRequest className="w-2.5 h-2.5" />#{t.pullRequest.number}
          </Pill>
        )}
        {t.verification === "stale" && <Pill cls="bg-red-500/10 text-red-500">stale verify</Pill>}
      </div>
      <GateDots gate={t.verificationGate} />
      {(t.waitingOn.length > 0 || (job?.status === "queued" && new Date(job.runAt).getTime() > nowMs)) && (
        <p className="text-[10px] text-amber-500 flex items-center gap-1">
          {t.waitingOn.length ? <><Link2 className="w-3 h-3" />after {t.waitingOn.map((d) => d.title).join(", ")}</> : <><Clock className="w-3 h-3" />starts {clock(job!.runAt)}</>}
        </p>
      )}
      {job && ["claimed", "running"].includes(job.status) && (
        <p className="text-[10px] text-sky-500 flex items-center gap-1 truncate"><MonitorSmartphone className="w-3 h-3" />{job.claimedByName || "PC"}: {job.note || job.status}</p>
      )}
      <p className="text-[10px] font-mono text-muted truncate" title={current.detail}>▸ {current.label}{current.detail ? `: ${current.detail}` : ""}</p>
    </button>
  );
}

export default function TaskBoard({ data, onOpenTask }: { data: CRData; onOpenTask: (id: string) => void }) {
  const nowMs = new Date(data.now).getTime();
  const [q, setQ] = useState("");
  const [member, setMember] = useState("");

  const grouped = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const map = new Map<BoardColumn, CRTask[]>(BOARD_COLUMNS.map((c) => [c.id, []]));
    for (const t of data.tasks) {
      if (member && t.assignedTo !== member) continue;
      if (ql && !`${t.title} ${t.assignedToName} ${t.targetBranch}`.toLowerCase().includes(ql)) continue;
      map.get(boardColumn(t, nowMs))!.push(t);
    }
    return map;
  }, [data.tasks, q, member, nowMs]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, members, branches…"
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50" />
        </div>
        <select value={member} onChange={(e) => setMember(e.target.value)}
          className="px-3 py-2 bg-surface border border-border-subtle rounded-xl text-[12px] text-foreground outline-none">
          <option value="">All members</option>
          {data.members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {BOARD_COLUMNS.map((c) => {
          const items = grouped.get(c.id) || [];
          return (
            <div key={c.id} className={`w-[250px] flex-shrink-0 bg-background/60 border border-border-subtle border-t-2 ${COLUMN_ACCENT[c.id]} rounded-2xl flex flex-col max-h-[70vh]`}>
              <div className="px-3 py-2.5 flex items-center justify-between" title={c.hint}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">{c.label}</p>
                <span className="text-[10px] font-mono text-muted bg-surface border border-border-subtle rounded-md px-1.5">{items.length}</span>
              </div>
              <div className="px-2 pb-2 space-y-2 overflow-y-auto">
                {items.length === 0
                  ? <p className="text-[10px] text-muted text-center py-4">{c.hint}</p>
                  : items.map((t) => <TaskCard key={t._id} t={t} nowMs={nowMs} onOpen={() => onOpenTask(t._id)} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
