/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { extractUserGithubToken, getProjectGitHubStatus } from "@/lib/githubPullRequests";

/**
 * GET /api/github/status?projectId=...
 * Ported from github_status() in shv-codes/zero-ops-autosre/backend/incidents/api/github_views.py.
 * Reports what is configured / connected for the dashboard.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId") || "";

    await dbConnect();
    const project = projectId
      ? ((await Project.findById(projectId).lean()) as any)
      : ((await Project.findOne({ githubRepo: { $exists: true, $ne: "" } }).sort({ updatedAt: -1 }).lean()) as any);

    const userToken = extractUserGithubToken(request);
    const status = await getProjectGitHubStatus(project, userToken);

    return NextResponse.json({ data: status, error: null });
  } catch (err: any) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "GITHUB_STATUS_ERROR", message: err?.message || "Failed to check GitHub status" },
      },
      { status: 500 }
    );
  }
}
