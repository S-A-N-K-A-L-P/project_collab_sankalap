/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose lean documents are runtime-shaped at this API boundary. */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { isAdminRole } from "@/lib/roles";
import Project from "@/models/Project";
import Task from "@/models/Task";
import AgentDevice from "@/models/AgentDevice";
import AgentJob from "@/models/AgentJob";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { dependencyMet, isOnline } from "@/lib/agentJobs";
import {
  evaluateMergeGate,
  extractUserGithubToken,
  parseGithubRepo,
  projectRepo,
  syncPullRequest,
  verificationFreshness,
} from "@/lib/githubPullRequests";

/** Open PRs older than this are refreshed from GitHub on read (keeps the board live without a webhook). */
const PR_STALE_MS = 60_000;
const PR_SYNC_PER_REQUEST = 4;

/**
 * GET /api/admin/projects/{id}/control-room
 * One payload for the admin Control Room, Task board, Scheduler and Team views:
 * tasks (+ their setup job, unmet dependencies, PR + merge gate), members (+ roster, PCs, workload),
 * recent agent jobs and recent activity. Polled every ~10 s by the admin UI.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminRole((session?.user as any)?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();
    void User; // registers the model for populate() on cold start

    const project = (await Project.findById(id)
      .populate("lead", "name email avatar")
      .populate("members", "name email avatar")
      .lean()) as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const userToken = extractUserGithubToken(_req);
    const hasRepo = !!parseGithubRepo(project.githubRepo);
    const githubConfigured = !!(project.githubInstallationId || process.env.GITHUB_TOKEN || userToken || hasRepo);

    // ── Refresh a few stale PRs from GitHub (works tokenless on public repos or with userToken) ──
    if (hasRepo) {
      const stale = await Task.find({
        projectId: id,
        "pullRequest.number": { $exists: true },
        $or: [
          { "pullRequest.lastSyncedAt": { $exists: false } },
          { "pullRequest.lastSyncedAt": { $lt: new Date(Date.now() - PR_STALE_MS) } },
        ],
      }).limit(PR_SYNC_PER_REQUEST);

      await Promise.all(
        stale.map(async (task: any) => {
          try {
            const ref = projectRepo(project, task.repoUrl);
            task.pullRequest = await syncPullRequest(project, ref, task.pullRequest.number, userToken);
            task.pullRequestUrl = task.pullRequest.url;
            if (task.pullRequest.state === "merged" && task.status !== "completed") {
              task.status = "completed";
              task.progress = 100;
            }
            await task.save();
          } catch (e: any) {
            const msg = String(e?.message || e);
            if (msg.includes("(404)")) {
              task.pullRequest = undefined;
              task.pullRequestUrl = "";
              await task.save();
            } else {
              task.pullRequest.lastSyncError = msg.slice(0, 300);
              task.pullRequest.lastSyncedAt = new Date();
              await task.save();
            }
          }
        })
      );
    }

    const people: any[] = [...(project.members || [])];
    if (project.lead && !people.some((m) => String(m._id) === String(project.lead._id))) people.unshift(project.lead);
    const ids = people.map((m) => String(m._id));

    const [tasks, devices, jobs, activity] = await Promise.all([
      Task.find({ projectId: id }).sort({ createdAt: -1 }).lean() as Promise<any[]>,
      AgentDevice.find({ userId: { $in: ids } }).sort({ lastSeenAt: -1 }).lean() as Promise<any[]>,
      AgentJob.find({ projectId: id }).sort({ createdAt: -1 }).limit(80).lean() as Promise<any[]>,
      ActivityLog.find({ projectId: id }).sort({ createdAt: -1 }).limit(30).lean() as Promise<any[]>,
    ]);

    const now = Date.now();
    const taskById = new Map(tasks.map((t) => [String(t._id), t]));
    const deviceName = new Map(devices.map((d) => [d.deviceId, d.name]));

    const unmetFor = (depIds: string[] = [], rule: string) =>
      depIds
        .map((d) => taskById.get(String(d)))
        .filter((d) => d && !dependencyMet(d, rule === "merged" ? "merged" : "completed"))
        .map((d: any) => ({ taskId: String(d._id), title: d.title, rule }));

    const jobView = (j: any) => ({
      id: String(j._id), type: j.type, taskId: j.taskId, title: j.payload?.title || taskById.get(j.taskId)?.title || "",
      targetUserId: j.targetUserId, targetUserName: j.targetUserName,
      status: j.status,
      stalled: ["claimed", "running"].includes(j.status) && !!j.leaseUntil && new Date(j.leaseUntil).getTime() < now,
      runAt: j.runAt || j.createdAt,
      waitingOn: j.status === "queued" ? unmetFor(j.dependsOnTaskIds, j.dependencyRule) : [],
      claimedBy: j.claimedBy, claimedByName: deviceName.get(j.claimedBy) || "",
      attempts: j.attempts, maxAttempts: j.maxAttempts,
      note: j.note, error: j.error, result: j.result,
      createdAt: j.createdAt, createdByName: j.createdByName, finishedAt: j.finishedAt,
    });

    // Latest setup job per task (jobs are already newest-first).
    const setupByTask = new Map<string, any>();
    for (const j of jobs) if (j.type === "setup-task" && j.taskId && !setupByTask.has(j.taskId)) setupByTask.set(j.taskId, j);

    const taskViews = tasks.map((t) => {
      const setup = setupByTask.get(String(t._id));
      return {
        _id: String(t._id), title: t.title, description: t.description,
        assignedTo: t.assignedTo, assignedToName: t.assignedToName,
        status: t.status, priority: t.priority, progress: t.progress,
        deadline: t.deadline, startAt: t.startAt || null, createdAt: t.createdAt,
        dependsOn: t.dependsOn || [], dependencyRule: t.dependencyRule || "completed",
        waitingOn: unmetFor(t.dependsOn, t.dependencyRule),
        repoUrl: t.repoUrl, baseBranch: t.baseBranch, targetBranch: t.targetBranch,
        assignedFiles: t.assignedFiles || [], allowedGlobs: t.allowedGlobs || [], readOnlyFiles: t.readOnlyFiles || [],
        fileLockMode: t.fileLockMode,
        latestCommitSha: t.latestCommitSha, commitCount: t.commitCount || 0,
        verificationGate: t.verificationGate || {},
        pullRequestUrl: t.pullRequestUrl,
        pullRequest: t.pullRequest?.number ? t.pullRequest : null,
        verification: t.pullRequest?.number ? verificationFreshness(t) : null,
        mergeGate: t.pullRequest?.number ? evaluateMergeGate(t) : null,
        setupJob: setup ? jobView(setup) : null,
      };
    });

    const roster = new Map<string, any>((project.teamRoster || []).map((r: any) => [String(r.userId), r]));
    const members = people.map((m) => {
      const uid = String(m._id);
      const r = roster.get(uid) || {};
      const mine = tasks.filter((t) => String(t.assignedTo) === uid);
      const myDevices = devices.filter((d) => d.userId === uid).map((d) => ({
        deviceId: d.deviceId, name: d.name, os: d.os, appVersion: d.appVersion, workspaceRoot: d.workspaceRoot,
        status: d.status, statusNote: d.statusNote, currentJobId: d.currentJobId,
        lastSeenAt: d.lastSeenAt, online: isOnline(d.lastSeenAt),
      }));
      const verified = mine.filter((t) => t.verificationGate?.buildStatus || t.verificationGate?.testsStatus);
      const passed = verified.filter((t) => {
        const g = t.verificationGate || {};
        const s = [g.buildStatus, g.testsStatus, g.sastStatus, g.contractsStatus].map((x: any) => String(x || ""));
        return !s.some((x) => x.startsWith("failed")) && s.some((x) => x.startsWith("passed"));
      });
      return {
        userId: uid, name: m.name || m.email || uid, email: m.email || "", avatar: m.avatar || "",
        isLead: project.lead && String(project.lead._id) === uid,
        projectRole: r.projectRole || (project.lead && String(project.lead._id) === uid ? "lead" : "developer"),
        ownedPaths: r.ownedPaths || [],
        maxActiveTasks: r.maxActiveTasks || 3,
        activeTasks: mine.filter((t) => t.status !== "completed").length,
        totalTasks: mine.length,
        prsMerged: mine.filter((t) => t.pullRequest?.state === "merged").length,
        gatePassRate: verified.length ? Math.round((passed.length / verified.length) * 100) : null,
        currentTask: mine.find((t) => t.status === "in-progress")?.title || "",
        devices: myDevices,
        online: myDevices.some((d) => d.online),
      };
    });

    return NextResponse.json({
      now: new Date(now).toISOString(),
      project: {
        _id: String(project._id), title: project.title, status: project.status, progress: project.progress,
        githubRepo: project.githubRepo || "", githubInstallationId: project.githubInstallationId || "",
        githubLastWebhookAt: project.githubLastWebhookAt || null,
        githubConfigured,
        githubMode: project.githubInstallationId
          ? "app"
          : (userToken || process.env.GITHUB_TOKEN)
          ? "token"
          : hasRepo
          ? "public"
          : "none",
      },
      tasks: taskViews,
      members,
      jobs: jobs.map(jobView),
      activity: activity.map((a) => ({ id: String(a._id), userName: a.userName, action: a.action, createdAt: a.createdAt, metadata: a.metadata || {} })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
