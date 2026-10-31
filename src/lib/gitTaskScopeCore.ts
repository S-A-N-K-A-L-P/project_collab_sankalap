/**
 * Pure (no database) rules for git-scoped tasks. gitTaskScope.ts adds the database query on top.
 * Kept dependency-free so it can be tested directly with Node.
 */

export type FileLockMode = "advisory" | "strict" | "exclusive";

export interface ScopeCollision {
  filePath: string;
  /** same-file | in-their-scope (your file matches their glob) | in-your-scope (their file matches your glob) */
  reason: "same-file" | "in-their-scope" | "in-your-scope";
  taskId: string;
  taskTitle: string;
  assignedTo: string;
  assignedToName: string;
  fileLockMode: string;
  /** False when either side is advisory: it's reported but doesn't stop the assignment. */
  blocking: boolean;
}

export interface OtherTask {
  _id: unknown;
  title?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedFiles?: string[];
  allowedGlobs?: string[];
  fileLockMode?: string;
}

/** Normalises a list of repo-relative paths/globs: forward slashes, trimmed, no leading "./" or "/", unique. */
export function cleanPathList(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const out = new Set<string>();
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const p = raw.replace(/\\/g, "/").trim().replace(/^\.\//, "").replace(/^\/+/, "");
    if (p) out.add(p);
  }
  return Array.from(out);
}

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28) || "task";
}

/** Default branch name for a task: task/<member>-<title>. */
export function defaultTargetBranch(assigneeName: string, title: string): string {
  return `task/${slugify(assigneeName)}-${slugify(title)}`;
}

/** Glob → RegExp: ** matches across folders, * within one folder, ? one character. Case-insensitive. */
export function globToRegExp(glob: string): RegExp {
  const g = glob.replace(/\\/g, "/").trim();
  let rx = "";
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === "/" && g.slice(i + 1) === "**") {
      rx += "(?:/.*)?"; // trailing "/**" also matches the folder itself
      break;
    }
    if (c === "*") {
      if (g[i + 1] === "*") {
        const slash = g[i + 2] === "/";
        rx += slash ? "(?:.*/)?" : ".*";
        i += slash ? 2 : 1;
      } else rx += "[^/]*";
    } else if (c === "?") rx += "[^/]";
    else rx += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${rx}$`, "i");
}

export function pathMatchesGlob(path: string, glob: string): boolean {
  try {
    return globToRegExp(glob).test(path.replace(/\\/g, "/"));
  } catch {
    return false;
  }
}

/** Collisions between a proposed scope and other members' active tasks (already filtered by the caller). */
export function computeCollisions(
  others: OtherTask[],
  mine: { assignedFiles: string[]; allowedGlobs: string[]; fileLockMode?: string },
): ScopeCollision[] {
  const myMode = mine.fileLockMode || "strict";
  const myFiles = new Set(mine.assignedFiles.map((f) => f.toLowerCase()));
  const found: ScopeCollision[] = [];
  const seen = new Set<string>();

  const push = (filePath: string, reason: ScopeCollision["reason"], other: OtherTask) => {
    const key = `${String(other._id)}|${filePath.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    const theirMode = other.fileLockMode || "strict";
    found.push({
      filePath,
      reason,
      taskId: String(other._id),
      taskTitle: other.title || "",
      assignedTo: other.assignedTo || "",
      assignedToName: other.assignedToName || other.assignedTo || "",
      fileLockMode: theirMode,
      blocking: myMode !== "advisory" && theirMode !== "advisory",
    });
  };

  for (const other of others) {
    const theirFiles = Array.isArray(other.assignedFiles) ? other.assignedFiles : [];
    const theirGlobs = Array.isArray(other.allowedGlobs) ? other.allowedGlobs : [];
    for (const f of theirFiles) if (myFiles.has(f.toLowerCase())) push(f, "same-file", other);
    for (const f of mine.assignedFiles) if (theirGlobs.some((g) => pathMatchesGlob(f, g))) push(f, "in-their-scope", other);
    for (const f of theirFiles) if (mine.allowedGlobs.some((g) => pathMatchesGlob(f, g))) push(f, "in-your-scope", other);
  }
  return found;
}

/** HTTP 409 body when blocking collisions exist and the caller didn't force the assignment. */
export function collisionError(collisions: ScopeCollision[]) {
  const blocking = collisions.filter((c) => c.blocking);
  return {
    error: `Git file lock conflict: ${blocking.length} file(s) are already claimed by another member's active task.`,
    collisions,
  };
}

