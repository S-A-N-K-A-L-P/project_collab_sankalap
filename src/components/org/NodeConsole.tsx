"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogIn, RefreshCw, ServerOff, ShieldAlert, Wrench } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import { TOP_NAV_HEIGHT } from "@/components/layout/constants";
import { useOrg } from "@/context/OrgContext";
import { toast } from "@/hooks/use-toast";
import {
  consoleTitle, framePathFromShell, frameSrc, HELLO_TIMEOUT_MS, parseFrameMessage, PROBE_TIMEOUT_MS, probeMatches,
  shellUrlForFramePath, stateForPassError, type ConsoleState,
} from "@/lib/nodeConsoleCore";

type Props = {
  slug: string;
  orgName: string;
  nodeId: string | null;
  nodeUrl: string | null;
  hostName: string;
  lastOnlineAt: string | null;
};

const BAR_HEIGHT = 40;
const FRAME_STATES: ConsoleState[] = ["loading", "getting_pass", "online"];

function ago(iso: string | null): string {
  if (!iso) return "a while ago";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `on ${new Date(iso).toLocaleDateString()}`;
}

/**
 * S1 — the org console shell (Syncro.Desktop docs/org-server/admindashboard-syncro.md §3). Probes the org's node from
 * the visitor's browser (Netlify isn't involved), then frames the node's UI and hands it a 60-second sign-in pass.
 * No retry timers: when the node is off it says so, and Retry probes once more.
 */
