/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";

/**
 * POST /api/github/disconnect
 * Ported from github_disconnect() in shv-codes/zero-ops-autosre/backend/incidents/api/github_views.py.
 * Forgets the GitHub App installation on the project and records an audit log entry.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminRole((session?.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const projectId = String(body.projectId || "");

    await dbConnect();
    const project = projectId
      ? await Project.findById(projectId)
      : await Project.findOne({ githubRepo: { $exists: true, $ne: "" } }).sort({ updatedAt: -1 });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const oldInstallationId = project.githubInstallationId;
    project.githubInstallationId = "";
    project.githubAccount = "";
    project.githubInstallState = "";
    project.githubInstallStateAt = null;
    await project.save();

    await ActivityLog.create({
      projectId: String(project._id),
      userId: String((session?.user as any)?.id || project.lead || "system"),
      userName: String((session?.user as any)?.name || "Admin"),
      action: `Disconnected GitHub App installation ${oldInstallationId ? `#${oldInstallationId}` : ""}`.trim(),
      metadata: { github_app_disconnected: oldInstallationId },
    }).catch(() => {});

    return NextResponse.json({
      data: {
        disconnected: true,
        note: "To fully revoke access, uninstall the app on GitHub (Settings -> Applications).",
      },
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to disconnect GitHub App" },
      { status: 500 }
    );
  }
}
