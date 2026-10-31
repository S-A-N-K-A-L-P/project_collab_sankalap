/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose lean documents are runtime-shaped at this API boundary. */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import {
  canSeeProject, idOf, isTaskDoneView, lastActivityByProject, loadProjectTasks, peopleOf, projectSummary, taskView,
} from "@/lib/projectMobileView";

/**
 * GET /api/mobile/projects/{id} — one project for the mobile app: summary + metrics, every task with
 * its PR and merge-gate verdict, the people on it with their real counts, and recent activity.
 * Members, the lead, mentors, task assignees and admins only.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getMobileSession(req);
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await dbConnect();
    void User; // registers the model for populate() on cold start
    const project = (await Project.findById(id)
      .populate("lead", "name avatar")
      .populate("members", "name avatar")
      .lean()) as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const tasks = await loadProjectTasks([id]);
    const assignees = new Set(tasks.map((t) => String(t.assignedTo || "")));
    if (!canSeeProject(project, session.id, session.role, assignees)) {
      return NextResponse.json({ error: "You are not on this project" }, { status: 403 });
    }

    const nowMs = Date.now();
    const [lastByProject, activity] = await Promise.all([
      lastActivityByProject([id]),
      ActivityLog.find({ projectId: id }).sort({ createdAt: -1 }).limit(20).lean() as Promise<any[]>,
    ]);

    const roster = new Map<string, any>((project.teamRoster || []).map((r: any) => [idOf(r.userId), r]));
    const lastActiveBy = new Map<string, Date>();
    for (const a of activity) {
      const uid = String(a.userId || "");
      if (uid && !lastActiveBy.has(uid)) lastActiveBy.set(uid, a.createdAt);
    }

    const members = peopleOf(project, tasks).map((p) => {
      const mine = tasks.filter((t) => String(t.assignedTo) === p.id);
      const r = roster.get(p.id);
      const lastTaskUpdate = mine.map((t) => t.updatedAt).filter(Boolean).sort((a, b) => +new Date(b) - +new Date(a))[0] || null;
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        role: idOf(project.lead) === p.id ? "lead" : r?.projectRole || "",
        activeTasks: mine.filter((t) => !isTaskDoneView(t)).length,
        completedTasks: mine.filter((t) => isTaskDoneView(t)).length,
        openPrs: mine.filter((t) => t.pullRequest?.state === "open").length,
        mergedPrs: mine.filter((t) => t.pullRequest?.state === "merged").length,
        maxActiveTasks: r?.maxActiveTasks ?? null,
        lastActiveAt: lastActiveBy.get(p.id) || lastTaskUpdate,
      };
    });

    return NextResponse.json({
      now: new Date(nowMs).toISOString(),
      project: projectSummary(project, tasks, nowMs, lastByProject.get(id)),
      tasks: tasks
        .sort((a, b) => +new Date(a.deadline || 8.64e15) - +new Date(b.deadline || 8.64e15))
        .map((t) => taskView(t, nowMs)),
      members,
      activity: activity.map((a) => ({ id: idOf(a), message: a.action || "", userName: a.userName || "", at: a.createdAt || null })),
    });
  } catch (err: any) {
    if (/Missing|jwt|token/i.test(err.message || "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
