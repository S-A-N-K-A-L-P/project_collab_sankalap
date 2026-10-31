/* eslint-disable @typescript-eslint/no-explicit-any -- GitHub REST payloads and Mongoose lean docs are runtime-shaped here. */
import crypto from "crypto";
import fs from "fs";
import path from "path";

const GH_API = "https://api.github.com";

/**
 * Down-scoped GitHub App installation permissions (ported from shv-codes/zero-ops-autosre/backend/delivery/github_auth.py).
 */
export const REQUIRED_PERMISSIONS = {
  contents: "write",        // push the fix branch
  pull_requests: "write",   // open the PR, mark it ready, comment, label
  checks: "read",           // read CI check runs
  statuses: "read",         // read commit statuses
  metadata: "read",         // mandatory for every GitHub App
} as const;

export const RENEW_BEFORE_SECONDS = 300; // 5 minutes before expiry

export interface RepoRef {
  owner: string;
  repo: string;
}

export interface PullRequestCheck {
  name: string;
  status: string;
  conclusion: string;
  url: string;
}

export interface PullRequestSnapshot {
  number: number;
  title?: string;
  url: string;
  state: "open" | "closed" | "merged";
  draft: boolean;
  mergeable: boolean | null;
  mergeableState: string;
  headSha: string;
  headBranch: string;
  baseBranch: string;
  authorLogin?: string;
  reviewDecision: "approved" | "changes_requested" | "review_required" | "";
  approvals: number;
  changesRequested: number;
  checks: PullRequestCheck[];
  /** Files the pull request changes. Absent when GitHub could not be asked. */
  changedFiles?: string[];
  changedFilesError?: string;
  scopeCheck?: { checked: boolean; blocking: boolean; reasons: string[]; warnings: string[] };
  lastSyncedAt: Date;
  lastSyncError: string;
}

export interface GitHubAppDescription {
  mode: "app";
  app_slug: string;
  app_name: string;
  bot_login: string;
  install_url: string;
}

export interface GitHubStatus {
  provider: "local" | "github";
  repo: string;
  auth_mode: "app" | "token" | "public" | "none";
  connected: boolean;
  installation_id: number | null;
  account: string;
  app: GitHubAppDescription | null;
  token_expires_in_seconds: number | null;
  error: string | null;
}

export class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubAuthError";
  }
}

/** Accepts https://github.com/owner/repo(.git), git@github.com:owner/repo.git, or owner/repo. */
export function parseGithubRepo(raw?: string | null): RepoRef | null {
  const s = (raw || "").trim().replace(/\.git$/i, "").replace(/\/+$/, "");
  if (!s) return null;
  const urlMatch = s.match(/github\.com[/:]([^/\s]+)\/([^/\s]+)/i);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const shortMatch = s.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };
  return null;
}

export function projectRepo(project: any, fallbackUrl?: string): RepoRef {
  const ref = parseGithubRepo(project?.githubRepo) || parseGithubRepo(fallbackUrl);
  if (!ref) throw new Error("Project has no valid GitHub repository URL configured.");
  return ref;
}

/**
 * Load the GitHub App private key from `GITHUB_APP_PRIVATE_KEY` (PEM string)
 * or `GITHUB_APP_PRIVATE_KEY_PATH` (file path, e.g. `secrets/github-app.pem`),
 * matching shv-codes/zero-ops-autosre/backend/delivery/github_auth.py.
 */
