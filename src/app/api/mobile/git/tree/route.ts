export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import Project from "@/models/Project";
import Task from "@/models/Task";

async function resolveCaller(req: Request) {
  try {
    const m = getMobileSession(req);
    if (m?.id) return m;
  } catch {
    // ignore
  }
  const web = await getServerSession(authOptions);
  if (web?.user && (web.user as any).id) {
    return {
      id: (web.user as any).id,
      role: (web.user as any).role || "user",
      name: web.user.name || web.user.email || "",
    };
  }
  return null;
}

// GET /api/mobile/git/tree?projectId=... — Returns tracked fileTree, branches, and active file locks
export async function GET(req: Request) {
  try {
    const caller = await resolveCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId query param is required" }, { status: 400 });
    }

    await dbConnect();

    const [repo, project, activeTasks] = await Promise.all([
      GitRepo.findOne({ projectId }).lean() as Promise<any>,
      Project.findById(projectId).select("title githubRepo").lean() as Promise<any>,
      Task.find({
        projectId,
        status: { $in: ["pending", "in-progress", "delayed"] },
      }).lean() as Promise<any[]>,
    ]);

    const fileLocks: Array<{
      filePath: string;
      taskId: string;
      taskTitle: string;
      assignedTo: string;
      assignedToName: string;
      status: string;
      fileLockMode: string;
      targetBranch: string;
    }> = [];

    for (const t of activeTasks) {
      const files: string[] = Array.isArray(t.assignedFiles) ? t.assignedFiles : [];
      for (const fp of files) {
        fileLocks.push({
          filePath: fp,
          taskId: t._id.toString(),
          taskTitle: t.title,
          assignedTo: t.assignedTo,
          assignedToName: t.assignedToName || t.assignedTo,
          status: t.status,
          fileLockMode: t.fileLockMode || "strict",
          targetBranch: t.targetBranch || "",
        });
      }
    }

    return NextResponse.json({
      projectId,
      repoUrl: repo?.repoUrl || project?.githubRepo || "",
      defaultBranch: repo?.defaultBranch || "main",
      branches: Array.isArray(repo?.branches) && repo.branches.length > 0 ? repo.branches : ["main"],
      fileTree: Array.isArray(repo?.fileTree) ? repo.fileTree : [],
      lastSyncAt: repo?.lastSyncAt || null,
      fileLocks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch git tree" }, { status: 500 });
  }
}

// POST /api/mobile/git/tree — Syncs real tracked file tree & branches from Syncro.Desktop
export async function POST(req: Request) {
  try {
    const caller = await resolveCaller(req);
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      projectId,
      repoUrl,
      defaultBranch,
      branches,
      fileTree,
    }: {
      projectId?: string;
      repoUrl?: string;
      defaultBranch?: string;
      branches?: string[];
      fileTree?: string[];
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    await dbConnect();

    const cleanTree = Array.isArray(fileTree)
      ? Array.from(new Set(fileTree.map((f) => f.replace(/\\/g, "/").trim()).filter(Boolean))).slice(0, 5000)
      : [];
    const cleanBranches = Array.isArray(branches) && branches.length > 0
      ? Array.from(new Set(branches.map((b) => b.trim()).filter(Boolean)))
      : [defaultBranch || "main"];

    let owner = "syncro";
    let repoName = "workspace";
    const normalizedUrl = (repoUrl || "").trim();
    const match = normalizedUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/i);
    if (match) {
      owner = match[1];
      repoName = match[2];
    } else if (normalizedUrl) {
      const parts = normalizedUrl.replace(/\\/g, "/").split("/").filter(Boolean);
      repoName = parts[parts.length - 1] || "workspace";
    }

    const updatedRepo = await GitRepo.findOneAndUpdate(
      { projectId },
      {
        $set: {
          projectId,
          repoUrl: normalizedUrl || `https://github.com/${owner}/${repoName}`,
          owner,
          repoName,
          defaultBranch: defaultBranch || cleanBranches[0] || "main",
          branches: cleanBranches,
          fileTree: cleanTree,
          syncStatus: "verified",
          lastSyncAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    if (normalizedUrl) {
      await Project.findByIdAndUpdate(projectId, {
        $set: { githubRepo: normalizedUrl, gitRepo: updatedRepo._id },
      });
    }

    return NextResponse.json({
      message: "Git file tree synced",
      projectId,
      fileCount: cleanTree.length,
      branchCount: cleanBranches.length,
      defaultBranch: updatedRepo.defaultBranch,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to sync git file tree" }, { status: 500 });
  }
}
