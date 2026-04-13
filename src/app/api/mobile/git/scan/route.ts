import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { repoId } = await req.json();
    if (!repoId) return NextResponse.json({ message: "RepoId required" }, { status: 400 });

    await dbConnect();
    const repo = await GitRepo.findById(repoId);
    if (!repo) return NextResponse.json({ message: "Repo not found" }, { status: 404 });

    // Update status to syncing
    repo.syncStatus = "syncing";
    repo.lastSyncAt = new Date();
    await repo.save();

    // Simulate Octokit scan
    // In real app: const stats = await octokit.rest.repos.get({ owner: repo.owner, repo: repo.repoName });
    setTimeout(async () => {
      try {
        await dbConnect();
        const updatedRepo = await GitRepo.findById(repoId);
        if (updatedRepo) {
          updatedRepo.syncStatus = "verified";
          updatedRepo.stats = {
            commits: Math.floor(Math.random() * 500),
            stars: Math.floor(Math.random() * 100),
            forks: Math.floor(Math.random() * 50),
            issues: Math.floor(Math.random() * 20),
          };
          updatedRepo.commits = [
            { sha: "abc1", message: "Tactical UI Expansion", author: "pixel-head", date: new Date(), url: "#" },
            { sha: "def2", message: "Initial Sync Hook", author: "pixel-head", date: new Date(), url: "#" },
          ];
          await updatedRepo.save();
        }
      } catch (err) {
        console.error("Async scan error", err);
      }
    }, 2000);

    return NextResponse.json({ message: "Scan initiated", repo });
  } catch (error) {
    return NextResponse.json({ message: "Scan failed" }, { status: 500 });
  }
}