export function loadAppPrivateKey(): string {
  const inline = (process.env.GITHUB_APP_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();
  if (inline) {
    if (!inline.includes("PRIVATE KEY")) {
      throw new GitHubAuthError("GITHUB_APP_PRIVATE_KEY does not look like a PEM private key");
    }
    return inline;
  }
  const keyPath = (process.env.GITHUB_APP_PRIVATE_KEY_PATH || "").trim();
  if (keyPath) {
    const resolved = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
    if (!fs.existsSync(resolved)) {
      throw new GitHubAuthError(`GitHub App private key not found at ${resolved}`);
    }
    const text = fs.readFileSync(resolved, "utf-8");
    if (!text.includes("PRIVATE KEY")) {
      throw new GitHubAuthError(`${resolved} does not look like a PEM private key`);
    }
    return text;
  }
  return "";
}

/** Create a short-lived RS256 JWT for the Syncro / AutoSRE GitHub App (valid 9 minutes). */
function createAppJwt(appId: string, privateKeyPem: string): string {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iat: now - 60, exp: now + 540, iss: appId })}`;
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(privateKeyPem, "base64url");
  return `${unsigned}.${sig}`;
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();
let cachedAppInfo: { id: string; slug: string; name: string; html_url: string } | null = null;
let cachedBotIdentity: { name: string; email: string } | null = null;

async function appJwtFetch(pathOrUrl: string, init: RequestInit = {}): Promise<any> {
  const appId = process.env.GITHUB_APP_ID;
  const key = loadAppPrivateKey();
  if (!appId || !key) {
    throw new GitHubAuthError("GitHub App ID and private key are required (see docs/GITHUB_APP_SETUP.md)");
  }
  const jwt = createAppJwt(appId, key);
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${GH_API}${pathOrUrl}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Syncro-AutoSRE-GitHub-App",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new GitHubAuthError(data?.message || `GitHub App API ${res.status}`);
  }
  return data;
}

/**
 * Ported from AppCredentials.app_info() & describe() in shv-codes/zero-ops-autosre/backend/delivery/github_auth.py.
 */
export async function getAppInfo(): Promise<{ id: string; slug: string; name: string; html_url: string }> {
  if (cachedAppInfo) return cachedAppInfo;
  try {
    const app = await appJwtFetch("/app");
    cachedAppInfo = {
      id: String(app.id),
      slug: app.slug,
      name: app.name,
      html_url: app.html_url,
    };
    return cachedAppInfo;
  } catch (exc: any) {
    throw new GitHubAuthError(`GitHub rejected the App credentials (check App ID and private key): ${exc.message || exc}`);
  }
}

export async function describeGithubApp(): Promise<GitHubAppDescription> {
  const info = await getAppInfo();
  return {
    mode: "app",
    app_slug: info.slug,
    app_name: info.name,
    bot_login: `${info.slug}[bot]`,
    install_url: `https://github.com/apps/${info.slug}/installations/new`,
  };
}

/**
 * Ported from AppCredentials.installation_id() in shv-codes/zero-ops-autosre/backend/delivery/github_auth.py.
 * Discovers the installation ID directly from the repository when not explicitly saved yet.
 */
export async function discoverInstallationId(ref: RepoRef): Promise<number> {
  try {
    const inst = await appJwtFetch(`/repos/${ref.owner}/${ref.repo}/installation`);
    return Number(inst.id);
  } catch (exc: any) {
    throw new GitHubAuthError(
      `the GitHub App is not installed on ${ref.owner}/${ref.repo}; click 'Connect GitHub' and pick that repository (${exc.message || exc})`
    );
  }
}

/**
 * Ported from AppCredentials.verify_installation() in shv-codes/zero-ops-autosre/backend/delivery/github_auth.py.
 * Checks an installation_id from the callback belongs to THIS GitHub App.
 */
export async function verifyAppInstallation(installationId: number | string): Promise<{
  installation_id: number;
  account: string;
  repository_selection: string;
}> {
  const appId = String(process.env.GITHUB_APP_ID || "");
  let inst: any;
  try {
    inst = await appJwtFetch(`/app/installations/${Number(installationId)}`);
  } catch (exc: any) {
    throw new GitHubAuthError(`installation ${installationId} not found for this App: ${exc.message || exc}`);
  }
  if (String(inst.app_id) !== appId) {
    throw new GitHubAuthError("installation belongs to a different GitHub App");
  }
  return {
    installation_id: Number(inst.id),
    account: inst.account?.login || "",
    repository_selection: inst.repository_selection || "",
  };
}

