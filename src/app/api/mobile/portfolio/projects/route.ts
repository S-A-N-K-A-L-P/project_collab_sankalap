import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;
    await dbConnect();

    const projects = await Project.find({ $or: [{ lead: userId }, { members: userId }] })
      .select("title description coverImage liveUrl githubRepo techStack version status")
      .sort({ completedAt: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({ projects: JSON.parse(JSON.stringify(projects)) });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
