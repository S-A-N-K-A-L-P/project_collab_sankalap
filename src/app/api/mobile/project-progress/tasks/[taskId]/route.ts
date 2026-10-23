import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import { canManageTasks, canUpdateProgress } from "@/lib/projectProgressPermissions";
import ActivityLog from "@/models/ActivityLog";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { cleanPathList, collisionError, findScopeCollisions } from "@/lib/gitTaskScope";

type PatchTaskBody = {
    status?: "pending" | "in-progress" | "completed" | "delayed";
    progress?: number;
    /* Receiver Git & Verification telemetry */
    latestCommitSha?: string;
    commitCount?: number;
    pullRequestUrl?: string;
    verificationGate?: {
        buildPassed?: boolean;
        testsPassed?: boolean;
        sastPassed?: boolean;
        contractsPassed?: boolean;
        /* "passed" | "failed: …" | "not run: …" — sent by Syncro Desktop */
        buildStatus?: string;
        testsStatus?: string;
        sastStatus?: string;
        contractsStatus?: string;
    };
    /* Lead / Dispatcher updates */
    title?: string;
    description?: string;
    assignedTo?: string;
    assignedToName?: string;
    priority?: "low" | "medium" | "high";
    deadline?: string;
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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;
        const session = await resolveSession(request);

        const body = (await request.json()) as PatchTaskBody;

        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const project = await Project.findById(task.projectId).select("lead").lean() as any;
        const isLeadOrAdmin =
            canManageTasks(session.role) ||
            (project?.lead && project.lead.toString() === session.id);
        const isAssignee = task.assignedTo === session.id;

        if (!isLeadOrAdmin && !isAssignee && !canUpdateProgress(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!isLeadOrAdmin && !isAssignee) {
            return NextResponse.json({ error: "Forbidden: Task is assigned to another developer" }, { status: 403 });
        }

        // Receiver & Status updates
        if (body.status !== undefined) {
            if (body.status === "in-progress" && !task.acceptedAt) {
                task.acceptedAt = new Date();
            }
            task.status = body.status;
        }
        if (body.progress !== undefined) {
            task.progress = Math.max(0, Math.min(100, body.progress));
            if (task.progress >= 100 && task.status !== "completed") {
                task.status = "completed";
            }
        }
        if (body.latestCommitSha !== undefined) task.latestCommitSha = body.latestCommitSha;
        if (body.commitCount !== undefined) task.commitCount = body.commitCount;
        if (body.pullRequestUrl !== undefined) task.pullRequestUrl = body.pullRequestUrl;
        if (body.verificationGate) {
            const g = body.verificationGate;
            const prev = task.verificationGate || {};
            const str = (v: unknown, old: unknown) => (typeof v === "string" ? v.slice(0, 200) : (old as string) || "");
            task.verificationGate = {
                buildPassed: g.buildPassed ?? prev.buildPassed ?? false,
                testsPassed: g.testsPassed ?? prev.testsPassed ?? false,
                sastPassed: g.sastPassed ?? prev.sastPassed ?? false,
                contractsPassed: g.contractsPassed ?? prev.contractsPassed ?? false,
                buildStatus: str(g.buildStatus, prev.buildStatus),
                testsStatus: str(g.testsStatus, prev.testsStatus),
                sastStatus: str(g.sastStatus, prev.sastStatus),
                contractsStatus: str(g.contractsStatus, prev.contractsStatus),
                verifiedAt: new Date(),
            };
        }

        // Lead / Admin scope & metadata updates
        if (isLeadOrAdmin) {
            if (body.title !== undefined) task.title = body.title;
            if (body.description !== undefined) task.description = body.description;
            if (body.assignedTo !== undefined) task.assignedTo = body.assignedTo;
            if (body.assignedToName !== undefined) task.assignedToName = body.assignedToName;
            if (body.priority !== undefined) task.priority = body.priority;
            if (body.deadline !== undefined) task.deadline = new Date(body.deadline);
            if (body.repoUrl !== undefined) task.repoUrl = body.repoUrl;
            if (body.baseBranch !== undefined) task.baseBranch = body.baseBranch;
            if (body.targetBranch !== undefined) task.targetBranch = body.targetBranch;
            if (Array.isArray(body.assignedFiles)) task.assignedFiles = cleanPathList(body.assignedFiles);
            if (Array.isArray(body.allowedGlobs)) task.allowedGlobs = cleanPathList(body.allowedGlobs);
            if (Array.isArray(body.readOnlyFiles)) task.readOnlyFiles = cleanPathList(body.readOnlyFiles);
            if (body.fileLockMode !== undefined) task.fileLockMode = body.fileLockMode;

            // Re-check locks when the scope or the assignee changed.
            const scopeChanged = Array.isArray(body.assignedFiles) || Array.isArray(body.allowedGlobs)
                || body.assignedTo !== undefined || body.fileLockMode !== undefined;
            if (scopeChanged) {
                const collisions = await findScopeCollisions({
                    projectId: task.projectId,
                    assignedTo: task.assignedTo,
                    assignedFiles: task.assignedFiles || [],
                    allowedGlobs: task.allowedGlobs || [],
                    fileLockMode: task.fileLockMode,
                    excludeTaskId: String(task._id),
                });
                if (collisions.some((c) => c.blocking) && !body.forceAssign) {
                    return NextResponse.json(collisionError(collisions), { status: 409 });
                }
            }
        }

        await task.save();

        await ActivityLog.create({
            projectId: task.projectId,
            userId: session.id,
            userName: session.email ?? session.name ?? "",
            action: `Updated task "${task.title}" (${task.status}, ${task.progress}%)`,
            metadata: {
                taskId,
                status: task.status,
                progress: task.progress,
                latestCommitSha: task.latestCommitSha,
            },
        });

        return NextResponse.json({ task });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;
        const session = await resolveSession(request);

        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const project = await Project.findById(task.projectId).select("lead").lean() as any;
        const isLeadOrAdmin =
            canManageTasks(session.role) ||
            (project?.lead && project.lead.toString() === session.id);

        if (!isLeadOrAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await Task.findByIdAndDelete(taskId);

        return NextResponse.json({ message: "Task deleted" });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
