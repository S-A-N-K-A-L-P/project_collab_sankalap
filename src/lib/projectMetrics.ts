/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose lean documents are runtime-shaped here. */
/**
 * Project numbers for the mobile app, computed only from stored tasks — no guesses.
 * A value that can't be computed is null, so the app shows "—" instead of a made-up number.
 * Pure functions (no DB) so they can be unit-tested and reused by any route.
 */

const DAY = 86_400_000;

export type ProjectHealth = "healthy" | "needsReview" | "blocker";

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  /** completed / total in %, null when the project has no tasks. */
  completionPct: number | null;
  overdueTasks: number;
  dueThisWeek: number;
  waitingOnDependencies: number;
  openPrs: number;
  mergeReadyPrs: number;
  blockedPrs: number;
  mergedPrs: number;
  /** Open PRs whose head moved after Syncro verified the task. */
  staleVerification: number;
  verifiedTasks: number;
  /** Verified tasks with no failed gate and a passing build or tests, null when nothing was verified. */
  gatePassRatePct: number | null;
  failedGateTasks: number;
  nextDeadline: { taskId: string; title: string; deadline: string } | null;
  health: ProjectHealth;
  /** Why the health is what it is, e.g. "2 overdue tasks". Empty when healthy. */
  healthReasons: string[];
}

const gateStatuses = (t: any) => {
  const g = t?.verificationGate || {};
  return [g.buildStatus, g.testsStatus, g.sastStatus, g.contractsStatus].map((s: unknown) => String(s || "").toLowerCase());
};

export const isTaskDone = (t: any) => t?.status === "completed" || t?.pullRequest?.state === "merged";

export function gateSummary(t: any) {
  const s = gateStatuses(t);
  const verified = s.some((x) => x.length > 0);
  const failed = s.some((x) => x.startsWith("failed"));
  const proved = s[0].startsWith("passed") || s[1].startsWith("passed");
  return { verified, failed, passed: verified && proved && !failed };
}

export function verificationIsStale(t: any): boolean {
  const verified = String(t?.latestCommitSha || "").trim().toLowerCase();
  const head = String(t?.pullRequest?.headSha || "").trim().toLowerCase();
  if (verified.length < 7 || !head) return false;
  return !(head.startsWith(verified) || verified.startsWith(head));
}

/**
 * @param tasks lean Task documents of one project
 * @param mergeAllowed  merge-gate verdict per open PR task (same rule as the admin PR board)
 */
export function computeProjectMetrics(tasks: any[], nowMs: number, mergeAllowed: (t: any) => boolean): ProjectMetrics {
  const byId = new Map(tasks.map((t) => [String(t._id), t]));
  const open = tasks.filter((t) => !isTaskDone(t));
  const done = tasks.length - open.length;

  const deadlineMs = (t: any) => (t?.deadline ? new Date(t.deadline).getTime() : NaN);
  const overdue = open.filter((t) => deadlineMs(t) < nowMs).length;
  const dueWeek = open.filter((t) => deadlineMs(t) >= nowMs && deadlineMs(t) < nowMs + 7 * DAY).length;
  const dueSoon = open.filter((t) => deadlineMs(t) >= nowMs && deadlineMs(t) < nowMs + 2 * DAY).length;

  const waiting = open.filter((t) =>
    (t.dependsOn || []).some((id: string) => {
      const dep = byId.get(String(id));
      if (!dep) return false;
      return t.dependencyRule === "merged" ? dep.pullRequest?.state !== "merged" : !isTaskDone(dep);
    })
  ).length;

  const withPr = tasks.filter((t) => t?.pullRequest?.number);
  const openPrTasks = withPr.filter((t) => t.pullRequest.state === "open");
  const ready = openPrTasks.filter((t) => mergeAllowed(t)).length;
  const stale = openPrTasks.filter(verificationIsStale).length;

  const gates = tasks.map(gateSummary);
  const verified = gates.filter((g) => g.verified).length;
  const passed = gates.filter((g) => g.passed).length;
  const failedGates = open.filter((t) => gateSummary(t).failed).length;

  const next = open
    .filter((t) => Number.isFinite(deadlineMs(t)) && deadlineMs(t) >= nowMs)
    .sort((a, b) => deadlineMs(a) - deadlineMs(b))[0];

  const reasons: string[] = [];
  let health: ProjectHealth = "healthy";
  if (overdue > 0) reasons.push(`${overdue} overdue task(s)`);
  if (failedGates > 0) reasons.push(`${failedGates} task(s) with a failed verification gate`);
  if (reasons.length > 0) health = "blocker";
  const reviewReasons: string[] = [];
  const blocked = openPrTasks.length - ready;
  if (blocked > 0) reviewReasons.push(`${blocked} PR(s) blocked by the merge gate`);
  if (stale > 0) reviewReasons.push(`${stale} PR(s) changed after verification`);
  if (dueSoon > 0) reviewReasons.push(`${dueSoon} task(s) due within 2 days`);
  if (health === "healthy" && reviewReasons.length > 0) health = "needsReview";
  reasons.push(...reviewReasons);

  return {
    totalTasks: tasks.length,
    completedTasks: done,
    inProgressTasks: open.filter((t) => t.status === "in-progress").length,
    openTasks: open.length,
    completionPct: tasks.length ? Math.round((done / tasks.length) * 100) : null,
    overdueTasks: overdue,
    dueThisWeek: dueWeek,
    waitingOnDependencies: waiting,
    openPrs: openPrTasks.length,
    mergeReadyPrs: ready,
    blockedPrs: blocked,
    mergedPrs: withPr.filter((t) => t.pullRequest.state === "merged").length,
    staleVerification: stale,
    verifiedTasks: verified,
    gatePassRatePct: verified ? Math.round((passed / verified) * 100) : null,
    failedGateTasks: failedGates,
    nextDeadline: next ? { taskId: String(next._id), title: next.title || "", deadline: new Date(next.deadline).toISOString() } : null,
    health,
    healthReasons: reasons,
  };
}
