/**
 * Minimal GitHub REST client for repo stats. Uses GITHUB_TOKEN when set (needed for private repos
 * and a higher rate limit); public repos work without it (60 requests/hour per server IP).
 * Never invents numbers: on any failure the caller gets ok=false and the reason.
 */

export interface RepoRef {
  owner: string;
  repo: string;
}

export interface GithubCommit {
  sha: string;
  message: string;
  author: string;
  date: Date | null;
  url: string;
}

export interface GithubRepoSnapshot {
  ok: boolean;
  error?: string;
  defaultBranch?: string;
  branches?: string[];
  stats?: {
    commits: number;
    stars: number;
    forks: number;
    issues: number;
    pullRequests: number;
    contributorsCount: number;
    lastCommitMessage: string;
  };
  commits?: GithubCommit[];
}

/** Accepts https://github.com/o/r(.git), git@github.com:o/r.git, github.com/o/r/tree/x … Repo names may contain dots. */
export function parseGithubUrl(url: string | undefined | null): RepoRef | null {
  if (!url) return null;
  const m = url.trim().match(/github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:[/#?].*)?$/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function gh(path: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Syncro-Platform",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers, cache: "no-store" });
}

/** Count of items behind a paginated endpoint, read from the Link header with per_page=1. */
async function countVia(path: string): Promise<number> {
  const res = await gh(path + (path.includes("?") ? "&" : "?") + "per_page=1");
  if (!res.ok) return 0;
  const link = res.headers.get("link") || "";
  const last = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  if (last) return Number(last[1]);
  const body = await res.json().catch(() => []);
  return Array.isArray(body) ? body.length : 0;
}

function explain(status: number, body: any): string {
  if (status === 404) return "Repository not found (or it's private and GITHUB_TOKEN isn't set on the server).";
  if (status === 401) return "GitHub rejected the server token (GITHUB_TOKEN).";
  if (status === 403 && /rate limit/i.test(body?.message || "")) return "GitHub API rate limit reached. Set GITHUB_TOKEN or try later.";
  return `GitHub API error ${status}${body?.message ? `: ${body.message}` : ""}`;
}

export async function fetchRepoSnapshot(ref: RepoRef): Promise<GithubRepoSnapshot> {
  try {
    const base = `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}`;
    const repoRes = await gh(base);
    if (!repoRes.ok) return { ok: false, error: explain(repoRes.status, await repoRes.json().catch(() => null)) };
    const repo = await repoRes.json();
    const defaultBranch: string = repo.default_branch || "main";

    const [commitsRes, branchesRes, commitCount, openPrs, contributors] = await Promise.all([
      gh(`${base}/commits?sha=${encodeURIComponent(defaultBranch)}&per_page=10`),
      gh(`${base}/branches?per_page=100`),
      countVia(`${base}/commits?sha=${encodeURIComponent(defaultBranch)}`),
      countVia(`${base}/pulls?state=open`),
      countVia(`${base}/contributors?anon=1`),
    ]);

    const commitsJson = commitsRes.ok ? await commitsRes.json() : [];
    const commits: GithubCommit[] = (Array.isArray(commitsJson) ? commitsJson : []).map((c: any) => ({
      sha: c.sha,
      message: (c.commit?.message || "").split("\n")[0],
      author: c.commit?.author?.name || c.author?.login || "",
      date: c.commit?.author?.date ? new Date(c.commit.author.date) : null,
      url: c.html_url || "",
    }));
    const branchesJson = branchesRes.ok ? await branchesRes.json() : [];
    const branches: string[] = (Array.isArray(branchesJson) ? branchesJson : []).map((b: any) => b.name).filter(Boolean);

    return {
      ok: true,
      defaultBranch,
      branches: branches.length ? branches : [defaultBranch],
      stats: {
        commits: commitCount,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        // GitHub's open_issues_count includes PRs; report issues without them.
        issues: Math.max(0, (repo.open_issues_count ?? 0) - openPrs),
        pullRequests: openPrs,
        contributorsCount: contributors,
        lastCommitMessage: commits[0]?.message || "",
      },
      commits,
    };
  } catch (e: any) {
    return { ok: false, error: `Could not reach GitHub: ${e?.message || e}` };
  }
}

/** Applies a snapshot to a GitRepo document (call save() afterwards). */
export function applySnapshot(doc: any, snap: GithubRepoSnapshot): void {
  doc.lastSyncAt = new Date();
  if (!snap.ok) {
    doc.syncStatus = "failed";
    doc.syncError = snap.error || "Unknown error";
    return;
  }
  doc.syncStatus = "verified";
  doc.syncError = "";
  doc.defaultBranch = snap.defaultBranch;
  if (snap.branches?.length) doc.branches = snap.branches;
  doc.stats = snap.stats;
  doc.commits = snap.commits;
}
