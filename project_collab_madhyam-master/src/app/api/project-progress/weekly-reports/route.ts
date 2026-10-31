import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) {
        return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    await dbConnect();

    const reports = await WeeklyReport.find({ projectId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ reports });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateWeeklyReportBody;
    const { projectId, completedTasks, blockers, nextWeekPlan } = body;

    if (!projectId) {
        return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    await dbConnect();

    const report = await WeeklyReport.create({
        projectId,
        userId: (session.user as any).id,
        userName: session.user.email ?? session.user.name ?? "",
        completedTasks: completedTasks ?? [],
        blockers: blockers ?? "",
        nextWeekPlan: nextWeekPlan ?? "",
    });

    await ActivityLog.create({
        projectId,
        userId: (session.user as any).id,
        userName: session.user.email ?? session.user.name ?? "",
        action: "Submitted weekly report",
        metadata: { reportId: report._id.toString() },
    });

    return NextResponse.json({ report }, { status: 201 });
}