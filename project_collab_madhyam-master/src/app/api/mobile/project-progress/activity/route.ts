import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
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
    try {
        const session = getMobileSession(request);

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

        const body = (await request.json()) as CreateActivityBody;
        const { projectId, userId, userName, action, metadata } = body;

        if (!projectId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const log = await ActivityLog.create({
            projectId,
            userId: userId ?? session.id,
            userName: userName ?? session.email ?? session.name ?? "",
            action,
            metadata: metadata ?? {},
        });

        return NextResponse.json({ log }, { status: 201 });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}