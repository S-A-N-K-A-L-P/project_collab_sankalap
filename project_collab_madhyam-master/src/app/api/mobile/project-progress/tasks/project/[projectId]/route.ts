import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        getMobileSession(request); // Validate Bearer token

        const { projectId } = await params;

        await dbConnect();

        const tasks = await Task.find({ projectId }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ tasks });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}