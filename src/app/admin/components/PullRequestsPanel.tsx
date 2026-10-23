"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- API payloads are runtime-shaped. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  GitPullRequest,
  Github,
  KeyRound,
  Link2,
  Loader2,
  LogOut,
  RefreshCw,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  ago,
  buildGithubHeaders,
  getUserGithubLogin,
  getUserGithubToken,
  setUserGithubSession,
  type Gate,
  type PRSnapshot,
} from "@/app/admin/components/project/pipeline";
import { GateDots, LiveDot, Pill } from "@/app/admin/components/project/ui";
import { PullRequestDetail } from "@/app/admin/components/project/TaskDrawer";

interface Item {
  taskId: string;
  title: string;
  assignedToName: string;
  targetBranch: string;
  baseBranch: string;
  latestCommitSha: string;
  verificationGate: Gate;
  pullRequest: PRSnapshot;
  verification: "fresh" | "stale" | "unknown";
  mergeGate: { allowed: boolean; reasons: string[] };
}
interface Payload {
  configured: boolean;
  githubMode: "app" | "token" | "user-token" | "public" | "none";
  githubRepo: string;
  githubInstallationId: string;
  githubLastWebhookAt: string | null;
  pullRequests: Item[];
}
interface GitHubStatus {
  provider: "local" | "github";
  repo: string;
  auth_mode: "app" | "token" | "public" | "none";
  connected: boolean;
  installation_id: number | null;
  account: string;
  app: { mode: "app"; app_slug: string; app_name: string; bot_login: string; install_url: string } | null;
  token_expires_in_seconds: number | null;
  error: string | null;
}

type Col = "checks" | "review" | "changes" | "ready" | "done";
const COLS: { id: Col; label: string; accent: string }[] = [
  { id: "checks", label: "Checks running", accent: "border-t-sky-500" },
  { id: "review", label: "Needs review", accent: "border-t-violet-500" },
  { id: "changes", label: "Changes / blocked", accent: "border-t-amber-500" },
  { id: "ready", label: "Merge ready", accent: "border-t-emerald-500" },
  { id: "done", label: "Merged / closed", accent: "border-t-zinc-400" },
];

function column(i: Item): Col {
  const pr = i.pullRequest;
  if (pr.state === "merged" || pr.state === "closed") return "done";
  if (i.mergeGate.allowed) return "ready";
  if (pr.reviewDecision === "changes_requested" || i.verification === "stale" || pr.mergeable === false) return "changes";
  if ((pr.checks || []).some((c) => c.status !== "completed")) return "checks";
  return "review";
}

const toDetail = (i: Item) => ({
  _id: i.taskId,
  title: i.title,
  latestCommitSha: i.latestCommitSha,
  verificationGate: i.verificationGate,
  pullRequest: i.pullRequest,
  verification: i.verification,
  mergeGate: i.mergeGate,
});

