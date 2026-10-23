/* eslint-disable @typescript-eslint/no-explicit-any -- GitHub REST payloads and hydrated Mongoose task documents are runtime-shaped. */
import crypto from "crypto";
import { parseGithubUrl, type RepoRef } from "@/lib/github";

const API = "https://api.github.com";
const API_VERSION = "2022-11-28";

type ProjectGithubConfig = {
  githubRepo?: string;
  githubInstallationId?: string | number;
};

export type PullRequestCheck = {
  name: string;
  status: string;
  conclusion: string;
  url: string;
};

export type PullRequestSnapshot = {
  number: number;
  url: string;
  repoFullName: string;
  state: "open" | "closed" | "merged";
  draft: boolean;
  mergeable: boolean | null;
  mergeableState: string;
  headSha: string;
  reviewDecision: "" | "approved" | "changes_requested" | "review_required";
  approvals: number;
  changesRequested: number;
  checks: PullRequestCheck[];
  lastSyncedAt: Date;
};

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function appJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !privateKey) {
    throw new Error("GitHub App is not configured (GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required).");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }));
  const input = `${header}.${payload}`;
  const signature = crypto.createSign("RSA-SHA256").update(input).sign(privateKey);
  return `${input}.${base64url(signature)}`;
}

async function installationToken(installationId: string) {
  const cached = tokenCache.get(installationId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const res = await fetch(`${API}/app/installations/${encodeURIComponent(installationId)}/access_tokens`, {
    method: "POST",
    headers: githubHeaders(appJwt()),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.token) throw new Error(githubError(res.status, body));
  const expiresAt = body.expires_at ? Date.parse(body.expires_at) : Date.now() + 50 * 60_000;
  tokenCache.set(installationId, { token: body.token, expiresAt });
  return body.token as string;
}

function githubHeaders(token?: string) {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "Syncro-Platform",
    "X-GitHub-Api-Version": API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function githubError(status: number, body: any) {
  const detail = typeof body?.message === "string" ? `: ${body.message}` : "";
  if (status === 401) return `GitHub rejected the configured credential${detail}`;
  if (status === 403) return `GitHub App lacks permission for this operation${detail}`;
  if (status === 404) return `GitHub repository, branch, or pull request was not found${detail}`;
  if (status === 422) return `GitHub rejected the request${detail}`;
  return `GitHub API error ${status}${detail}`;
}

async function tokenFor(project: ProjectGithubConfig, installationOverride?: string | number) {
  const installationId = String(installationOverride || project.githubInstallationId || "").trim();
  if (installationId) return installationToken(installationId);
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  throw new Error("No GitHub installation is connected to this project.");
}

async function request<T>(project: ProjectGithubConfig, path: string, init: RequestInit = {}, installationOverride?: string | number): Promise<T> {
  const token = await tokenFor(project, installationOverride);
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...githubHeaders(token), ...(init.headers || {}) },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(githubError(res.status, body));
  return body as T;
}

export function projectRepo(project: ProjectGithubConfig, taskRepoUrl?: string): RepoRef {
  const ref = parseGithubUrl(taskRepoUrl || project.githubRepo || "");
  if (!ref) throw new Error("This task does not have a valid GitHub repository URL.");
  return ref;
}

function pathFor(ref: RepoRef, suffix: string) {
  return `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}${suffix}`;
}

export async function createPullRequest(project: ProjectGithubConfig, ref: RepoRef, input: { title: string; body: string; head: string; base: string }) {
  return request<any>(project, pathFor(ref, "/pulls"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, maintainer_can_modify: true }),
  });
}

export async function findOpenPullRequest(project: ProjectGithubConfig, ref: RepoRef, head: string, base: string) {
  const pulls = await request<any[]>(project, pathFor(ref, `/pulls?state=open&head=${encodeURIComponent(`${ref.owner}:${head}`)}&base=${encodeURIComponent(base)}`));
  return pulls[0] || null;
}