/**
 * Ported from AppCredentials.identity() in shv-codes/zero-ops-autosre/backend/delivery/github_auth.py.
 * Commits are authored by `<slug>[bot]`.
 */
export async function getBotCommitIdentity(): Promise<{ name: string; email: string } | null> {
  if (!process.env.GITHUB_APP_ID) return null;
  if (cachedBotIdentity) return cachedBotIdentity;
  try {
    const info = await getAppInfo();
    const login = `${info.slug}[bot]`;
    let email = `${login}@users.noreply.github.com`;
    try {
      const uRes = await fetch(`${GH_API}/users/${encodeURIComponent(login)}`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "Syncro-AutoSRE-GitHub-App" },
      });
      if (uRes.ok) {
        const u = await uRes.json();
        if (u?.id) email = `${u.id}+${login}@users.noreply.github.com`;
      }
    } catch {
      // use default noreply email
    }
    cachedBotIdentity = { name: login, email };
    return cachedBotIdentity;
  } catch {
    return null;
  }
}

export function getTokenExpiresInSeconds(installationId?: string | number | null): number | null {
  if (!installationId) return null;
  const cached = tokenCache.get(String(installationId));
  if (!cached) return null;
  return Math.max(0, Math.round((cached.expiresAt - Date.now()) / 1000));
}

/**
 * Resolve a short-lived GitHub token for a project:
 *   1. User-supplied token (`X-GitHub-Token` header from browser session or Desktop Git Credential Manager)
 *   2. GitHub App installation token (`AppCredentials` from shv-codes/zero-ops-autosre: JWT -> 1-hour installation token,
 *      down-scoped to REQUIRED_PERMISSIONS, cached & renewed 5 min before expiry; installation auto-discovered from repo)
 *   3. Server `GITHUB_TOKEN` (TokenCredentials fallback)
 *   4. Empty string `""` for public repo read-only `GET` requests when `requireWrite` is false
 */
export async function getInstallationToken(
  project?: any,
  userToken?: string | null,
  requireWrite = false,
  repoOverride?: RepoRef | null
): Promise<string> {
  if (userToken && userToken.trim()) {
    return userToken.trim();
  }

  const appId = process.env.GITHUB_APP_ID;
  let privateKey = "";
  try {
    privateKey = loadAppPrivateKey();
  } catch (err) {
    if (requireWrite && !process.env.GITHUB_TOKEN) throw err;
  }

  if (appId && privateKey) {
    let installationId = String(project?.githubInstallationId || process.env.GITHUB_APP_INSTALLATION_ID || "").trim();
    if (!installationId) {
      const ref = repoOverride || parseGithubRepo(project?.githubRepo);
      if (ref) {
        const discovered = await discoverInstallationId(ref);
        installationId = String(discovered);
      }
    }

    if (installationId) {
      const cached = tokenCache.get(installationId);
      if (cached && cached.expiresAt - Date.now() > RENEW_BEFORE_SECONDS * 1000) {
        return cached.token;
      }

      let data: any;
      try {
        data = await appJwtFetch(`/app/installations/${encodeURIComponent(installationId)}/access_tokens`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: REQUIRED_PERMISSIONS }),
        });
      } catch {
        // Retry with the App's own permissions if down-scoping was rejected (matching github_auth.py lines 121-125)
        data = await appJwtFetch(`/app/installations/${encodeURIComponent(installationId)}/access_tokens`, {
          method: "POST",
        });
      }

      const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 3600_000;
      tokenCache.set(installationId, { token: data.token, expiresAt });
      return data.token;
    }
  }

  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  if (!requireWrite) {
    return "";
  }

  throw new GitHubAuthError(
    "GitHub write access requires authentication. Click 'Connect GitHub' (GitHub App or User Session) or push from Syncro Desktop."
  );
}

/**
 * Ported from github_status() in shv-codes/zero-ops-autosre/backend/incidents/api/github_views.py.
 */
