import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { canUpdateProgress } from "@/lib/projectProgressPermissions";
import ProgressUpdate from "@/models/ProgressUpdate";
import Task from "@/models/Task";

type CreateProgressBody = {
    taskId?: string;
    progress?: number;
    message?: string;
};

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!canUpdateProgress(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as CreateProgressBody;
    const { taskId, progress, message } = body;

    if (!taskId || progress === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const task = await Task.findById(taskId);
    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (role === "pixel_member" && task.assignedTo !== (session.user as any).id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const safeProgress = Math.max(0, Math.min(100, progress));

    const update = await ProgressUpdate.create({
        taskId,
        userId: (session.user as any).id,
        progress: safeProgress,
        message: message ?? "",
    });

    task.progress = safeProgress;
    task.status = safeProgress >= 100 ? "completed" : task.status === "pending" ? "in-progress" : task.status;
    await task.save();

    return NextResponse.json({ update }, { status: 201 });
}