export default function NodeConsole({ slug, orgName, nodeId, nodeUrl, hostName, lastOnlineAt }: Props) {
  const { status: authStatus } = useSession();
  const { theme } = useTheme();
  const { isAdmin } = useOrg();
  const router = useRouter();

  const [state, setState] = useState<ConsoleState>(!nodeId ? "not_paired" : !nodeUrl ? "offline" : "checking");
  const [reason, setReason] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [probed, setProbed] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const nonceRef = useRef<string | null>(null);
  const passRetried = useRef(false);
  const themeRef = useRef(theme ?? "system");
  themeRef.current = theme ?? "system";
  const nodeOrigin = nodeUrl ? new URL(nodeUrl).origin : null;

  // 1. Probe the node once (§3.3). Retry bumps `attempt`.
  useEffect(() => {
    if (!nodeId) { setState("not_paired"); return; }
    if (!nodeOrigin) { setState("offline"); return; }
    let cancelled = false;
    setState("checking");
    setProbed(false);
    setSrc(null);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
    fetch(nodeOrigin + "/api/health", { mode: "cors", cache: "no-store", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled) return;
        if (probeMatches(body, { nodeId, orgSlug: slug })) setProbed(true);
        else setState("offline");
      })
      .catch(() => { if (!cancelled) setState("offline"); })
      .finally(() => clearTimeout(timer));
    return () => { cancelled = true; ctrl.abort(); clearTimeout(timer); };
  }, [attempt, nodeId, nodeOrigin, slug]);

  // 2. Node answered: signed-out visitors never see node content; members get the frame.
  useEffect(() => {
    if (!probed || authStatus === "loading") return;
    if (authStatus === "unauthenticated") { setState("signed_out"); return; }
    setState("loading");
    setSrc(frameSrc(nodeUrl!, framePathFromShell(slug, window.location.pathname, window.location.search), window.location.origin));
  }, [probed, authStatus, nodeUrl, slug]);

  // 3. The frame has 10 s to say hello (and later to finish signing in).
  useEffect(() => {
    if (state !== "loading" && state !== "getting_pass") return;
    const t = setTimeout(() => { setReason("The org server didn't answer."); setState("error"); }, HELLO_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [state]);

  const post = useCallback((type: string, data: object) => {
    const w = frameRef.current?.contentWindow;
    if (w && nodeOrigin) w.postMessage({ v: 1, type, data }, nodeOrigin); // never "*" (§4.1)
  }, [nodeOrigin]);

  const requestPass = useCallback(async (nonce: string) => {
    setState("getting_pass");
    try {
      const res = await fetch(`/api/orgs/${slug}/node/pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReason(typeof data.message === "string" ? data.message : `${res.status}`);
        setState(stateForPassError(res.status, data.error));
        return;
      }
      post("syncro:pass", { pass: data.pass });
      setState("loading");
    } catch {
      setReason("Couldn't reach S.A.N.K.A.L.P. to sign you in.");
      setState("error");
    }
  }, [post, slug]);

  // 4. Frame messages: only from the node's origin AND our own iframe (§4.1).
  useEffect(() => {
    if (!src || !nodeOrigin) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== nodeOrigin || e.source !== frameRef.current?.contentWindow) return;
      const m = parseFrameMessage(e.data);
      if (!m) return;
      switch (m.type) {
        case "syncro:hello":
          nonceRef.current = m.data.nonce;
          void requestPass(m.data.nonce);
          break;
        case "syncro:ready":
          passRetried.current = false;
          setState("online");
          post("syncro:theme", { mode: themeRef.current });
          break;
        case "syncro:navigate": {
          const url = shellUrlForFramePath(slug, m.data.path);
          if (url !== window.location.pathname + window.location.search)
            window.history[m.data.push ? "pushState" : "replaceState"](null, "", url);
          break;
        }
        case "syncro:title":
          document.title = consoleTitle(m.data.title, orgName);
          break;
        case "syncro:signed-out":
          // expired/revoked: the frame asks again with a fresh hello. Signing out of the node = leaving the console.
          if (m.data.reason === "logout") router.push(`/orgs/${slug}`);
          break;
        case "syncro:offline":
          setState("offline");
          break;
        case "syncro:error":
          if ((m.data.code === "bad_pass" || m.data.code === "pass_replayed") && !passRetried.current && nonceRef.current) {
            passRetried.current = true; // one fresh pass, then the error card (§6 failure table)
            void requestPass(nonceRef.current);
          } else if (m.data.code === "not_member" || m.data.code === "pending" || m.data.code === "suspended") {
            setState(m.data.code);
          } else {
            setReason(m.data.message);
            setState("error");
          }
          break;
        case "syncro:open-external":
          window.open(m.data.url, "_blank", "noopener,noreferrer");
          break;
        case "syncro:toast":
          toast({ title: m.data.text, variant: m.data.kind === "error" ? "destructive" : undefined });
          break;
      }
    };
    const onPop = () => post("syncro:go", { path: framePathFromShell(slug, window.location.pathname, window.location.search) });
    window.addEventListener("message", onMessage);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("popstate", onPop);
    };
  }, [src, nodeOrigin, orgName, post, requestPass, router, slug]);

  // 5. Follow the Showcase theme selector while the console is open.
  useEffect(() => {
    if (state === "online") post("syncro:theme", { mode: theme ?? "system" });
  }, [theme, state, post]);

  const retry = () => { setReason(""); passRetried.current = false; setAttempt((a) => a + 1); };
  const signInHref = `/login?callbackUrl=${encodeURIComponent(`/orgs/${slug}/console`)}`;
  const showFrame = src !== null && FRAME_STATES.includes(state);

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0a0f] text-foreground dark:text-white">
      <TopNav />
      <div style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <div className="flex items-center gap-3 px-4 border-b border-border dark:border-white/8 text-sm" style={{ height: BAR_HEIGHT }}>
          <a href={`/orgs/${slug}`} className="flex items-center gap-1 text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80">
            <ArrowLeft size={14} /> {orgName}
          </a>
          <span className="text-muted-foreground dark:text-white/30">/</span>
          <span className="font-semibold">Console</span>
          <span className={`ml-auto w-2 h-2 rounded-full ${state === "online" ? "bg-emerald-500" : state === "offline" ? "bg-zinc-400" : "bg-amber-400"}`}
                aria-label={state === "online" ? "Connected" : "Not connected"} />
        </div>
        <div className="relative" style={{ height: `calc(100dvh - ${TOP_NAV_HEIGHT + BAR_HEIGHT}px)` }}>
          {showFrame && (
            <iframe
              ref={frameRef}
              title={`${orgName} console`}
              src={src}
              allow="clipboard-write"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              className="block w-full h-full border-0"
              style={{ visibility: state === "online" ? "visible" : "hidden" }}
            />
          )}
          {state !== "online" && (
            <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto">
              {renderCard()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderCard(): ReactNode {
    switch (state) {
      case "not_paired":
        return (
          <Card icon={<Wrench size={20} />} title="This org's console isn't set up yet" body="An org admin can connect Syncro Desktop to run it.">
            {isAdmin && <Btn href={`/orgs/${slug}/admin/node`}>Set up</Btn>}
          </Card>
        );
      case "offline":
        return (
          <Card icon={<ServerOff size={20} />} title="Syncro Desktop is offline"
            body={`${orgName}'s console runs on ${hostName || "the host"}'s computer, which isn't running Syncro right now. Last online ${ago(lastOnlineAt)}. Projects, proposals and the public showcase still work.`}>
            <Btn onClick={retry}><RefreshCw size={14} /> Retry</Btn>
            <Btn href={`/orgs/${slug}#projects`} subtle>View projects</Btn>
          </Card>
        );
      case "signed_out":
        return (
          <Card icon={<LogIn size={20} />} title="Sign in to open the console">
            <Btn href={signInHref}>Sign in</Btn>
          </Card>
        );
      case "not_member":
        return (
          <Card icon={<ShieldAlert size={20} />} title={`This console is for ${orgName} members`} body="You can request to join the org.">
            <Btn href={`/orgs/${slug}`}>Request to join</Btn>
          </Card>
        );
      case "pending":
        return <Card icon={<ShieldAlert size={20} />} title="Your request to join is waiting for approval" />;
      case "suspended":
        return <Card icon={<ShieldAlert size={20} />} title="Your membership is suspended" body="Contact an org admin." />;
      case "error":
        return (
          <Card icon={<ShieldAlert size={20} />} title="The console couldn't start" body={reason || "Something went wrong."}>
            <Btn onClick={retry}><RefreshCw size={14} /> Retry</Btn>
          </Card>
        );
      default: // checking, loading, getting_pass
        return (
          <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-white/60" role="status">
            <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={18} />
            Connecting to {orgName}&apos;s console…
          </div>
        );
    }
  }
}

function Card({ icon, title, body, children }: { icon: ReactNode; title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="w-full max-w-md p-6 rounded-2xl border border-border dark:border-white/8 bg-card dark:bg-white/4 text-center space-y-3">
      <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center bg-muted dark:bg-white/8 text-muted-foreground dark:text-white/60">{icon}</div>
      <h1 className="font-semibold text-lg">{title}</h1>
      {body && <p className="text-sm text-muted-foreground dark:text-white/50">{body}</p>}
      {children && <div className="flex flex-wrap justify-center gap-2 pt-1">{children}</div>}
    </div>
  );
}

function Btn({ href, onClick, subtle, children }: { href?: string; onClick?: () => void; subtle?: boolean; children: ReactNode }) {
  const cls = `inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg ${subtle
    ? "border border-border dark:border-white/10 hover:bg-muted dark:hover:bg-white/8"
    : "bg-primary text-primary-foreground dark:bg-indigo-500 dark:text-white"}`;
  return href ? <a href={href} className={cls}>{children}</a> : <button type="button" onClick={onClick} className={cls}>{children}</button>;
}
