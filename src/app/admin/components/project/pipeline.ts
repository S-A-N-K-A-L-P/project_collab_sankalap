"use client";
/* Shared data + pipeline logic for the admin Control Room, Task board, Scheduler and Team views. */

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types (shape of GET /api/admin/projects/{id}/control-room) ──
export interface Dependency { taskId: string; title: string; rule: string }
export interface JobResult { deviceName?: string; headSha?: string; branch?: string; repoPath?: string; [k: string]: unknown }
export interface CRJob {
  id: string; type: string; taskId: string; title: string;
  targetUserId: string; targetUserName: string;
  status: "queued" | "claimed" | "running" | "done" | "failed" | "cancelled";
  stalled: boolean; runAt: string; waitingOn: Dependency[];
  claimedBy: string; claimedByName: string; attempts: number; maxAttempts: number;
  note: string; error: string; result: JobResult | null; createdAt: string; createdByName?: string; finishedAt?: string;
}
export interface Gate {
  buildStatus?: string; testsStatus?: string; sastStatus?: string; contractsStatus?: string; verifiedAt?: string;
}
export interface PRCheck { name: string; status: string; conclusion: string; url: string }
export interface PRSnapshot {
  number: number; url: string; state: string; draft: boolean; mergeable: boolean | null; mergeableState: string;
  headSha: string; reviewDecision: string; approvals: number; changesRequested: number; checks: PRCheck[];
  lastSyncedAt?: string; lastSyncError?: string;
}
export interface CRTask {
  _id: string; title: string; description: string; assignedTo: string; assignedToName: string;
  status: "pending" | "in-progress" | "completed" | "delayed"; priority: "low" | "medium" | "high"; progress: number;
  deadline: string; startAt: string | null; createdAt: string;
  dependsOn: string[]; dependencyRule: "completed" | "merged"; waitingOn: Dependency[];
  repoUrl: string; baseBranch: string; targetBranch: string;
  assignedFiles: string[]; allowedGlobs: string[]; readOnlyFiles: string[]; fileLockMode: string;
  latestCommitSha: string; commitCount: number; verificationGate: Gate;
  pullRequestUrl: string; pullRequest: PRSnapshot | null;
  verification: "fresh" | "stale" | "unknown" | null;
  mergeGate: { allowed: boolean; reasons: string[] } | null;
  setupJob: CRJob | null;
}
export interface CRDevice {
  deviceId: string; name: string; os: string; appVersion: string; workspaceRoot: string;
  status: string; statusNote: string; currentJobId: string; lastSeenAt: string; online: boolean;
}
export interface CRMember {
  userId: string; name: string; email: string; avatar: string; isLead: boolean;
  projectRole: string; ownedPaths: string[]; maxActiveTasks: number; activeTasks: number; totalTasks: number;
  prsMerged: number; gatePassRate: number | null; currentTask: string; devices: CRDevice[]; online: boolean;
}
export interface CRActivity { id: string; userName: string; action: string; createdAt: string; metadata: Record<string, unknown> }
export interface CRData {
  now: string;
  project: {
    _id: string; title: string; status: string; progress: number; githubRepo: string; githubInstallationId: string;
    githubLastWebhookAt: string | null; githubConfigured: boolean; githubMode: "app" | "token" | "none";
  };
  tasks: CRTask[]; members: CRMember[]; jobs: CRJob[]; activity: CRActivity[];
}

