export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import GitRepo from "@/models/GitRepo";
import { getMobileSession } from "@/lib/mobileAuth";

// GET — public: fetch repos by userId query param
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "UserId required" }, { status: 400 });
    }

    await dbConnect();
    const repos = await GitRepo.find({ userId, type: "PERSONAL" }).sort({ updatedAt: -1 });

    return NextResponse.json(repos);
  } catch (error: any) {
    console.error("[GIT_USER_GET_ERROR]", error);
    return NextResponse.json({ message: "Error fetching user repos" }, { status: 500 });
  }
}

// POST — requires Bearer token: link a personal GitHub repo
export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    let { repoUrl } = await req.json();
    if (!repoUrl) return NextResponse.json({ message: "Repo URL required" }, { status: 400 });

    // Normalize URL
    repoUrl = repoUrl.trim().toLowerCase().replace(/\/$/, "");
    if (!repoUrl.startsWith("http")) {
      repoUrl = "https://" + repoUrl;
    }

    const parts = repoUrl.replace("https://github.com/", "").replace("http://github.com/", "").split("/");
    const owner = parts[0];
    const repoName = parts[1];

    if (!owner || !repoName) {
      return NextResponse.json({ message: "Invalid GitHub URL format" }, { status: 400 });
    }

    await dbConnect();

    const repo = await GitRepo.findOneAndUpdate(
      { repoUrl, userId, type: "PERSONAL" },
      {
        $set: {
          repoUrl,
          owner,
          repoName,
          userId,
          type: "PERSONAL",
          syncStatus: "idle",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(repo);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("[GIT_USER_POST_ERROR]", error);
    return NextResponse.json({ message: "Error linking repo: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
