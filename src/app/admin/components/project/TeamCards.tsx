"use client";

import { FolderTree, GitMerge, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { ago, cardCls, labelCls, type CRData } from "./pipeline";
import { Avatar, Pill } from "./ui";

const ROLE_CLS: Record<string, string> = {
  lead: "bg-accent/15 text-accent", architect: "bg-violet-500/10 text-violet-500", backend: "bg-sky-500/10 text-sky-500",
  frontend: "bg-pink-500/10 text-pink-500", mobile: "bg-orange-500/10 text-orange-500", sre: "bg-teal-500/10 text-teal-500",
  qa: "bg-amber-500/10 text-amber-500", developer: "bg-zinc-500/10 text-zinc-400",
};

export default function TeamCards({ data, onAssign }: { data: CRData; onAssign?: (userId: string) => void }) {
  const nowMs = new Date(data.now).getTime();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.members.map((m) => {
        const load = m.maxActiveTasks ? m.activeTasks / m.maxActiveTasks : 0;
        const over = m.activeTasks > m.maxActiveTasks;
        const pc = m.devices[0];
        return (
          <div key={m.userId} className={`${cardCls} p-4 space-y-3`}>
            <div className="flex items-start gap-3">
              <Avatar name={m.name} src={m.avatar} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-foreground truncate">{m.name}</p>
                <p className="text-[10px] font-mono text-muted truncate">{m.email}</p>
              </div>
              <Pill cls={ROLE_CLS[m.projectRole] || ROLE_CLS.developer}>{m.projectRole}</Pill>
            </div>

            <p className="text-[11px] flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${m.online ? "bg-emerald-500" : "bg-zinc-400"}`} />
              <MonitorSmartphone className="w-3 h-3 text-muted" />
              {pc ? (
                <span className="text-foreground truncate">{pc.name} · {m.online ? pc.status : `offline, seen ${ago(pc.lastSeenAt, nowMs)}`}{pc.appVersion ? ` · v${pc.appVersion}` : ""}</span>
              ) : <span className="text-amber-500">No Syncro Desktop connected</span>}
            </p>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className={labelCls}>Workload</span>
                <span className={over ? "text-red-500 font-bold" : "text-muted"}>{m.activeTasks}/{m.maxActiveTasks} active{over ? " · OVER" : ""}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                <div className={`h-full rounded-full ${over ? "bg-red-500" : load >= 0.8 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, load * 100)}%` }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-1 items-center">
              <FolderTree className="w-3 h-3 text-muted mr-0.5" />
              {m.ownedPaths.length === 0 ? <span className="text-[10px] text-muted">No owned paths</span>
                : m.ownedPaths.slice(0, 4).map((p) => <code key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border-subtle text-foreground">{p}</code>)}
              {m.ownedPaths.length > 4 && <span className="text-[10px] text-muted">+{m.ownedPaths.length - 4}</span>}
            </div>

            <p className="text-[11px] text-muted truncate">Now: <span className="text-foreground">{m.currentTask || "nothing in progress"}</span></p>

            <div className="flex items-center gap-3 text-[11px] text-muted border-t border-border-subtle pt-2.5">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{m.gatePassRate === null ? "no verifies" : `${m.gatePassRate}% gates`}</span>
              <span className="flex items-center gap-1"><GitMerge className="w-3 h-3" />{m.prsMerged} merged</span>
              {onAssign && (
                <button onClick={() => onAssign(m.userId)} className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent/20">
                  Assign task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
