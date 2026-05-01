import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { canUpdateProgress } from "@/lib/projectProgressPermissions";
import ActivityLog from "@/models/ActivityLog";
import Task from "@/models/Task";

type PatchTaskBody = {
    status?: "pending" | "in-progress" | "completed" | "delayed";
    progress?: number;
};

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!canUpdateProgress(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as PatchTaskBody;
    const { status, progress } = body;

    if (status === undefined && progress === undefined) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    await dbConnect();

    const task = await Task.findById(taskId);
    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (role === "pixel_member" && task.assignedTo !== (session.user as any).id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status !== undefined) {
        task.status = status;
    }
    if (progress !== undefined) {
        task.progress = Math.max(0, Math.min(100, progress));
        if (task.progress >= 100 && task.status !== "completed") {
            task.status = "completed";
        }
    }
    await task.save();

    await ActivityLog.create({
        projectId: task.projectId,
        userId: (session.user as any).id,
        userName: session.user.email ?? session.user.name ?? "",
        action: `Updated task \"${task.title}\"`,
        metadata: { taskId, status, progress },
    });

    return NextResponse.json({ task });
}