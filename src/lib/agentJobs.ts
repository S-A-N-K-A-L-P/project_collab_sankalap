/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose documents are runtime-shaped here. */
import AgentJob from "@/models/AgentJob";
import Task from "@/models/Task";

/** A device is "online" if it sent a heartbeat this recently (desktop beats every 60 s). */
export const ONLINE_WINDOW_MS = 150_000;
/** How long a claimed job is held without a heartbeat before another device may take it. */
export const LEASE_MS = 5 * 60_000;

export type DependencyRule = "completed" | "merged";
export type AgentJobType = "setup-task" | "simulate" | "verify" | "open-pr";

export function isOnline(lastSeenAt?: Date | string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

/** What the desktop needs to set a task up without asking the platform again. */
export function setupPayload(task: any, projectTitle = "") {
  return {
    taskId: String(task._id),
    projectId: String(task.projectId),
    projectTitle,
    title: task.title || "",
    repoUrl: task.repoUrl || "",
    baseBranch: task.baseBranch || "main",
    targetBranch: task.targetBranch || "",
    assignedFiles: task.assignedFiles || [],
    allowedGlobs: task.allowedGlobs || [],
    readOnlyFiles: task.readOnlyFiles || [],
    fileLockMode: task.fileLockMode || "strict",
  };
}

/** True when a dependency task satisfies the rule. */
export function dependencyMet(dep: any, rule: DependencyRule): boolean {
  if (!dep) return true; // a deleted dependency no longer blocks
  const merged = dep.pullRequest?.state === "merged";
  return rule === "merged" ? merged : merged || dep.status === "completed";
}

/**
 * For each id, the unmet dependencies (id + title). Empty list = free to run.
 * One query for all dependency tasks.
 */
export async function unmetDependencies(depIds: string[], rule: DependencyRule) {
  const ids = (depIds || []).filter(Boolean);
  if (ids.length === 0) return [] as { taskId: string; title: string; rule: DependencyRule }[];
  const deps = (await Task.find({ _id: { $in: ids } }).select("title status pullRequest.state").lean()) as any[];
  return deps
    .filter((d) => !dependencyMet(d, rule))
    .map((d) => ({ taskId: String(d._id), title: d.title || "task", rule }));
}

/** Scheduling fields copied from a task onto its jobs. */
function scheduleOf(task: any) {
  const startAt = task.startAt ? new Date(task.startAt) : null;
  return {
    runAt: startAt && startAt.getTime() > Date.now() ? startAt : new Date(),
    dependsOnTaskIds: (task.dependsOn || []).map(String).filter((x: string) => x && x !== String(task._id)),
    dependencyRule: (task.dependencyRule === "merged" ? "merged" : "completed") as DependencyRule,
  };
}

/**
 * Queue a "setup-task" job for the task's assignee. Any earlier open setup job for the same task is
 * cancelled first, so a reassignment never leaves the old member's PC with stale work.
 * The job inherits the task's schedule: it isn't claimable before task.startAt, nor before every
 * task in task.dependsOn meets task.dependencyRule.
 * Returns null when the task has no repo URL (nothing for a PC to clone).
 */
export async function enqueueSetupTask(task: any, opts: { projectTitle?: string; byId?: string; byName?: string } = {}) {
  await AgentJob.updateMany(
    { type: "setup-task", taskId: String(task._id), status: { $in: ["queued", "claimed", "running"] } },
    { $set: { status: "cancelled", note: "superseded by a newer setup job", finishedAt: new Date() } }
  );
  if (!task.repoUrl) return null;
  return AgentJob.create({
    type: "setup-task",
    projectId: String(task.projectId),
    taskId: String(task._id),
    targetUserId: String(task.assignedTo),
    targetUserName: task.assignedToName || "",
    payload: setupPayload(task, opts.projectTitle),
    ...scheduleOf(task),
    createdBy: opts.byId || "",
    createdByName: opts.byName || "",
  });
}

/** Queue any job type for one member, optionally scheduled. */
export async function enqueueJob(input: {
  type: AgentJobType;
  projectId: string;
  taskId?: string;
  targetUserId: string;
  targetUserName?: string;
  targetDeviceId?: string;
  payload?: Record<string, unknown>;
  runAt?: Date | null;
  dependsOnTaskIds?: string[];
  dependencyRule?: DependencyRule;
  byId?: string;
  byName?: string;
}) {
  return AgentJob.create({
    type: input.type,
    projectId: input.projectId,
    taskId: input.taskId || "",
    targetUserId: input.targetUserId,
    targetUserName: input.targetUserName || "",
    targetDeviceId: input.targetDeviceId || "",
    payload: input.payload || {},
    runAt: input.runAt && input.runAt.getTime() > Date.now() ? input.runAt : new Date(),
    dependsOnTaskIds: input.dependsOnTaskIds || [],
    dependencyRule: input.dependencyRule || "completed",
    createdBy: input.byId || "",
    createdByName: input.byName || "",
  });
}

/** Cancel open jobs for a task (e.g. when the task is deleted). */
export async function cancelTaskJobs(taskId: string, why: string) {
  await AgentJob.updateMany(
    { taskId, status: { $in: ["queued", "claimed", "running"] } },
    { $set: { status: "cancelled", note: why, finishedAt: new Date() } }
  );
}

/** Shape sent to the desktop: no internal fields it doesn't need. */
export function jobForDevice(job: any) {
  return {
    id: String(job._id),
    type: job.type,
    projectId: job.projectId,
    taskId: job.taskId,
    payload: job.payload || {},
    attempts: job.attempts,
    leaseUntil: job.leaseUntil,
  };
}