export async function getProjectGitHubStatus(project: any, userToken?: string | null): Promise<GitHubStatus> {
  const ref = parseGithubRepo(project?.githubRepo);
  const repoSlug = ref ? `${ref.owner}/${ref.repo}` : project?.githubRepo || "";
  const hasAppId = Boolean(process.env.GITHUB_APP_ID);
  const hasToken = Boolean(userToken || process.env.GITHUB_TOKEN);
  const authMode: GitHubStatus["auth_mode"] = hasAppId ? "app" : hasToken ? "token" : ref ? "public" : "none";

  const status: GitHubStatus = {
    provider: "github",
    repo: repoSlug,
    auth_mode: authMode,
    connected: false,
    installation_id: project?.githubInstallationId ? Number(project.githubInstallationId) : null,
    account: project?.githubAccount || (ref?.owner ?? ""),
    app: null,
    token_expires_in_seconds: null,
    error: null,
  };

  if (authMode === "token") {
    status.connected = Boolean(repoSlug);
    return status;
  }

  if (authMode === "public") {
    status.connected = Boolean(repoSlug);
    status.error = "Public read-only sync active. Configure GITHUB_APP_ID + private key or authenticate with your GitHub account for bot PRs & merges.";
    return status;
  }

  if (authMode === "none") {
    status.error = "GitHub is not configured (see docs/GITHUB_APP_SETUP.md)";
    return status;
  }

  try {
    status.app = await describeGithubApp();
    if (ref) {
      const instId = status.installation_id || (await discoverInstallationId(ref));
      await getInstallationToken({ ...project, githubInstallationId: String(instId) }, null, true, ref);
      status.installation_id = Number(instId);
      status.connected = true;
      status.token_expires_in_seconds = getTokenExpiresInSeconds(instId);
    }
  } catch (exc: any) {
    status.error = exc?.message || String(exc);
  }

  return status;
}

/** Extract optional per-request user GitHub token from `X-GitHub-Token` header. */
export function extractUserGithubToken(request?: Request | null): string | null {
  if (!request) return null;
  const headerToken = request.headers.get("x-github-token") || request.headers.get("X-GitHub-Token");
  return headerToken && headerToken.trim() ? headerToken.trim() : null;
}

