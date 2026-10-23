"use client";

import { useCallback, useEffect, useState } from "react";
import { Cpu, Loader2, MonitorSmartphone, RefreshCw, Send } from "lucide-react";

interface Device {
  deviceId: string; name: string; os: string; appVersion: string; workspaceRoot: string;
  status: string; statusNote: string; lastSeenAt: string; online: boolean;
}
interface MemberAgents { userId: string; name: string; email: string; online: boolean; devices: Device[] }
interface Job {
  id: string; type: string; taskId: string; title: string; targetUserName: string;
  status: string; stalled: boolean; claimedByName: string; attempts: number; maxAttempts: number;
  note: string; error: string; result: any; createdAt: string; finishedAt?: string;
}

const labelCls = "text-[10px] font-mono font-bold text-muted uppercase tracking-widest";
const STATUS_CLS: Record<string, string> = {
  queued: "bg-zinc-500/10 text-zinc-400",
  claimed: "bg-blue-500/10 text-blue-400",
  running: "bg-blue-500/10 text-blue-400",
  done: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-500",
};

function ago(iso?: string) {
  if (!iso) return "never";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default function AgentsPanel({ projectId }: { projectId: string }) {
  const [data, setData] = useState<{ members: MemberAgents[]; jobs: Job[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/projects/${projectId}/agents`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error || "Could not load agents"); return; }
    setError(""); setData(d);
  }, [projectId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [load]);

  const resend = async (taskId: string) => {
    setBusy(taskId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks/${taskId}/setup`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setError(d.error || "Could not queue setup job");
      await load();
    } finally { setBusy(null); }
  };

  if (!data) return (
    <div className="flex h-40 items-center justify-center">{error ? <p className="text-[12px] text-red-400">{error}</p> : <Loader2 className="w-5 h-5 animate-spin text-accent" />}</div>
  );

  const onlineCount = data.members.filter((m) => m.online).length;

  return (
    <div className="space-y-5">
      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <p className={labelCls}><MonitorSmartphone className="w-3.5 h-3.5 inline mr-1.5" />Member PCs — {onlineCount}/{data.members.length} members online</p>
          <button onClick={load} className="p-1.5 rounded-lg text-muted hover:text-accent" title="Refresh"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
        <div className="divide-y divide-border-subtle">
          {data.members.map((m) => (
            <div key={m.userId} className="px-5 py-3 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
              <div>
                <p className="text-[13px] font-bold text-foreground">{m.name}</p>
                <p className="text-[10px] font-mono text-muted">{m.email}</p>
              </div>
              {m.devices.length === 0 ? (
                <p className="text-[11px] text-muted self-center">No Syncro Desktop registered. The member signs in to Syncro Desktop to connect this PC.</p>
              ) : (
                <div className="space-y-1.5">
                  {m.devices.map((d) => (
                    <div key={d.deviceId} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                      <span className={`w-2 h-2 rounded-full ${d.online ? "bg-emerald-400" : "bg-zinc-500"}`} />
                      <span className="font-bold text-foreground">{d.name}</span>
                      <span className="text-muted font-mono">{d.online ? d.status : "offline"}{d.statusNote ? ` — ${d.statusNote}` : ""}</span>
                      <span className="text-muted font-mono">seen {ago(d.lastSeenAt)}</span>
                      <span className="text-muted font-mono">{d.os}{d.appVersion ? ` · v${d.appVersion}` : ""}</span>
                      {d.workspaceRoot && <span className="text-muted font-mono truncate max-w-[280px]" title={d.workspaceRoot}>{d.workspaceRoot}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <p className={labelCls}><Cpu className="w-3.5 h-3.5 inline mr-1.5" />Agent jobs</p>
          <p className="text-[11px] text-muted mt-1">A setup job is queued whenever a task with a repo is assigned. The member&apos;s PC clones the repo, checks out the task branch and reports back. Depending on the member&apos;s Agent Settings it may first ask them on the PC.</p>
        </div>
        {data.jobs.length === 0 ? (
          <p className="px-5 py-8 text-[12px] text-muted text-center">No jobs yet.</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {data.jobs.map((j) => (
              <div key={j.id} className="px-5 py-3 flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[220px] space-y-0.5">
                  <p className="text-[12px] font-bold text-foreground">{j.title || j.type} <span className="text-[10px] font-mono text-muted">· {j.type} → {j.targetUserName || "member"}</span></p>
                  <p className="text-[10px] font-mono text-muted">
                    queued {ago(j.createdAt)}{j.claimedByName ? ` · on ${j.claimedByName}` : ""} · attempt {j.attempts}/{j.maxAttempts}
                    {j.finishedAt ? ` · finished ${ago(j.finishedAt)}` : ""}
                  </p>
                  {/* Progress notes only while a job is open; finished jobs show the error or result instead. */}
                  {j.note && ["claimed", "running"].includes(j.status) && <p className="text-[11px] text-muted">{j.note}</p>}
                  {j.error && <p className="text-[11px] text-red-400">{j.error}</p>}
                  {j.result && j.status === "done" && (
                    <p className="text-[10px] font-mono text-emerald-400">
                      {j.result.repoPath} · {j.result.branch} @ {String(j.result.headSha || "").slice(0, 7)}
                    </p>
                  )}
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 rounded-lg ${j.stalled ? "bg-yellow-500/10 text-yellow-400" : STATUS_CLS[j.status] || ""}`}>
                  {j.stalled ? "stalled (PC went quiet)" : j.status}
                </span>
                {j.type === "setup-task" && j.taskId && ["failed", "cancelled", "done"].includes(j.status) && (
                  <button disabled={busy === j.taskId} onClick={() => resend(j.taskId)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50 flex items-center gap-1">
                    {busy === j.taskId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Re-send
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
