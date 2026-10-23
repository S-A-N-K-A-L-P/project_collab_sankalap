import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import { getMobileSession } from "@/lib/mobileAuth";
import { applySnapshot, fetchRepoSnapshot } from "@/lib/github";

// POST /api/mobile/git/scan — refresh a linked repo's stats from the GitHub API (no simulated numbers).
export async function POST(req: Request) {
  try {
    getMobileSession(req); // Validate Bearer token

    const { repoId } = await req.json();
    if (!repoId) return NextResponse.json({ message: "RepoId required" }, { status: 400 });

    await dbConnect();
    const repo = await GitRepo.findById(repoId);
    if (!repo) return NextResponse.json({ message: "Repo not found" }, { status: 404 });

    applySnapshot(repo, await fetchRepoSnapshot({ owner: repo.owner, repo: repo.repoName }));
    await repo.save();

    return NextResponse.json(
      { message: repo.syncStatus === "verified" ? "Scan complete" : `Scan failed: ${repo.syncError}`, repo },
      { status: repo.syncStatus === "verified" ? 200 : 502 }
    );
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Scan failed" }, { status: 500 });
  }
}
