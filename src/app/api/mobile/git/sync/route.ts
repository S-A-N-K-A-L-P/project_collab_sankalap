import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import Project from "@/models/Project";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId, repoUrl } = await req.json();
    
    // Parse owner and repo name from URL (e.g. github.com/owner/repo)
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) return NextResponse.json({ message: "Invalid GitHub URL" }, { status: 400 });
    
    const [, owner, repoName] = match;

    await dbConnect();

    // 1. Initial Repo Record
    const gitRepo = await GitRepo.findOneAndUpdate(
        { projectId },
        { 
            repoUrl, 
            owner, 
            repoName, 
            syncStatus: "syncing",
            lastSyncAt: new Date()
        },
        { upsert: true, new: true }
    );

    // 2. Mock Fetch GitHub Data (Real implementation would use octokit)
    // We'll simulate a successful sync for now to allow UI development
    setTimeout(async () => {
        await GitRepo.findByIdAndUpdate(gitRepo._id, {
            syncStatus: "verified",
            stats: {
                commits: 124,
                stars: 12,
                forks: 3,
                issues: 5
            },
            commits: [
                { sha: "abc1", message: "Initial obsidian core", author: "Tushar G.", date: new Date() },
                { sha: "def2", message: "Added signaling API", author: "Tushar G.", date: new Date(Date.now() - 3600000) },
                { sha: "ghi3", message: "Refined telemetry sync", author: "Sarah C.", date: new Date(Date.now() - 7200000) },
            ]
        });
        
        // Update Project repo link
        await Project.findByIdAndUpdate(projectId, { githubRepo: repoUrl });
    }, 1000);

    return NextResponse.json(gitRepo);
  } catch (error: any) {
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