// ── Polling hook ──
export function useControlRoom(projectId: string, { enabled = true, intervalMs = 10_000 } = {}) {
  const [data, setData] = useState<CRData | null>(null);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const busy = useRef(false);

  const reload = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/control-room`, { cache: "no-store" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || "Could not load the control room"); return; }
      setError(""); setData(d); setUpdatedAt(Date.now());
    } catch (e) {
      setError(String(e));
    } finally {
      busy.current = false;
    }
  }, [projectId]);

  useEffect(() => {
    if (!enabled) return;
    reload();
    const t = setInterval(() => { if (document.visibilityState === "visible") reload(); }, intervalMs);
    return () => clearInterval(t);
  }, [enabled, intervalMs, reload]);

  return { data, error, reload, updatedAt };
}

// ── Pull request actions (admin) ──
export type PrAction = "approve" | "request_changes" | "merge" | "refresh";
export async function prAction(projectId: string, taskId: string, action: PrAction, message?: string) {
  const res = await fetch(`/api/admin/projects/${projectId}/pull-requests`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, action, message }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(d.error || "Pull request action failed") as Error & { reasons?: string[] };
    err.reasons = d.reasons || [];
    throw err;
  }
  return d;
}

// ── Formatting ──
export function ago(iso?: string | null, now = Date.now()) {
  if (!iso) return "never";
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 0) return `in ${until(iso, now)}`;
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
export function until(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.round((new Date(iso).getTime() - now) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}
export function clock(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
export const shortSha = (s?: string) => (s || "").slice(0, 7);

// ── Gates ──
export const GATE_KEYS: { key: keyof Gate; label: string }[] = [
  { key: "buildStatus", label: "Build" },
  { key: "testsStatus", label: "Tests" },
  { key: "sastStatus", label: "SAST" },
  { key: "contractsStatus", label: "API" },
];
export type GateTone = "pass" | "fail" | "skip" | "none";
export function gateTone(status?: string): GateTone {
  const s = String(status || "").toLowerCase();
  if (!s) return "none";
  if (s.startsWith("passed")) return "pass";
  if (s.startsWith("failed")) return "fail";
  return "skip";
}
export function gateSummary(g: Gate) {
  const tones = GATE_KEYS.map((k) => gateTone(g?.[k.key]));
  return {
    anyFailed: tones.includes("fail"),
    proved: gateTone(g?.buildStatus) === "pass" || gateTone(g?.testsStatus) === "pass",
    verified: tones.some((t) => t !== "none"),
    passCount: tones.filter((t) => t === "pass").length,
  };
}

// ── Pipeline ──
export type StepState = "done" | "active" | "wait" | "fail" | "todo";
export interface Step { key: string; label: string; state: StepState; detail: string }

export const LANE_LABELS = ["Assigned", "Agent setup", "Coding", "Verified", "PR open", "Review", "Merged"] as const;

/** Where a task is in assign → agent setup → code → verify → PR → review → merge. */
export function laneSteps(t: CRTask, nowMs: number): Step[] {
  const job = t.setupJob;
  const gate = gateSummary(t.verificationGate);
  const pr = t.pullRequest;
  const steps: Step[] = LANE_LABELS.map((label) => ({ key: label, label, state: "todo", detail: "" }));

  steps[0] = { ...steps[0], state: "done", detail: t.assignedToName || "member" };

  // Agent setup
  if (!job) {
    if (t.status !== "pending" || pr || gate.verified) steps[1] = { ...steps[1], state: "done", detail: "set up on PC" };
    else steps[1] = { ...steps[1], state: t.repoUrl ? "todo" : "wait", detail: t.repoUrl ? "no agent job" : "no repo linked" };
  } else if (job.status === "queued") {
    if (job.waitingOn.length) steps[1] = { ...steps[1], state: "wait", detail: `after ${job.waitingOn.map((d) => d.title).join(", ")}` };
    else if (new Date(job.runAt).getTime() > nowMs) steps[1] = { ...steps[1], state: "wait", detail: `starts ${clock(job.runAt)}` };
    else steps[1] = { ...steps[1], state: "active", detail: "waiting for a PC" };
  } else if (job.status === "claimed" || job.status === "running") {
    steps[1] = { ...steps[1], state: job.stalled ? "fail" : "active", detail: job.stalled ? "PC went quiet" : job.note || `on ${job.claimedByName || "PC"}` };
  } else if (job.status === "done") {
    steps[1] = { ...steps[1], state: "done", detail: `${job.result?.deviceName || job.claimedByName || "PC"} @ ${shortSha(job.result?.headSha)}` };
  } else if (job.status === "failed") {
    steps[1] = { ...steps[1], state: "fail", detail: job.error || "setup failed" };
  } else {
    steps[1] = { ...steps[1], state: t.status !== "pending" ? "done" : "todo", detail: "cancelled" };
  }

  // Coding
  if (gate.verified || pr) steps[2] = { ...steps[2], state: "done", detail: `${t.commitCount || 0} commit(s)` };
  else if (steps[1].state === "done") steps[2] = { ...steps[2], state: "active", detail: t.commitCount ? `${t.commitCount} commit(s)` : `${t.progress}%` };

  // Verified
  if (gate.anyFailed) {
    const failed = GATE_KEYS.filter((k) => gateTone(t.verificationGate?.[k.key]) === "fail").map((k) => k.label).join(", ");
    steps[3] = { ...steps[3], state: "fail", detail: `${failed} failed` };
  } else if (gate.proved) steps[3] = { ...steps[3], state: "done", detail: `${gate.passCount}/4 gates` };

  // PR open
  if (pr) steps[4] = { ...steps[4], state: "done", detail: `#${pr.number}` };
  else if (steps[3].state === "done") steps[4] = { ...steps[4], state: "active", detail: "push & open PR" };

  // Review + merged
  if (pr) {
    if (pr.state === "merged") {
      steps[5] = { ...steps[5], state: "done", detail: "approved" };
      steps[6] = { ...steps[6], state: "done", detail: "merged" };
    } else if (pr.state === "closed") {
      steps[5] = { ...steps[5], state: "fail", detail: "closed" };
      steps[6] = { ...steps[6], state: "fail", detail: "closed unmerged" };
    } else if (t.verification === "stale") {
      steps[5] = { ...steps[5], state: "fail", detail: "new commits since verify" };
    } else if (pr.reviewDecision === "changes_requested") {
      steps[5] = { ...steps[5], state: "fail", detail: "changes requested" };
    } else if (t.mergeGate?.allowed) {
      steps[5] = { ...steps[5], state: "done", detail: "merge ready" };
      steps[6] = { ...steps[6], state: "active", detail: "ready" };
    } else {
      const pending = (pr.checks || []).filter((c) => c.status !== "completed").length;
      steps[5] = { ...steps[5], state: "active", detail: pending ? `${pending} check(s) running` : pr.approvals ? `${pr.approvals} approval(s)` : "awaiting review" };
    }
  }
  return steps;
}

