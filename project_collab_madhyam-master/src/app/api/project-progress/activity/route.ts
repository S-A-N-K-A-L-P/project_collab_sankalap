import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

type CreateActivityBody = {
    projectId?: string;
    userId?: string;
    userName?: string;
    action?: string;
    metadata?: Record<string, unknown>;
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

    const logs = await ActivityLog.find({ projectId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    return NextResponse.json({ logs });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateActivityBody;
    const { projectId, userId, userName, action, metadata } = body;

    if (!projectId || !action) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const log = await ActivityLog.create({
        projectId,
        userId: userId ?? (session.user as any).id,
        userName: userName ?? session.user.email ?? session.user.name ?? "",
        action,
        metadata: metadata ?? {},
    });

    return NextResponse.json({ log }, { status: 201 });
}