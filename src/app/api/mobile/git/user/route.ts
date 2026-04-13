export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.error("[GIT_USER_GET] Missing userId");
      return NextResponse.json({ message: "UserId required" }, { status: 400 });
    }

    await dbConnect();
    const repos = await GitRepo.find({ userId, type: "PERSONAL" }).sort({ updatedAt: -1 });
    
    console.log(`[GIT_USER_GET] Found ${repos.length} repos for user ${userId}`);
    return NextResponse.json(repos);
  } catch (error: any) {
    console.error("[GIT_USER_GET_ERROR]", error);
    return NextResponse.json({ message: "Error fetching user repos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("[GIT_USER_POST] Unauthorized access attempt");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let { repoUrl } = await req.json();
    if (!repoUrl) return NextResponse.json({ message: "Repo URL required" }, { status: 400 });

    const userId = (session.user as any).id;
    console.log(`[GIT_USER_POST] Session User ID: ${userId}`);

    if (!userId) {
       console.error("[GIT_USER_POST] UserId missing from session", JSON.stringify(session.user));
       return NextResponse.json({ message: "Session invalid: Missing User ID" }, { status: 500 });
    }

    // Normalization
    repoUrl = repoUrl.trim().toLowerCase().replace(/\/$/, "");
    if (!repoUrl.startsWith("http")) {
      repoUrl = "https://" + repoUrl;
    }

    // Simple parser
    const parts = repoUrl.replace("https://github.com/", "").replace("http://github.com/", "").split("/");
    const owner = parts[0];
    const repoName = parts[1];

    if (!owner || !repoName) {
        console.error("[GIT_USER_POST] Invalid URL parsed:", repoUrl);
        return NextResponse.json({ message: "Invalid GitHub URL format" }, { status: 400 });
    }

    await dbConnect();
    console.log(`[GIT_USER_POST] Saving repo ${repoUrl} for user ${userId}`);

    const repo = await GitRepo.findOneAndUpdate(
      { repoUrl, userId, type: "PERSONAL" },
      {
        $set: {
          repoUrl,
          owner,
          repoName,
          userId,
          type: "PERSONAL",
          syncStatus: "idle"
        }
      },
      { upsert: true, new: true }
    );

    console.log(`[GIT_USER_POST] Success. Mongo ID: ${repo._id.toString()}`);
    return NextResponse.json(repo);
  } catch (error: any) {
    console.error("[GIT_USER_POST_ERROR]", error);
    return NextResponse.json({ message: "Error linking repo: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