export type BoardColumn = "scheduled" | "setup" | "progress" | "verified" | "review" | "merged" | "blocked";
export const BOARD_COLUMNS: { id: BoardColumn; label: string; hint: string }[] = [
  { id: "scheduled", label: "Scheduled", hint: "Waiting for start time or another task" },
  { id: "setup", label: "Setting up", hint: "Agent cloning & checking out" },
  { id: "progress", label: "In progress", hint: "Member + agent coding" },
  { id: "verified", label: "Verified", hint: "Gates passed, PR not open yet" },
  { id: "review", label: "In review", hint: "PR open on GitHub" },
  { id: "merged", label: "Merged", hint: "Done" },
  { id: "blocked", label: "Blocked", hint: "Needs attention" },
];

export function boardColumn(t: CRTask, nowMs: number): BoardColumn {
  const steps = laneSteps(t, nowMs);
  if (steps[6].state === "done" || (t.status === "completed" && !t.pullRequest)) return "merged";
  if (steps.some((s) => s.state === "fail")) return "blocked";
  const first = steps.findIndex((s) => s.state !== "done");
  if (first === 1) return steps[1].state === "wait" ? "scheduled" : "setup";
  if (first === 2 || first === 3) return "progress";
  if (first === 4) return "verified";
  return "review";
}

export const STEP_DOT: Record<StepState, string> = {
  done: "bg-emerald-500 border-emerald-500 text-white",
  active: "bg-accent/15 border-accent text-accent animate-pulse",
  wait: "bg-amber-500/15 border-amber-500 text-amber-500",
  fail: "bg-red-500 border-red-500 text-white",
  todo: "bg-transparent border-border-subtle text-muted",
};
export const STEP_TEXT: Record<StepState, string> = {
  done: "text-emerald-500", active: "text-accent", wait: "text-amber-500", fail: "text-red-500", todo: "text-muted",
};
export const PRIORITY_CLS: Record<string, string> = {
  high: "bg-red-500/10 text-red-500",
  medium: "bg-amber-500/10 text-amber-500",
  low: "bg-zinc-500/10 text-zinc-400",
};
export const labelCls = "text-[10px] font-mono font-bold text-muted uppercase tracking-widest";
export const cardCls = "bg-surface border border-border-subtle rounded-2xl";
