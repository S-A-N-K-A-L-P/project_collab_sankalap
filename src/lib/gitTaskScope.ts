import Task from "@/models/Task";
import { computeCollisions, type ScopeCollision } from "@/lib/gitTaskScopeCore";

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
