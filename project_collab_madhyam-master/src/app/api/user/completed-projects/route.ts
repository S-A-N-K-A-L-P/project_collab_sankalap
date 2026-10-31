import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as any).id;

    const projects = await Project.find({
      status: "completed",
      $or: [{ lead: userId }, { members: userId }],
    })
      .populate("lead", "name avatar")
      .populate("orgId", "name")
      .sort({ completedAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(projects)));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