export async function syncPullRequest(project: ProjectGithubConfig, ref: RepoRef, number: number, installationOverride?: string | number): Promise<PullRequestSnapshot> {
  const pr = await request<any>(project, pathFor(ref, `/pulls/${number}`), {}, installationOverride);
  const sha = pr.head?.sha || "";
  const [checksBody, reviews] = await Promise.all([
    sha ? request<any>(project, pathFor(ref, `/commits/${encodeURIComponent(sha)}/check-runs?per_page=100`), {}, installationOverride).catch(() => ({ check_runs: [] })) : { check_runs: [] },
    request<any[]>(project, pathFor(ref, `/pulls/${number}/reviews?per_page=100`), {}, installationOverride).catch(() => []),
  ]);

  const latestReviewByUser = new Map<string, string>();
  for (const review of reviews) {
    const login = review.user?.login;
    const state = String(review.state || "").toUpperCase();
    if (login && ["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(state)) latestReviewByUser.set(login, state);
  }
  const states = [...latestReviewByUser.values()];
  const approvals = states.filter((s) => s === "APPROVED").length;
  const changesRequested = states.filter((s) => s === "CHANGES_REQUESTED").length;
  const reviewDecision = changesRequested > 0 ? "changes_requested" : approvals > 0 ? "approved" : "review_required";
  const checks: PullRequestCheck[] = (checksBody.check_runs || []).map((check: any) => ({
    name: check.name || "GitHub check",
    status: check.status || "",
    conclusion: check.conclusion || "",
    url: check.html_url || "",
  }));

  return {
    number,
    url: pr.html_url || "",
    repoFullName: `${ref.owner}/${ref.repo}`,
    state: pr.merged ? "merged" : pr.state === "closed" ? "closed" : "open",
    draft: !!pr.draft,
    mergeable: typeof pr.mergeable === "boolean" ? pr.mergeable : null,
    mergeableState: pr.mergeable_state || "unknown",
    headSha: sha,
    reviewDecision,
    approvals,
    changesRequested,
    checks,
    lastSyncedAt: new Date(),
  };
}

export async function reviewPullRequest(project: ProjectGithubConfig, ref: RepoRef, number: number, action: "approve" | "request_changes", body: string) {
  return request<any>(project, pathFor(ref, `/pulls/${number}/reviews`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: action === "approve" ? "APPROVE" : "REQUEST_CHANGES", body }),
  });
}

export async function mergePullRequest(project: ProjectGithubConfig, ref: RepoRef, number: number, sha: string) {
  return request<any>(project, pathFor(ref, `/pulls/${number}/merge`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha, merge_method: "squash" }),
  });
}

/**
 * Whether the commit Syncro verified is the commit GitHub would merge.
 * "fresh": verified SHA is the PR head (short or full SHA accepted); "stale": head moved on;
 * "unknown": no verified SHA or no head SHA recorded.
 */
export function verificationFreshness(task: any): "fresh" | "stale" | "unknown" {
  const verified = String(task?.latestCommitSha || "").trim().toLowerCase();
  const head = String(task?.pullRequest?.headSha || "").trim().toLowerCase();
  if (verified.length < 7 || !head) return "unknown";
  return head.startsWith(verified) || verified.startsWith(head) ? "fresh" : "stale";
}

export function evaluateMergeGate(task: any) {
  const gate = task.verificationGate || {};
  const statuses = [gate.buildStatus, gate.testsStatus, gate.sastStatus, gate.contractsStatus].map((x) => String(x || "").toLowerCase());
  const reasons: string[] = [];
  if (statuses.some((s) => s.startsWith("failed"))) reasons.push("A Syncro verification gate failed.");
  if (![gate.buildStatus, gate.testsStatus].some((s) => String(s || "").toLowerCase().startsWith("passed"))) {
    reasons.push("Neither build nor tests produced a passing result.");
  }
  const pr = task.pullRequest || {};
  if (pr.state && pr.state !== "open") reasons.push(`Pull request is ${pr.state}.`);
  if (pr.mergeable === false) reasons.push("GitHub reports merge conflicts.");
  if (pr.mergeable === null || pr.mergeable === undefined) reasons.push("GitHub has not finished calculating mergeability.");
  if (pr.reviewDecision === "changes_requested") reasons.push("A reviewer requested changes.");
  const verification = verificationFreshness(task);
  if (verification === "stale") reasons.push("New commits were pushed after Syncro verified this task. Re-verify first.");
  if (verification === "unknown") reasons.push("Syncro has no record of which commit was verified. Re-verify first.");
  const failedChecks = (pr.checks || []).filter((c: PullRequestCheck) => ["failure", "cancelled", "timed_out", "action_required", "stale"].includes(c.conclusion));
  const pendingChecks = (pr.checks || []).filter((c: PullRequestCheck) => c.status !== "completed");
  if (failedChecks.length) reasons.push(`${failedChecks.length} GitHub check(s) failed.`);
  if (pendingChecks.length) reasons.push(`${pendingChecks.length} GitHub check(s) are still running.`);
  return { allowed: reasons.length === 0, reasons };
}
