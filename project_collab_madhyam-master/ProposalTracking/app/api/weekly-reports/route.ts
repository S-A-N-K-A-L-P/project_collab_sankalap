import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { validateSession } from "@/lib/auth";
import WeeklyReport from "@/models/WeeklyReport";
import ActivityLog from "@/models/ActivityLog";
import { UserRole } from "@/lib/permissions";

// GET /api/weekly-reports?projectId=xxx — fetch all weekly reports for a project
export async function GET(request: NextRequest) {
  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  await connectDB();

  const reports = await WeeklyReport.find({ projectId })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ reports });
}

// POST /api/weekly-reports — submit weekly report (any authenticated member)
export async function POST(request: NextRequest) {
  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, completedTasks, blockers, nextWeekPlan, userName } = body as {
    projectId: string;
    completedTasks: string[];
    blockers: string;
    nextWeekPlan: string;
    userName?: string;
    role?: UserRole;
  };

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  await connectDB();

  const report = await WeeklyReport.create({
    projectId,
    userId: user.id,
    userName: userName ?? user.email,
    completedTasks: completedTasks ?? [],
    blockers: blockers ?? "",
    nextWeekPlan: nextWeekPlan ?? "",
  });

  await ActivityLog.create({
    projectId,
    userId: user.id,
    userName: userName ?? user.email,
    action: `Submitted weekly report`,
    metadata: { reportId: report._id.toString() },
  });

  return NextResponse.json({ report }, { status: 201 });
}
