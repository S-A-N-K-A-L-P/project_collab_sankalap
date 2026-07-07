import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import ProjectDoc from "@/models/ProjectDoc";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const project = await Project.findOne({ _id: id, status: "completed", "showcase.isPublic": true })
      .populate("lead", "name avatar")
      .populate("members", "name avatar")
      .populate("orgId", "name slug")
      .populate("completedBy", "name avatar")
      .populate("gitRepo")
      .lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found in showcase" }, { status: 404 });
    }

    const docs = await ProjectDoc.find({ projectId: id }).sort({ createdAt: -1 }).lean();

    // Increment view counter (fire-and-forget)
    Project.findByIdAndUpdate(id, { $inc: { showcaseViews: 1 } }).catch(() => null);

    return NextResponse.json({
      project: JSON.parse(JSON.stringify(project)),
      docs:    JSON.parse(JSON.stringify(docs)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
