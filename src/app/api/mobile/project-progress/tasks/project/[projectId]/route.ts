import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        try {
            getMobileSession(request);
        } catch {
            const web = await getServerSession(authOptions);
            if (!web?.user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const { projectId } = await params;

        await dbConnect();

        const [tasks, project] = await Promise.all([
            Task.find({ projectId }).sort({ createdAt: -1 }).lean() as Promise<any[]>,
            Project.findById(projectId).select("title githubRepo").lean() as Promise<any>,
        ]);

        // Compute active file lock map across the project
        const fileLocks: Array<{
            filePath: string;
            taskId: string;
            taskTitle: string;
            assignedTo: string;
            assignedToName: string;
            status: string;
            fileLockMode: string;
            targetBranch: string;
        }> = [];

        for (const t of tasks) {
            if (t.status === "completed") continue;
            const assignedFiles: string[] = Array.isArray(t.assignedFiles) ? t.assignedFiles : [];
            for (const fp of assignedFiles) {
                fileLocks.push({
                    filePath: fp,
                    taskId: t._id.toString(),
                    taskTitle: t.title,
                    assignedTo: t.assignedTo,
                    assignedToName: t.assignedToName || t.assignedTo,
                    status: t.status,
                    fileLockMode: t.fileLockMode || "strict",
                    targetBranch: t.targetBranch || "",
                });
            }
        }

        const enrichedTasks = tasks.map((t) => ({
            ...t,
            id: t._id.toString(),
            projectTitle: project?.title || "",
            repoUrl: t.repoUrl || project?.githubRepo || "",
        }));

        return NextResponse.json({
            tasks: enrichedTasks,
            fileLocks,
            projectTitle: project?.title || "",
            repoUrl: project?.githubRepo || "",
        });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
