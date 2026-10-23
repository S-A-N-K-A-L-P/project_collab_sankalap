import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "platform_moderator", "master_admin"].includes(s.user?.role);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const tasks = await Task.find({ projectId: id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const {
      title,
      description,
      assignedTo,
      assignedToName,
      priority,
      deadline,
      repoUrl,
      baseBranch,
      targetBranch,
      assignedFiles,
      allowedGlobs,
      readOnlyFiles,
      fileLockMode,
    } = await req.json();

    if (!title || !assignedTo || !deadline) {
      return NextResponse.json(
        { error: "title, assignedTo, and deadline are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const project = await Project.findById(id).select("githubRepo").lean() as any;

    const cleanAssignedFiles = Array.isArray(assignedFiles)
      ? Array.from(new Set(assignedFiles.map((f: string) => f.replace(/\\/g, "/").trim()).filter(Boolean)))
      : [];
    const cleanAllowedGlobs = Array.isArray(allowedGlobs)
      ? Array.from(new Set(allowedGlobs.map((g: string) => g.replace(/\\/g, "/").trim()).filter(Boolean)))
      : [];
    const cleanReadOnlyFiles = Array.isArray(readOnlyFiles)
      ? Array.from(new Set(readOnlyFiles.map((f: string) => f.replace(/\\/g, "/").trim()).filter(Boolean)))
      : [];

    const task = await Task.create({
      projectId: id,
      title,
      description: description || "",
      assignedTo,
      assignedToName: assignedToName || "",
      priority: priority || "medium",
      deadline: new Date(deadline),
      status: "pending",
      progress: 0,
      repoUrl: (repoUrl || project?.githubRepo || "").trim(),
      baseBranch: baseBranch || "main",
      targetBranch: targetBranch || "",
      assignedFiles: cleanAssignedFiles,
      allowedGlobs: cleanAllowedGlobs,
      readOnlyFiles: cleanReadOnlyFiles,
      fileLockMode: fileLockMode || "strict",
      assignedBy: (session?.user as any)?.id || "",
      assignedByName: session?.user?.name || session?.user?.email || "Admin",
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
