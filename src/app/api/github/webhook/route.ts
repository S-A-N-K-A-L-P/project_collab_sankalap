/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose project records are runtime-shaped at this webhook boundary. */
import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { syncPullRequest } from "@/lib/githubPullRequests";

export const runtime = "nodejs";

function validSignature(raw: string, provided: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !provided?.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(raw).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event") || "";
  const payload = JSON.parse(raw);
  const fullName = payload.repository?.full_name;
  const installationId = payload.installation?.id;
  const numbers = new Set<number>();
  if (payload.pull_request?.number) numbers.add(payload.pull_request.number);
  if (payload.number && ["pull_request", "pull_request_review"].includes(event)) numbers.add(payload.number);
  for (const pr of payload.check_suite?.pull_requests || payload.check_run?.pull_requests || []) {
    if (pr.number) numbers.add(pr.number);
  }
  if (!fullName || numbers.size === 0) return NextResponse.json({ accepted: true, updated: 0 });

  await dbConnect();
  // Freshness indicator for the admin Settings card, even when no task is linked yet.
  const repoPattern = new RegExp(`github\\.com[/:]${fullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\.git)?/?$`, "i");
  await Project.updateMany({ githubRepo: repoPattern }, { $set: { githubLastWebhookAt: new Date() } });
  const tasks = await Task.find({ "pullRequest.repoFullName": fullName, "pullRequest.number": { $in: [...numbers] } });
  let updated = 0;
  for (const task of tasks) {
    const project = await Project.findById(task.projectId).select("githubRepo githubInstallationId").lean() as any;
    if (!project) continue;
    if (installationId && !project.githubInstallationId) {
      await Project.findByIdAndUpdate(task.projectId, { $set: { githubInstallationId: String(installationId) } });
      project.githubInstallationId = String(installationId);
    }
    const [owner, repo] = fullName.split("/");
    task.pullRequest = await syncPullRequest(project, { owner, repo }, task.pullRequest.number, installationId);
    task.pullRequestUrl = task.pullRequest.url;
    await task.save();
    updated++;
  }
  return NextResponse.json({ accepted: true, event, updated });
}