async function ghFetch(
  project: any,
  pathStr: string,
  init: RequestInit = {},
  opts: { userToken?: string | null; requireWrite?: boolean } = {}
): Promise<any> {
  const method = (init.method || "GET").toUpperCase();
  const requireWrite = opts.requireWrite ?? method !== "GET";
  const token = await getInstallationToken(project, opts.userToken, requireWrite);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Syncro-Control-Plane",
    ...(init.headers as Record<string, string> || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${GH_API}${pathStr}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message || `GitHub API ${res.status}`;
    const details = Array.isArray(data?.errors)
      ? data.errors.map((e: any) => e.message || e.code).filter(Boolean).join("; ")
      : "";
    const err = new Error(`GitHub ${init.method || "GET"} ${pathStr} failed (${res.status}): ${msg}${details ? ` — ${details}` : ""}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Find an existing open PR for head branch -> base branch, if one already exists. */
export async function findOpenPullRequest(
  project: any,
  ref: RepoRef,
  headBranch: string,
  baseBranch?: string,
  userToken?: string | null
): Promise<any | null> {
  const q = new URLSearchParams({ state: "open", head: `${ref.owner}:${headBranch}`, per_page: "5" });
  if (baseBranch) q.set("base", baseBranch);
  const list = await ghFetch(project, `/repos/${ref.owner}/${ref.repo}/pulls?${q.toString()}`, {}, { userToken, requireWrite: false });
  return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

/** List real pull requests directly from GitHub (`state=all`) so existing repo PRs are discovered automatically. */
export async function listRepoPullRequests(
  project: any,
  ref: RepoRef,
  userToken?: string | null,
  state: "all" | "open" | "closed" = "all"
): Promise<any[]> {
  const q = new URLSearchParams({ state, sort: "updated", direction: "desc", per_page: "20" });
  const list = await ghFetch(project, `/repos/${ref.owner}/${ref.repo}/pulls?${q.toString()}`, {}, { userToken, requireWrite: false });
  return Array.isArray(list) ? list : [];
}

/** Create a pull request (or return the already-open one for the same branch) and return a full snapshot. */
export async function createOrSyncPullRequest(
  project: any,
  ref: RepoRef,
  opts: { headBranch: string; baseBranch: string; title: string; body: string; draft?: boolean; userToken?: string | null }
): Promise<PullRequestSnapshot> {
  let pr = await findOpenPullRequest(project, ref, opts.headBranch, opts.baseBranch, opts.userToken);
  if (!pr) {
    pr = await ghFetch(
      project,
      `/repos/${ref.owner}/${ref.repo}/pulls`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: opts.title,
          head: opts.headBranch,
          base: opts.baseBranch,
          body: opts.body,
          draft: Boolean(opts.draft),
        }),
      },
      { userToken: opts.userToken, requireWrite: true }
    );
  }
  return syncPullRequest(project, ref, pr.number, opts.userToken);
}

/** Every file a pull request adds, edits, renames, or deletes (both sides of a rename). */
export async function listPullRequestFiles(
  project: any,
  ref: RepoRef,
  prNumber: number,
  userToken?: string | null
): Promise<string[]> {
  const files: string[] = [];
  const seen = new Set<string>();
  const add = (name: unknown) => {
    const n = String(name || "").replace(/\\/g, "/").trim();
    if (!n) return;
    const key = n.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    files.push(n);
  };
  for (let page = 1; page <= 10; page++) {
    const batch = await ghFetch(
      project,
      `/repos/${ref.owner}/${ref.repo}/pulls/${prNumber}/files?per_page=100&page=${page}`,
      {},
      { userToken, requireWrite: false }
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const f of batch) {
      add(f?.filename);
      add(f?.previous_filename);
    }
    if (batch.length < 100) break;
  }
  return files;
}

/** Fetch PR + latest reviews + check-runs for its head SHA and condense into a PullRequestSnapshot. */
export async function syncPullRequest(
  project: any,
  ref: RepoRef,
  prNumber: number,
  userToken?: string | null
): Promise<PullRequestSnapshot> {
  const pr = await ghFetch(project, `/repos/${ref.owner}/${ref.repo}/pulls/${prNumber}`, {}, { userToken, requireWrite: false });
  const headSha: string = pr.head?.sha || "";

  const [reviews, checkRunsResp] = await Promise.all([
    ghFetch(project, `/repos/${ref.owner}/${ref.repo}/pulls/${prNumber}/reviews?per_page=100`, {}, { userToken, requireWrite: false }).catch(() => []),
    headSha
      ? ghFetch(project, `/repos/${ref.owner}/${ref.repo}/commits/${headSha}/check-runs?per_page=50`, {}, { userToken, requireWrite: false }).catch(() => ({ check_runs: [] }))
      : Promise.resolve({ check_runs: [] }),
  ]);

  // Latest decisive review per user wins (GitHub's own rule).
  const latestByUser = new Map<string, string>();
  for (const r of Array.isArray(reviews) ? reviews : []) {
    const login = r?.user?.login;
    const state = String(r?.state || "").toUpperCase();
    if (!login) continue;
    if (state === "APPROVED" || state === "CHANGES_REQUESTED" || state === "DISMISSED") {
      latestByUser.set(login, state);
    }
  }
  let approvals = 0;
  let changesRequested = 0;
  for (const state of latestByUser.values()) {
    if (state === "APPROVED") approvals++;
    if (state === "CHANGES_REQUESTED") changesRequested++;
  }
  const reviewDecision: PullRequestSnapshot["reviewDecision"] =
    changesRequested > 0 ? "changes_requested" : approvals > 0 ? "approved" : "review_required";

  const runs = Array.isArray(checkRunsResp?.check_runs) ? checkRunsResp.check_runs : [];
  const checks: PullRequestCheck[] = runs.slice(0, 25).map((c: any) => ({
    name: String(c.name || "check"),
    status: String(c.status || ""),
    conclusion: String(c.conclusion || ""),
    url: String(c.html_url || c.details_url || ""),
  }));

  const state: PullRequestSnapshot["state"] = pr.merged ? "merged" : pr.state === "closed" ? "closed" : "open";

  let changedFiles: string[] | undefined;
  let changedFilesError = "";
  try {
    changedFiles = await listPullRequestFiles(project, ref, prNumber, userToken);
  } catch (error: any) {
    changedFilesError = String(error?.message || error).slice(0, 300);
  }

  return {
    number: pr.number,
    title: pr.title || "",
    url: pr.html_url,
    state,
    draft: Boolean(pr.draft),
    mergeable: typeof pr.mergeable === "boolean" ? pr.mergeable : null,
    mergeableState: String(pr.mergeable_state || "unknown"),
    headSha,
    headBranch: String(pr.head?.ref || ""),
    baseBranch: String(pr.base?.ref || ""),
    authorLogin: String(pr.user?.login || ""),
    reviewDecision,
    approvals,
    changesRequested,
    checks,
    changedFiles,
    changedFilesError,
    lastSyncedAt: new Date(),
    lastSyncError: "",
  };
}

/** Submit a review (APPROVE or REQUEST_CHANGES) on a pull request. */
export async function reviewPullRequest(
  project: any,
  ref: RepoRef,
  prNumber: number,
  event: "APPROVE" | "REQUEST_CHANGES",
  body?: string,
  userToken?: string | null
) {
  await ghFetch(
    project,
    `/repos/${ref.owner}/${ref.repo}/pulls/${prNumber}/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        body: body || (event === "APPROVE" ? "Approved via Syncro Control Room." : "Changes requested via Syncro Control Room."),
      }),
    },
    { userToken, requireWrite: true }
  );
  return syncPullRequest(project, ref, prNumber, userToken);
}

