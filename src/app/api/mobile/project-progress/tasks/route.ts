import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import { canManageTasks } from "@/lib/projectProgressPermissions";
import ActivityLog from "@/models/ActivityLog";
import Project from "@/models/Project";
import OrgMember from "@/models/OrgMember";
import Task from "@/models/Task";

type CreateTaskBody = {
    projectId?: string;
    title?: string;
    description?: string;
    assignedTo?: string;
    assignedToName?: string;
    priority?: "low" | "medium" | "high";
    deadline?: string;
    /* Git Task Distribution extensions */
    repoUrl?: string;
    baseBranch?: string;
    targetBranch?: string;
    assignedFiles?: string[];
    allowedGlobs?: string[];
    readOnlyFiles?: string[];
    fileLockMode?: "advisory" | "strict" | "exclusive";
    forceAssign?: boolean;
};

async function resolveSession(request: Request) {
    try {
        const mobile = getMobileSession(request);
        if (mobile?.id) return mobile;
    } catch {
        // fallback to web session
    }
    const web = await getServerSession(authOptions);
    if (web?.user && (web.user as any).id) {
        return {
            id: (web.user as any).id,
            role: (web.user as any).role || "user",
            name: web.user.name || "",
            email: web.user.email || "",
        };
    }
    throw new Error("Missing or invalid token");
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 28) || "task";
}

export async function POST(request: Request) {
    try {
        const session = await resolveSession(request);

        const body = (await request.json()) as CreateTaskBody;
        const {
            projectId,
            title,
            description,
            assignedTo,
            assignedToName,
            priority,
            deadline,
            repoUrl,
            baseBranch,
            targetBranch,
            assignedFiles,
            allowedGlobs,
            readOnlyFiles,
            fileLockMode,
            forceAssign,
        } = body;

        if (!projectId || !title || !assignedTo || !deadline) {
            return NextResponse.json({ error: "Missing required fields (projectId, title, assignedTo, deadline)" }, { status: 400 });
        }

        await dbConnect();

        const project = await Project.findById(projectId).lean() as any;

        // Permission check: Platform Admin/Associate, OR Project Lead, OR Org Lead/Admin
        let authorized = canManageTasks(session.role);
        if (!authorized && project) {
            if (project.lead && project.lead.toString() === session.id) {
                authorized = true;
            } else if (project.orgId) {
                const orgMember = await OrgMember.findOne({ userId: session.id, orgId: project.orgId }).lean() as any;
                if (orgMember && ["lead", "admin", "owner"].includes(orgMember.role)) {
                    authorized = true;
                }
            }
        }

        if (!authorized) {
            return NextResponse.json({ error: "Forbidden: Only Project Leads or Admins can distribute tasks" }, { status: 403 });
        }

        const cleanAssignedFiles = Array.isArray(assignedFiles)
            ? Array.from(new Set(assignedFiles.map((f) => f.replace(/\\/g, "/").trim()).filter(Boolean)))
            : [];
        const cleanAllowedGlobs = Array.isArray(allowedGlobs)
            ? Array.from(new Set(allowedGlobs.map((g) => g.replace(/\\/g, "/").trim()).filter(Boolean)))
            : [];
        const cleanReadOnlyFiles = Array.isArray(readOnlyFiles)
            ? Array.from(new Set(readOnlyFiles.map((f) => f.replace(/\\/g, "/").trim()).filter(Boolean)))
            : [];

        // Check for Git File-Lock Collisions with other active tasks in the same project
        const collisions: Array<{
            filePath: string;
            taskId: string;
            taskTitle: string;
            assignedTo: string;
            assignedToName: string;
            fileLockMode: string;
        }> = [];

        if (cleanAssignedFiles.length > 0) {
            const activeOtherTasks = await Task.find({
                projectId,
                status: { $in: ["pending", "in-progress", "delayed"] },
                assignedTo: { $ne: assignedTo },
            }).lean() as any[];

            const fileSet = new Set(cleanAssignedFiles.map((f) => f.toLowerCase()));
            for (const other of activeOtherTasks) {
                const otherFiles: string[] = Array.isArray(other.assignedFiles) ? other.assignedFiles : [];
                for (const ofile of otherFiles) {
                    if (fileSet.has(ofile.toLowerCase())) {
                        collisions.push({
                            filePath: ofile,
                            taskId: other._id.toString(),
                            taskTitle: other.title,
                            assignedTo: other.assignedTo,
                            assignedToName: other.assignedToName || other.assignedTo,
                            fileLockMode: other.fileLockMode || "strict",
                        });
                    }
                }
            }
        }

        if (collisions.length > 0 && !forceAssign && (fileLockMode || "strict") !== "advisory") {
            return NextResponse.json(
                {
                    error: `Git file lock conflict: ${collisions.length} file(s) are already assigned to another active task.`,
                    collisions,
                },
                { status: 409 }
            );
        }

        const computedTargetBranch =
            (targetBranch || "").trim() ||
            `task/${slugify(assignedToName || assignedTo)}-${slugify(title)}`;

        const task = await Task.create({
            projectId,
            title,
            description: description ?? "",
            assignedTo,
            assignedToName: assignedToName ?? "",
            priority: priority ?? "medium",
            deadline: new Date(deadline),
            status: "pending",
            progress: 0,
            repoUrl: (repoUrl || project?.githubRepo || "").trim(),
            baseBranch: (baseBranch || "main").trim(),
            targetBranch: computedTargetBranch,
            assignedFiles: cleanAssignedFiles,
            allowedGlobs: cleanAllowedGlobs,
            readOnlyFiles: cleanReadOnlyFiles,
            fileLockMode: fileLockMode || "strict",
            assignedBy: session.id,
            assignedByName: session.name || session.email || "Project Lead",
        });

        await ActivityLog.create({
            projectId,
            userId: session.id,
            userName: session.email ?? session.name ?? "",
            action: `Assigned Git task "${title}" (${cleanAssignedFiles.length} files on ${computedTargetBranch}) to ${assignedToName || assignedTo}`,
            metadata: {
                taskId: task._id.toString(),
                assignedTo,
                assignedFiles: cleanAssignedFiles,
                targetBranch: computedTargetBranch,
            },
        });

        return NextResponse.json({ task, warnings: collisions }, { status: 201 });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
