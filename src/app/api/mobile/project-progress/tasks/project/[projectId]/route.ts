import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    await dbConnect();

    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ tasks });
}