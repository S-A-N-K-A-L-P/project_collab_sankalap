export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);

    await dbConnect();

    const tasks = await Task.find({ assignedTo: session.id })
      .sort({ deadline: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ tasks });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[USER_TASKS_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