export default function PullRequestsPanel({ projectId }: { projectId: string; repo?: string; installationId?: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [ghStatus, setGhStatus] = useState<GitHubStatus | null>(null);
  const [error, setError] = useState("");
  const [callbackBanner, setCallbackBanner] = useState<{ kind: "connected" | "error"; text: string } | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [showConn, setShowConn] = useState(false);
  const [install, setInstall] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // User-managed GitHub session state
  const [ghLogin, setGhLogin] = useState<string>("");
  const [hasGhToken, setHasGhToken] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [deviceState, setDeviceState] = useState<{
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    interval: number;
  } | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ported from Dashboard.tsx in shv-codes/zero-ops-autosre:
  // Coming back from GitHub's install page: ?github=connected | ?github=error&reason=...
  useEffect(() => {
    setGhLogin(getUserGithubLogin());
    setHasGhToken(Boolean(getUserGithubToken()));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const result = params.get("github");
      if (result === "connected") {
        setCallbackBanner({
          kind: "connected",
          text: "GitHub connected — Syncro can now open pull requests as its bot.",
        });
        window.history.replaceState({}, "", window.location.pathname);
      } else if (result === "error") {
        setCallbackBanner({
          kind: "error",
          text: params.get("reason") || "GitHub connection failed",
        });
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const loadStatus = useCallback(async () => {
    const res = await fetch(`/api/github/status?projectId=${encodeURIComponent(projectId)}`, {
      cache: "no-store",
      headers: buildGithubHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body?.data) {
      setGhStatus(body.data);
    }
  }, [projectId]);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setSyncing(true);
      try {
        const [res] = await Promise.all([
          fetch(`/api/admin/projects/${projectId}/pull-requests${refresh ? "?refresh=1" : ""}`, {
            cache: "no-store",
            headers: buildGithubHeaders(),
          }),
          loadStatus(),
        ]);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error || "Could not load pull requests");
          return;
        }
        setError("");
        setData(body);
        setUpdatedAt(Date.now());
        setInstall((v) => v || body.githubInstallationId || "");
      } finally {
        if (refresh) setSyncing(false);
      }
    },
    [projectId, loadStatus]
  );

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 20_000);
    return () => clearInterval(t);
  }, [load]);

  const grouped = useMemo(() => {
    const m = new Map<Col, Item[]>(COLS.map((c) => [c.id, []]));
    for (const i of data?.pullRequests || []) m.get(column(i))!.push(i);
    return m;
  }, [data]);

  const saveInstallation = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubInstallationId: install }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save GitHub installation");
      await load(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const disconnectGithubApp = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/github/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not disconnect GitHub App");
      if (body?.data?.note) {
        setCallbackBanner({ kind: "connected", text: body.data.note });
      }
      setInstall("");
      await load(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startDeviceFlow = async () => {
    setAuthBusy(true);
    setError("");
    try {
      const res = await fetch("/api/github/device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not start GitHub Device Flow");

      setDeviceState({
        deviceCode: d.deviceCode,
        userCode: d.userCode,
        verificationUri: d.verificationUri || "https://github.com/login/device",
        interval: d.interval || 5,
      });

      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(async () => {
        try {
          const pRes = await fetch("/api/github/device", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "poll", deviceCode: d.deviceCode }),
          });
          const pData = await pRes.json().catch(() => ({}));
          if (pData.status === "authorized" && pData.accessToken) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            const login = pData.user?.login || "github-user";
            setUserGithubSession(pData.accessToken, login);
            setGhLogin(login);
            setHasGhToken(true);
            setDeviceState(null);
            setShowConn(false);
            await load(true);
          } else if (pData.status === "error") {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setError(pData.error || "GitHub authorization expired");
            setDeviceState(null);
          }
        } catch {
          // continue polling
        }
      }, Math.max(5, d.interval || 5) * 1000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const verifyManualToken = async () => {
    if (!manualToken.trim()) return;
    setAuthBusy(true);
    setError("");
    try {
      const res = await fetch("/api/github/device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-token", token: manualToken.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Invalid GitHub token");
      const login = d.user?.login || "github-user";
      setUserGithubSession(manualToken.trim(), login);
      setGhLogin(login);
      setHasGhToken(true);
      setManualToken("");
      setShowConn(false);
      await load(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const signOutGithub = async () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setUserGithubSession("");
    setGhLogin("");
    setHasGhToken(false);
    setDeviceState(null);
    await load(false);
  };

  if (!data)
    return (
      <div className="flex h-40 items-center justify-center">
        {error ? <p className="text-[12px] text-red-500">{error}</p> : <Loader2 className="w-5 h-5 animate-spin text-accent" />}
      </div>
    );

  const current = data.pullRequests.find((i) => i.taskId === open);
  const counts = {
    open: data.pullRequests.filter((i) => i.pullRequest.state === "open").length,
    merged: data.pullRequests.filter((i) => i.pullRequest.state === "merged").length,
    ready: grouped.get("ready")!.length,
  };

  const modeLabel =
    ghStatus?.auth_mode === "app" && ghStatus.connected
      ? `GitHub App (${ghStatus.app?.bot_login || "bot"})`
      : hasGhToken
      ? `Authenticated (${ghLogin || "User"})`
      : data.githubMode === "public"
      ? "Public Repo Live Sync"
      : data.githubMode === "app"
      ? "GitHub App"
      : data.githubMode === "token"
      ? "Token"
      : "Not connected";

  return (
    <div className="space-y-4">
      {callbackBanner && (
        <div
          className={`rounded-2xl border px-4 py-3 flex items-center justify-between text-[12px] ${
            callbackBanner.kind === "connected"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <span>{callbackBanner.text}</span>
          <button onClick={() => setCallbackBanner(null)} className="p-1 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Connection bar */}
      <div className="bg-surface border border-border-subtle rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3">
        <Github className="w-4 h-4 text-foreground" />
        <a
          href={data.githubRepo || "#"}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] font-bold text-foreground hover:text-accent truncate max-w-[300px] flex items-center gap-1"
        >
          {data.githubRepo || "No repository linked"}
          {data.githubRepo && <ExternalLink className="w-3 h-3 text-muted" />}
        </a>
        <Pill cls={data.configured || hasGhToken ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}>
          {modeLabel}
        </Pill>
        {ghStatus?.token_expires_in_seconds !== null && ghStatus?.token_expires_in_seconds !== undefined && (
          <span className="text-[10px] font-mono text-emerald-500">
            token renews automatically (expires in {Math.round(ghStatus.token_expires_in_seconds / 60)} min)
          </span>
        )}
        <span className="text-[10px] font-mono text-muted">
          · {counts.open} open · {counts.merged} merged · {counts.ready} merge-ready
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <LiveDot updatedAt={updatedAt} />
          <button
            onClick={() => load(true)}
            disabled={syncing}
            className="px-3 py-1.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50"
            title="Fetch real pull requests, commits & checks directly from api.github.com"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing GitHub…" : "Sync from GitHub"}
          </button>
          {ghStatus?.auth_mode === "app" && !ghStatus.connected && (
            <a
              href={`/api/github/connect?projectId=${encodeURIComponent(projectId)}`}
              className="px-3 py-1.5 rounded-xl bg-foreground text-background hover:opacity-90 text-[11px] font-bold flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              Connect GitHub
            </a>
          )}
          {hasGhToken && (
            <button
              onClick={signOutGithub}
              className="px-2.5 py-1.5 rounded-xl bg-surface border border-border-subtle text-[11px] text-muted hover:text-red-500 flex items-center gap-1"
              title="Disconnect session GitHub auth"
            >
              <LogOut className="w-3.5 h-3.5" />
              {ghLogin || "Sign out"}
            </button>
          )}
          <button
            onClick={() => setShowConn((v) => !v)}
            className="p-1.5 rounded-lg text-muted hover:text-accent"
            title="GitHub App & Authentication Controls"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </span>
      </div>

      {showConn && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
          {/* Section 1: AutoSRE GitHub App Connect Flow (ported from DemoControlSheet.tsx in shv-codes/zero-ops-autosre) */}
          <div className="rounded-xl border border-border-subtle bg-background/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Github className="w-4 h-4 text-accent" />
                GitHub App Connection (AutoSRE Bot Identity · 1-Hour Auto-Renewing Tokens)
              </p>
              <button onClick={() => setShowConn(false)} className="p-1 text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ghStatus?.connected && ghStatus.auth_mode === "app" ? (
              <div className="text-[12px] text-muted space-y-1.5">
                <p className="text-emerald-400 font-semibold">
                  Connected to <span className="font-mono">{ghStatus.repo}</span>
                  {ghStatus.app ? ` as ${ghStatus.app.bot_login}` : " (personal token)"}
                  {ghStatus.account ? ` · account: ${ghStatus.account}` : ""}
                </p>
                {ghStatus.token_expires_in_seconds !== null && (
                  <p className="text-[11px]">
                    Current installation token (#{ghStatus.installation_id}) renews automatically (expires in{" "}
                    {Math.round(ghStatus.token_expires_in_seconds / 60)} min). Down-scoped to{" "}
                    <code className="font-mono text-foreground">contents:write, pull_requests:write, checks:read, statuses:read</code>.
                  </p>
                )}
                <button
                  onClick={disconnectGithubApp}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle text-[11px] font-bold text-foreground hover:border-red-500/50 hover:text-red-500"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ghStatus?.error && <p className="text-[11px] text-amber-400">{ghStatus.error}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/github/connect?projectId=${encodeURIComponent(projectId)}`}
                    className="px-4 py-2 rounded-xl bg-foreground text-background text-[12px] font-bold inline-flex items-center gap-2 hover:opacity-90"
                  >
                    <Github className="w-4 h-4" />
                    Connect GitHub App
                  </a>
                  <input
                    value={install}
                    onChange={(e) => setInstall(e.target.value.replace(/\D/g, ""))}
                    placeholder="Or enter GitHub App installation ID"
                    className="flex-1 min-w-[220px] px-3 py-2 bg-background border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50"
                  />
                  <button
                    onClick={saveInstallation}
                    disabled={busy || !install}
                    className="px-4 py-2 rounded-xl bg-accent text-white text-[11px] font-bold disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save Installation ID"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: User-Level On-Demand Authentication Fallback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border-subtle bg-background/50 p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Browser Device Login (User Account Fallback)
              </p>
              <p className="text-[11px] text-muted">
                Authorize in your browser at <code className="font-mono text-foreground">github.com/login/device</code> using an 8-digit
                one-time code without needing server PEM keys.
              </p>
              {!deviceState ? (
                <button
                  onClick={startDeviceFlow}
                  disabled={authBusy}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-[11px] font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {authBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                  Start GitHub Device Login
                </button>
              ) : (
                <div className="rounded-xl border border-accent/40 bg-accent/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-muted">Your 8-digit GitHub code:</span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(deviceState.userCode)}
                      className="text-[10px] text-accent hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy code
                    </button>
                  </div>
                  <p className="text-[20px] font-mono font-black tracking-widest text-foreground">{deviceState.userCode}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={deviceState.verificationUri}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-accent text-white text-[11px] font-bold flex items-center gap-1.5"
                    >
                      Open github.com/login/device <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-accent" /> Waiting for approval…
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-subtle bg-background/50 p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-violet-500" />
                TokenCredentials Fallback (Session Token)
              </p>
              <p className="text-[11px] text-muted">
                Paste a personal access token or <code className="font-mono text-foreground">gh auth token</code> output for this session.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="gho_... or github_pat_..."
                  className="flex-1 px-3 py-2 bg-background border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50"
                />
                <button
                  onClick={verifyManualToken}
                  disabled={authBusy || !manualToken.trim()}
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-[11px] font-bold disabled:opacity-50"
                >
                  {authBusy ? "Verifying…" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      {data.pullRequests.length === 0 ? (
        <div className="bg-surface border border-border-subtle rounded-2xl px-5 py-12 text-center text-[12px] text-muted space-y-3">
          <GitPullRequest className="w-6 h-6 mx-auto text-muted" />
          <p>No pull requests synced yet for this repository.</p>
          <button
            onClick={() => load(true)}
            disabled={syncing}
            className="mx-auto px-4 py-2 rounded-xl bg-accent text-white text-[11px] font-bold inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync Real Pull Requests from GitHub
          </button>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLS.map((c) => {
            const items = grouped.get(c.id) || [];
            return (
              <div
                key={c.id}
                className={`w-[270px] flex-shrink-0 bg-background/60 border border-border-subtle border-t-2 ${c.accent} rounded-2xl flex flex-col max-h-[72vh]`}
              >
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">{c.label}</p>
                  <span className="text-[10px] font-mono text-muted bg-surface border border-border-subtle rounded-md px-1.5">
                    {items.length}
                  </span>
                </div>
                <div className="px-2 pb-2 space-y-2 overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-[10px] text-muted text-center py-4">None</p>
                  ) : (
                    items.map((i) => {
                      const pr = i.pullRequest;
                      const pending = (pr.checks || []).filter((x) => x.status !== "completed").length;
                      const failed = (pr.checks || []).filter((x) =>
                        ["failure", "timed_out", "cancelled", "action_required"].includes(x.conclusion)
                      ).length;
                      return (
                        <button
                          key={i.taskId}
                          onClick={() => setOpen(i.taskId)}
                          className="w-full text-left bg-surface border border-border-subtle rounded-xl p-3 space-y-2 hover:border-accent/50 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-2">
                            <GitPullRequest
                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                pr.state === "merged" ? "text-emerald-500" : "text-violet-500"
                              }`}
                            />
                            <p className="text-[12px] font-bold text-foreground leading-snug line-clamp-2">
                              #{pr.number} {i.title}
                            </p>
                          </div>
                          <p className="text-[10px] font-mono text-muted truncate">
                            {i.assignedToName} · {i.targetBranch} → {i.baseBranch}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-mono text-muted">SYNCRO</span>
                            <GateDots gate={i.verificationGate} />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <Pill
                              cls={
                                failed
                                  ? "bg-red-500/10 text-red-500"
                                  : pending
                                  ? "bg-sky-500/10 text-sky-500"
                                  : "bg-emerald-500/10 text-emerald-500"
                              }
                            >
                              {failed ? `${failed} check(s) failed` : pending ? `${pending} running` : `${pr.checks.length} checks ✓`}
                            </Pill>
                            <Pill
                              cls={
                                pr.reviewDecision === "changes_requested"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : pr.approvals
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-zinc-500/10 text-zinc-400"
                              }
                            >
                              {pr.reviewDecision === "changes_requested" ? "changes req." : `${pr.approvals} approval(s)`}
                            </Pill>
                            {pr.mergeable === false && <Pill cls="bg-red-500/10 text-red-500">conflicts</Pill>}
                          </div>
                          <p
                            className={`text-[10px] font-bold flex items-center gap-1 ${
                              i.verification === "fresh" ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {i.verification === "fresh" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {i.verification === "fresh"
                              ? "Verified = head"
                              : i.verification === "stale"
                              ? "Stale verification"
                              : "No verified SHA"}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(null)} />
          <aside className="relative w-full max-w-[600px] h-full bg-surface border-l border-border-subtle shadow-2xl flex flex-col">
            <header className="px-6 py-4 border-b border-border-subtle flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-foreground">{current.title}</p>
                <p className="text-[11px] font-mono text-muted flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  {current.assignedToName} · {current.targetBranch} → {current.baseBranch}
                </p>
              </div>
              <button onClick={() => setOpen(null)} className="p-1.5 rounded-lg text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <PullRequestDetail projectId={projectId} task={toDetail(current)} onChanged={() => load()} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
