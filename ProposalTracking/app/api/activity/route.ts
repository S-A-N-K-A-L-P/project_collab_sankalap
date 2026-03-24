import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { validateSession } from "@/lib/auth";
import ActivityLog from "@/models/ActivityLog";

// GET /api/activity?projectId=xxx — fetch all activity logs
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

  const logs = await ActivityLog.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ logs });
}

// POST /api/activity — internal route to log an action
export async function POST(request: NextRequest) {
  const user = await validateSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, userId, userName, action, metadata } = body as {
    projectId: string;
    userId: string;
    userName?: string;
    action: string;
    metadata?: Record<string, unknown>;
  };

  if (!projectId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();

  const log = await ActivityLog.create({
    projectId,
    userId: userId ?? user.id,
    userName: userName ?? user.email,
    action,
    metadata: metadata ?? {},
  });

  return NextResponse.json({ log }, { status: 201 });
}
