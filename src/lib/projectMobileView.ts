/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose lean documents are runtime-shaped here. */
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";
import { evaluateMergeGate } from "@/lib/githubPullRequests";
import { isAdminRole } from "@/lib/roles";
import { computeProjectMetrics, gateSummary, isTaskDone } from "@/lib/projectMetrics";

/** Shared by GET /api/mobile/projects?view=mine and GET /api/mobile/projects/{id}. */

export const idOf = (v: any) => String(v?._id ?? v ?? "");

/** Lead, member, mentor, someone with a task in it, or an admin. */
export function canSeeProject(project: any, userId: string, role: string | undefined, taskAssignees: Set<string>) {
  if (isAdminRole(role)) return true;
  if (idOf(project.lead) === userId) return true;
  if ((project.members || []).some((m: any) => idOf(m) === userId)) return true;
  if ((project.mentorIds || []).some((m: any) => idOf(m) === userId)) return true;
  return taskAssignees.has(userId);
}

export function mergeAllowed(t: any) {
  return t?.pullRequest?.state === "open" ? evaluateMergeGate(t).allowed : false;
}

export function latestRelease(project: any) {
  const list = Array.isArray(project.releases) ? project.releases : [];
  const last = [...list].sort((a, b) => +new Date(b.releasedAt || 0) - +new Date(a.releasedAt || 0))[0];
  return last ? { version: last.version || "", releasedAt: last.releasedAt || null } : null;
}

/** People on the project: lead first, then members, then anyone holding a task. */
export function peopleOf(project: any, tasks: any[]) {
  const map = new Map<string, { id: string; name: string; avatar: string }>();
  const add = (u: any, fallbackName = "") => {
    const id = idOf(u);
    if (!id || map.has(id)) return;
    map.set(id, { id, name: (u && typeof u === "object" ? u.name : "") || fallbackName, avatar: (u && typeof u === "object" ? u.avatar : "") || "" });
  };
  add(project.lead);
  (project.members || []).forEach((m: any) => add(m));
  tasks.forEach((t) => t.assignedTo && add(t.assignedTo, t.assignedToName || ""));
  return [...map.values()];
}

export async function loadProjectTasks(projectIds: string[]) {
  return (await Task.find({ projectId: { $in: projectIds } }).lean()) as any[];
}

export async function lastActivityByProject(projectIds: string[]) {
  const rows = (await ActivityLog.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$projectId", action: { $first: "$action" }, userName: { $first: "$userName" }, createdAt: { $first: "$createdAt" } } },
  ])) as any[];
  return new Map(rows.map((r) => [String(r._id), { message: r.action || "", userName: r.userName || "", at: r.createdAt || null }]));
}

export function projectSummary(project: any, tasks: any[], nowMs: number, lastActivity: any) {
  const metrics = computeProjectMetrics(tasks, nowMs, mergeAllowed);
  return {
    id: idOf(project),
    name: project.title || "",
    description: project.description || "",
    status: project.status || "",
    githubRepo: project.githubRepo || "",
    techStack: project.techStack || [],
    lead: project.lead && typeof project.lead === "object" ? { id: idOf(project.lead), name: project.lead.name || "" } : null,
    members: peopleOf(project, tasks).map((p) => ({ id: p.id, name: p.name })),
    latestRelease: latestRelease(project),
    lastActivity: lastActivity || null,
    metrics,
  };
}

export function taskView(t: any, nowMs: number) {
  const pr = t.pullRequest?.number ? t.pullRequest : null;
  const gate = t.verificationGate || {};
  const gs = gateSummary(t);
  const merge = pr && pr.state === "open" ? evaluateMergeGate(t) : null;
  return {
    id: idOf(t),
    title: t.title || "",
    description: t.description || "",
    status: t.status || "",
    done: isTaskDone(t),
    priority: t.priority || "",
    assignedTo: t.assignedTo || "",
    assignedToName: t.assignedToName || "",
    targetBranch: t.targetBranch || "",
    baseBranch: t.baseBranch || "",
    deadline: t.deadline || null,
    overdue: !isTaskDone(t) && !!t.deadline && new Date(t.deadline).getTime() < nowMs,
    progress: typeof t.progress === "number" ? t.progress : null,
    commitCount: typeof t.commitCount === "number" ? t.commitCount : null,
    gates: {
      build: gate.buildStatus || "",
      tests: gate.testsStatus || "",
      sast: gate.sastStatus || "",
      contracts: gate.contractsStatus || "",
      verified: gs.verified,
      failed: gs.failed,
    },
    pullRequest: pr
      ? {
          number: pr.number,
          url: pr.url || "",
          state: pr.state || "",
          draft: !!pr.draft,
          title: pr.title || "",
          authorLogin: pr.authorLogin || "",
          headBranch: pr.headBranch || t.targetBranch || "",
          baseBranch: pr.baseBranch || t.baseBranch || "",
          approvals: pr.approvals || 0,
          changesRequested: pr.changesRequested || 0,
          lastSyncedAt: pr.lastSyncedAt || null,
          mergeReady: merge ? merge.allowed : null,
          blockReasons: merge ? merge.reasons.slice(0, 4) : [],
        }
      : null,
    updatedAt: t.updatedAt || null,
  };
}

export { isTaskDone as isTaskDoneView };
