import AgentJob from "@/models/AgentJob";

/** A device is "online" if it sent a heartbeat this recently (desktop beats every 60 s). */
export const ONLINE_WINDOW_MS = 150_000;
/** How long a claimed job is held without a heartbeat before another device may take it. */
export const LEASE_MS = 5 * 60_000;

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

/**
 * Queue a "setup-task" job for the task's assignee. Any earlier open setup job for the same task is
 * cancelled first, so a reassignment never leaves the old member's PC with stale work.
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
    createdBy: opts.byId || "",
    createdByName: opts.byName || "",
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
