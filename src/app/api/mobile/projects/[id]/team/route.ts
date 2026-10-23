export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import { isAdminRole } from "@/lib/roles";
import Project from "@/models/Project";
import Task from "@/models/Task";
import User from "@/models/User";
import OrgMember from "@/models/OrgMember";
import ActivityLog from "@/models/ActivityLog";
import { applyRosterChanges, validateRosterChanges } from "@/lib/teamRoster";

async function resolveCaller(req: Request): Promise<{ id: string; role: string; name: string } | null> {
  try {
    const mobile = getMobileSession(req);
    if (mobile?.id) {
      return {
        id: mobile.id,
        role: mobile.role || "user",
        name: mobile.name || mobile.email || "User",
      };
    }
  } catch {
    // Fall back to NextAuth session
  }

  const web = await getServerSession(authOptions);
  if (web?.user && (web.user as any).id) {
    return {
      id: (web.user as any).id,
      role: (web.user as any).role || "user",
      name: web.user.name || web.user.email || "User",
    };
  }
  return null;
}

async function canManageProjectTeam(caller: { id: string; role: string }, project: any): Promise<boolean> {
  if (isAdminRole(caller.role)) return true;
  if (project.lead && project.lead.toString() === caller.id) return true;
  if (project.orgId) {
    const orgMember = await OrgMember.findOne({ userId: caller.id, orgId: project.orgId }).lean() as any;
    if (orgMember && ["lead", "admin", "owner"].includes(orgMember.role)) return true;
  }
  return false;
}

// GET /api/mobile/projects/[id]/team — Returns full team roster, roles, owned paths, workload, and active file locks
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await resolveCaller(req);
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // Ensure User model is registered before populate
    void User;

    const project = await Project.findById(id)
      .populate("lead", "name email avatar role universityName skills handle")
      .populate("members", "name email avatar role universityName skills handle")
      .lean() as any;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasks = await Task.find({ projectId: id }).sort({ createdAt: -1 }).lean() as any[];

    const rosterMap = new Map<string, any>();
    for (const r of project.teamRoster || []) {
      if (r.userId) {
        rosterMap.set(r.userId.toString(), r);
      }
    }

    // Build member list ensuring lead is included
    const rawMembers: any[] = Array.isArray(project.members) ? [...project.members] : [];
    if (project.lead && !rawMembers.some((m) => m._id?.toString() === project.lead._id?.toString())) {
      rawMembers.unshift(project.lead);
    }

    const enrichedMembers = rawMembers.map((m) => {
      const uid = m._id?.toString() || "";
      const isLead = project.lead?._id?.toString() === uid;
      const rosterCfg = rosterMap.get(uid);
      const userTasks = tasks.filter((t) => t.assignedTo === uid);
      const activeTasks = userTasks.filter((t) => t.status === "pending" || t.status === "in-progress" || t.status === "delayed");
      const completedTasks = userTasks.filter((t) => t.status === "completed");
      const avgProgress = userTasks.length > 0
        ? Math.round(userTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / userTasks.length)
        : 0;

      const lockedFiles = Array.from(
        new Set(
          activeTasks.flatMap((t) => Array.isArray(t.assignedFiles) ? t.assignedFiles : [])
        )
      );

      return {
        userId: uid,
        name: m.name || "Unknown",
        email: m.email || "",
        avatar: m.avatar || "",
        platformRole: m.role || "user",
        projectRole: isLead ? "lead" : (rosterCfg?.projectRole || "contributor"),
        ownedPaths: Array.isArray(rosterCfg?.ownedPaths) ? rosterCfg.ownedPaths : [],
        maxActiveTasks: rosterCfg?.maxActiveTasks ?? 5,
        skills: Array.isArray(m.skills) ? m.skills : [],
        isLead,
        activeTaskCount: activeTasks.length,
        completedTaskCount: completedTasks.length,
        totalTaskCount: userTasks.length,
        avgProgress,
        lockedFiles,
      };
    });

    return NextResponse.json({
      projectId: project._id.toString(),
      title: project.title,
      githubRepo: project.githubRepo || "",
      status: project.status,
      leadId: project.lead?._id?.toString() || "",
      members: enrichedMembers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load project team" }, { status: 500 });
  }
}

// PATCH /api/mobile/projects/[id]/team — Add/remove members and configure projectRole & ownedPaths
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await resolveCaller(req);
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!(await canManageProjectTeam(caller, project))) {
      return NextResponse.json({ error: "Forbidden: Only the Project Lead or Admin can manage this team" }, { status: 403 });
    }

    const body = await req.json();
    const {
      add,
      remove,
      memberUpdates,
      githubRepo,
    }: {
      add?: string[];
      remove?: string[];
      memberUpdates?: Array<{
        userId: string;
        projectRole?: string;
        ownedPaths?: string[];
        maxActiveTasks?: number;
      }>;
      githubRepo?: string;
    } = body;

    const invalid = validateRosterChanges({ add, remove, memberUpdates });
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    if (githubRepo !== undefined) {
      project.githubRepo = githubRepo;
    }

    applyRosterChanges(project, { add, remove, memberUpdates });
    await project.save();

    await ActivityLog.create({
      projectId: id,
      userId: caller.id,
      userName: caller.name,
      action: "Updated project team roster & file ownership scopes",
      metadata: {
        added: add?.length || 0,
        removed: remove?.length || 0,
        updatedRoles: memberUpdates?.length || 0,
      },
    });

    return GET(req, { params: Promise.resolve({ id }) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update project team" }, { status: 500 });
  }
}
