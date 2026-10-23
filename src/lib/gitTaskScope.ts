/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose lean documents are runtime-shaped here. */
import Task from "@/models/Task";
import { computeCollisions, evaluatePullRequestFiles, type ScopeCollision } from "@/lib/gitTaskScopeCore";

/**
 * Shared rules for git-scoped tasks ("duty assignment"), used by the admin and the mobile/desktop
 * task APIs so both give the same answer.
 *
 * A collision is reported when a file you assign is also claimed by another active task of a
 * different member, either directly (same file) or through a glob scope in either direction.
 * Glob-against-glob overlap is not detected (it can't be decided without a file list).
 */
export * from "@/lib/gitTaskScopeCore";

const ACTIVE_STATUSES = ["pending", "in-progress", "delayed"];

/**
 * Finds files of the new/updated task that other members' active tasks in the same project already
 * claim. Pass excludeTaskId when updating an existing task.
 */
export async function findScopeCollisions(opts: {
  projectId: string;
  assignedTo: string;
  assignedFiles: string[];
  allowedGlobs: string[];
  fileLockMode?: string;
  excludeTaskId?: string;
}): Promise<ScopeCollision[]> {
  const { projectId, assignedTo, assignedFiles, allowedGlobs, excludeTaskId } = opts;
  if (assignedFiles.length === 0 && allowedGlobs.length === 0) return [];

  const query: Record<string, unknown> = {
    projectId,
    status: { $in: ACTIVE_STATUSES },
    assignedTo: { $ne: assignedTo },
  };
  if (excludeTaskId) query._id = { $ne: excludeTaskId };

  const others = (await Task.find(query)
    .select("title assignedTo assignedToName assignedFiles allowedGlobs fileLockMode")
    .lean()) as any[];
  return computeCollisions(others, { assignedFiles, allowedGlobs, fileLockMode: opts.fileLockMode });
}

/**
 * L4 — write the file-scope result onto a pull request snapshot.
 * `changedFiles` is filled by the GitHub sync. When it is missing, the merge stays blocked:
 * a pull request we could not read is not treated as in scope.
 */
export async function annotatePullRequestScope(task: any): Promise<void> {
  const pr = task?.pullRequest;
  if (!pr?.number) return;

  if (!Array.isArray(pr.changedFiles)) {
    const detail = pr.changedFilesError ? `: ${String(pr.changedFilesError).slice(0, 240)}` : ".";
    pr.scopeCheck = {
      checked: true,
      blocking: true,
      reasons: [`Couldn't read this pull request's changed files from GitHub${detail}`],
      warnings: [],
    };
  } else {
    const siblings = (await Task.find({
      projectId: task.projectId,
      status: { $in: ACTIVE_STATUSES },
      assignedTo: { $ne: task.assignedTo },
      _id: { $ne: task._id },
    })
      .select("title assignedTo assignedToName assignedFiles allowedGlobs fileLockMode")
      .lean()) as any[];
    pr.scopeCheck = { checked: true, ...evaluatePullRequestFiles(task, pr.changedFiles, siblings) };
  }

  if (typeof task.markModified === "function") task.markModified("pullRequest");
}
