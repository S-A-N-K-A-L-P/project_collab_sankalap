import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import WeeklyReport from "@/models/WeeklyReport";

type CreateWeeklyReportBody = {
    projectId?: string;
    completedTasks?: string[];
    blockers?: string;
    nextWeekPlan?: string;
};

export async function GET(request: NextRequest) {
    try {
        const session = getMobileSession(request);

        const projectId = request.nextUrl.searchParams.get("projectId");
        if (!projectId) {
            return NextResponse.json({ error: "projectId required" }, { status: 400 });
        }

        await dbConnect();

        const reports = await WeeklyReport.find({ projectId }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ reports });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = getMobileSession(request);

        const body = (await request.json()) as CreateWeeklyReportBody;
        const { projectId, completedTasks, blockers, nextWeekPlan } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
        }

        await dbConnect();

        const report = await WeeklyReport.create({
            projectId,
            userId: session.id,
            userName: session.email ?? session.name ?? "",
            completedTasks: completedTasks ?? [],
            blockers: blockers ?? "",
            nextWeekPlan: nextWeekPlan ?? "",
        });

        await ActivityLog.create({
            projectId,
            userId: session.id,
            userName: session.email ?? session.name ?? "",
            action: "Submitted weekly report",
            metadata: { reportId: report._id.toString() },
        });

        return NextResponse.json({ report }, { status: 201 });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}