/** Squash-merge a pull request at a specific verified head SHA. */
export async function mergePullRequest(
  project: any,
  ref: RepoRef,
  prNumber: number,
  opts: { commitTitle: string; sha?: string; method?: "squash" | "merge" | "rebase"; userToken?: string | null }
) {
  await ghFetch(
    project,
    `/repos/${ref.owner}/${ref.repo}/pulls/${prNumber}/merge`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commit_title: opts.commitTitle,
        merge_method: opts.method || "squash",
        ...(opts.sha ? { sha: opts.sha } : {}),
      }),
    },
    { userToken: opts.userToken, requireWrite: true }
  );
  return syncPullRequest(project, ref, prNumber, opts.userToken);
}

/**
 * Evaluate whether a task's PR is safe to merge from the Syncro dashboard.
 * Both Syncro's own verification gate AND GitHub's mergeability/checks must pass,
 * and the verified commit must still be the PR head (no unverified commits pushed after).
 */
export function evaluateMergeGate(task: any): { allowed: boolean; reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const pr: PullRequestSnapshot | undefined = task?.pullRequest;
  if (!pr || !pr.number) return { allowed: false, reasons: ["No pull request is open for this task."], warnings };
  if (pr.state !== "open") return { allowed: false, reasons: [`Pull request #${pr.number} is ${pr.state}.`], warnings };
  if (pr.draft) reasons.push("Pull request is still marked as a draft.");
  if (pr.mergeable === false || pr.mergeableState === "dirty") {
    reasons.push("Pull request has merge conflicts with the base branch.");
  }

  const gate = task?.verificationGate || {};
  const gateStatuses = [gate.buildStatus, gate.testsStatus, gate.sastStatus, gate.contractsStatus].map((s) =>
    String(s || "").toLowerCase()
  );
  const anyFailed = gateStatuses.some((s) => s.startsWith("failed"));
  const buildOrTestPassed =
    gateStatuses[0].startsWith("passed") || gateStatuses[1].startsWith("passed");
  if (anyFailed) reasons.push("One or more Syncro verification gates failed.");
  if (!buildOrTestPassed) reasons.push("Syncro build/test verification has not passed yet.");

  if (task?.latestCommitSha && pr.headSha && task.latestCommitSha !== pr.headSha) {
    reasons.push(
      `New commits were pushed after verification (verified ${task.latestCommitSha.slice(0, 7)}, PR head is ${pr.headSha.slice(0, 7)}). Re-run verification.`
    );
  }

  if (pr.changesRequested > 0) {
    reasons.push(`${pr.changesRequested} reviewer(s) requested changes.`);
  }
  if ((pr.approvals || 0) < 1) {
    reasons.push("A GitHub approval is required before this can merge.");
  }

  const failingChecks = (pr.checks || []).filter(
    (c) => c.status === "completed" && ["failure", "timed_out", "cancelled", "action_required"].includes(c.conclusion)
  );
  const pendingChecks = (pr.checks || []).filter((c) => c.status && c.status !== "completed");
  if (failingChecks.length > 0) {
    reasons.push(`${failingChecks.length} GitHub check(s) failed: ${failingChecks.map((c) => c.name).join(", ")}.`);
  }
  if (pendingChecks.length > 0) {
    reasons.push(`${pendingChecks.length} GitHub check(s) are still running.`);
  }

  const scope = pr.scopeCheck;
  if (!scope?.checked) {
    reasons.push("This pull request's files have not been checked against the task scope. Refresh it and try again.");
  } else if (scope.blocking) {
    const list = Array.isArray(scope.reasons) ? scope.reasons.filter(Boolean) : [];
    reasons.push(...(list.length > 0 ? list : ["This pull request changes files outside the task scope."]));
  } else if (Array.isArray(scope.warnings)) {
    warnings.push(...scope.warnings.filter(Boolean));
  }

  return { allowed: reasons.length === 0, reasons, warnings };
}