/** Exact files and folder globs a task holds. Both are locks for everyone else. */
export function lockPaths(task: { assignedFiles?: unknown; allowedGlobs?: unknown }): string[] {
  const files = Array.isArray(task.assignedFiles) ? task.assignedFiles : [];
  const globs = Array.isArray(task.allowedGlobs) ? task.allowedGlobs : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...files, ...globs]) {
    if (typeof raw !== "string") continue;
    const p = raw.replace(/\\/g, "/").trim().replace(/^\.\//, "").replace(/^\/+/, "");
    if (!p) continue;
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function isAdvisoryMode(mode?: string | null): boolean {
  return (mode || "strict") === "advisory";
}

/** Same suffix rule as the desktop PathsMatch: a sub-project root still matches its tail. */
export function pathsMatch(pathA: string, pathB: string): boolean {
  const a = pathA.replace(/\\/g, "/").trim().replace(/^\.\//, "").replace(/^\/+/, "").toLowerCase();
  const b = pathB.replace(/\\/g, "/").trim().replace(/^\.\//, "").replace(/^\/+/, "").toLowerCase();
  if (!a || !b) return false;
  return a === b || a.endsWith("/" + b) || b.endsWith("/" + a);
}

function isGlob(p: string): boolean {
  return p.includes("*") || p.includes("?");
}

export interface PrScopeTask {
  title?: string;
  assignedFiles?: string[];
  allowedGlobs?: string[];
  readOnlyFiles?: string[];
  fileLockMode?: string;
}

export interface PrScopeTeammate {
  _id?: unknown;
  title?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedFiles?: string[];
  allowedGlobs?: string[];
  fileLockMode?: string;
}

export interface PrScopeCheck {
  blocking: boolean;
  reasons: string[];
  warnings: string[];
}

const SCOPE_MESSAGE_CAP = 12;

/**
 * L4 — compare a pull request's changed files with the task scope and teammate locks.
 * Strict violations block the merge. Advisory ones are warnings. A task with no assigned
 * files and no globs has no file restriction, except its read-only list and teammate locks.
 */
export function evaluatePullRequestFiles(
  task: PrScopeTask,
  changedFiles: string[],
  teammates: PrScopeTeammate[],
): PrScopeCheck {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const title = task.title || "this task";
  const assigned = (task.assignedFiles || []).map((f) => f.replace(/\\/g, "/"));
  const globs = (task.allowedGlobs || []).map((g) => g.replace(/\\/g, "/"));
  const readOnly = (task.readOnlyFiles || []).map((f) => f.replace(/\\/g, "/"));
  const unrestricted = assigned.filter(Boolean).length === 0 && globs.filter(Boolean).length === 0;
  const myStrict = !isAdvisoryMode(task.fileLockMode);

  const locks = teammates.flatMap((other) =>
    lockPaths(other).map((path) => ({ path, other })),
  );

  const push = (blocking: boolean, message: string) => {
    (blocking ? reasons : warnings).push(message);
  };

  for (const raw of changedFiles) {
    const rel = String(raw || "").replace(/\\/g, "/").trim().replace(/^\.\//, "").replace(/^\/+/, "");
    if (!rel) continue;

    const lock = locks.find((l) => (isGlob(l.path) ? pathMatchesGlob(rel, l.path) : pathsMatch(rel, l.path)));
    if (lock) {
      const owner = lock.other.assignedToName || lock.other.assignedTo || "a teammate";
      const blocking = myStrict && !isAdvisoryMode(lock.other.fileLockMode);
      push(blocking, `${rel} is locked by ${owner} (task: ${lock.other.title || "another task"}).`);
      continue;
    }

    const inScope =
      (unrestricted && !readOnly.some((f) => pathsMatch(rel, f))) ||
      assigned.some((f) => pathsMatch(rel, f)) ||
      globs.some((g) => pathMatchesGlob(rel, g));
    if (inScope) continue;

    const readOnlyHit = readOnly.some((f) => pathsMatch(rel, f));
    push(
      myStrict,
      readOnlyHit
        ? `${rel} is read-only for task '${title}'.`
        : `${rel} is outside the scope of task '${title}'.`,
    );
  }

  const cap = (list: string[]) => {
    if (list.length <= SCOPE_MESSAGE_CAP) return list;
    const extra = list.length - SCOPE_MESSAGE_CAP;
    return [...list.slice(0, SCOPE_MESSAGE_CAP), `…and ${extra} more file(s).`];
  };

  const cappedReasons = cap(reasons);
  return { blocking: reasons.length > 0, reasons: cappedReasons, warnings: cap(warnings) };
}
