import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import Project from "@/models/Project";

export async function POST(req: Request) {
  try {
    getMobileSession(req); // Validates Bearer token

    const { projectId, repoUrl } = await req.json();

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) return NextResponse.json({ message: "Invalid GitHub URL" }, { status: 400 });

    const [, owner, repoName] = match;

    await dbConnect();

    const gitRepo = await GitRepo.findOneAndUpdate(
      { projectId },
      {
        repoUrl,
        owner,
        repoName,
        syncStatus: "syncing",
        lastSyncAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Simulate async GitHub sync
    setTimeout(async () => {
      await GitRepo.findByIdAndUpdate(gitRepo._id, {
        syncStatus: "verified",
        stats: { commits: 124, stars: 12, forks: 3, issues: 5 },
        commits: [
          { sha: "abc1", message: "Initial obsidian core", author: "Tushar G.", date: new Date() },
          { sha: "def2", message: "Added signaling API", author: "Tushar G.", date: new Date(Date.now() - 3600000) },
          { sha: "ghi3", message: "Refined telemetry sync", author: "Sarah C.", date: new Date(Date.now() - 7200000) },
        ],
      });
      await Project.findByIdAndUpdate(projectId, { githubRepo: repoUrl });
    }, 1000);

    return NextResponse.json(gitRepo);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    await dbConnect();
    const repo = await GitRepo.findOne({ projectId }).lean();

    return NextResponse.json(repo || { message: "No repo linked" });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
