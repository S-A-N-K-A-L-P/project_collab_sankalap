import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import { canManageTasks } from "@/lib/projectProgressPermissions";
import ActivityLog from "@/models/ActivityLog";
import Task from "@/models/Task";

type CreateTaskBody = {
    projectId?: string;
    title?: string;
    description?: string;
    assignedTo?: string;
    assignedToName?: string;
    priority?: "low" | "medium" | "high";
    deadline?: string;
};

export async function POST(request: Request) {
    try {
        const session = getMobileSession(request);

        if (!canManageTasks(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = (await request.json()) as CreateTaskBody;
        const { projectId, title, description, assignedTo, assignedToName, priority, deadline } = body;

        if (!projectId || !title || !assignedTo || !deadline) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

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
        });

        await ActivityLog.create({
            projectId,
            userId: session.id,
            userName: session.email ?? session.name ?? "",
            action: `Created task "${title}"`,
            metadata: { taskId: task._id.toString(), assignedTo },
        });

        return NextResponse.json({ task }, { status: 201 });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}