/**
 * Task completion follows GitHub. A merged pull request completes the task.
 * An open or closed pull request never leaves the task completed.
 */
export function applyGithubTaskState(task: any): string {
  const pr = task?.pullRequest;
  if (!pr?.number) return "";
  if (pr.state === "merged") {
    task.status = "completed";
    task.progress = 100;
    return `Pull request #${pr.number} is merged on GitHub. The task is completed.`;
  }
  if (task.status === "completed") {
    task.status = "in-progress";
    if (typeof task.progress === "number" && task.progress >= 100) task.progress = 90;
    return `Pull request #${pr.number} is ${pr.state} on GitHub, so the task is in progress again.`;
  }
  return `Pull request #${pr.number} is ${pr.state} on GitHub.`;
}

/** Drop a pull request GitHub does not have, and undo a completion that depended on it. */
export function forgetMissingPullRequest(task: any): string {
  const n = task?.pullRequest?.number;
  task.pullRequest = undefined;
  task.pullRequestUrl = "";
  if (task.status === "completed") {
    task.status = "in-progress";
    if (typeof task.progress === "number" && task.progress >= 100) task.progress = 90;
  }
  return n
    ? `GitHub has no pull request #${n}. The saved pull request was removed.`
    : "The saved pull request was removed.";
}

/** Verify a GitHub X-Hub-Signature-256 header against GITHUB_WEBHOOK_SECRET in constant time. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** True when the verified commit SHA matches the PR head SHA (no unverified pushes since). */
export function verificationFreshness(task: any): "fresh" | "stale" | "unknown" {
  const verifiedSha = task?.latestCommitSha || "";
  const headSha = task?.pullRequest?.headSha || "";
  if (!verifiedSha || !headSha) return "unknown";
  return verifiedSha === headSha ? "fresh" : "stale";
}
