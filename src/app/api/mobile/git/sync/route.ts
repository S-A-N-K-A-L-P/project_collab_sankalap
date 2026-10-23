import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import Project from "@/models/Project";
import { applySnapshot, fetchRepoSnapshot, parseGithubUrl } from "@/lib/github";

// POST /api/mobile/git/sync — link a GitHub repo to a project and pull real stats from the GitHub API.
export async function POST(req: Request) {
  try {
    getMobileSession(req); // Validates Bearer token

    const { projectId, repoUrl } = await req.json();
    const ref = parseGithubUrl(repoUrl);
    if (!ref) return NextResponse.json({ message: "Invalid GitHub URL" }, { status: 400 });

    await dbConnect();

    const gitRepo = await GitRepo.findOneAndUpdate(
      { projectId },
      { repoUrl, owner: ref.owner, repoName: ref.repo, syncStatus: "syncing", lastSyncAt: new Date() },
      { upsert: true, new: true }
    );
    await Project.findByIdAndUpdate(projectId, { githubRepo: repoUrl, gitRepo: gitRepo._id });

    // Fetch before responding: serverless functions don't keep running after the response.
    applySnapshot(gitRepo, await fetchRepoSnapshot(ref));
    await gitRepo.save();

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
