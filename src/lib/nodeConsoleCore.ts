/**
 * Org console shell ↔ node frame protocol (Syncro.Desktop docs/org-server/admindashboard-syncro.md §3–§4).
 * Pure functions only, tested in nodeConsoleCore.test.ts; the React shell is src/components/org/NodeConsole.tsx and the
 * frame side is syncro-git/Syncro.Git.Server/wwwroot/embed.js.
 */

/** Paths the frame and the shell exchange: the node UI's hash route, e.g. "/r/acme/api/tree/main?ref=x". */
// Stricter than the §4.3 schema pattern: a leading "//" is refused (it would read as another host in a URL).
export const CONSOLE_PATH_RE = /^\/(?!\/)[A-Za-z0-9_./?=&%-]{0,300}$/;
export const PROBE_TIMEOUT_MS = 3_000;
export const HELLO_TIMEOUT_MS = 10_000;

export type ConsoleState =
  | "not_paired" | "offline" | "checking" | "signed_out" | "getting_pass" | "loading" | "online"
  | "not_member" | "pending" | "suspended" | "error";

export type FrameMessage =
  | { type: "syncro:hello"; data: { nonce: string } }
  | { type: "syncro:ready"; data: { nodeRole: string; name: string } }
  | { type: "syncro:navigate"; data: { path: string; push: boolean } }
  | { type: "syncro:title"; data: { title: string } }
  | { type: "syncro:signed-out"; data: { reason: "expired" | "revoked" | "removed" | "logout" } }
  | { type: "syncro:offline"; data: { reason: "socket_lost" | "node_shutdown" | "unpaired" } }
  | { type: "syncro:error"; data: { code: "bad_pass" | "pass_replayed" | "not_member" | "pending" | "suspended" | "unhandled"; message: string } }
  | { type: "syncro:open-external"; data: { url: string } }
  | { type: "syncro:toast"; data: { kind: "info" | "success" | "warning" | "error"; text: string } };

const NODE_ROLES = ["node_owner", "node_admin", "manager", "contributor", "member", "observer"];
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && list.includes(v as T);
const str = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

/**
 * Validates a message from the frame against the §4.3 schemas. The caller must already have checked
 * event.origin === node origin AND event.source === iframe.contentWindow. Unknown types and bad data → null.
 */
export function parseFrameMessage(raw: unknown): FrameMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as { v?: unknown; type?: unknown; data?: unknown };
  if (m.v !== 1 || typeof m.type !== "string") return null;
  const d = (m.data && typeof m.data === "object" ? m.data : {}) as Record<string, unknown>;
  switch (m.type) {
    case "syncro:hello":
      return typeof d.nonce === "string" && /^[A-Za-z0-9_-]{22,64}$/.test(d.nonce) ? { type: m.type, data: { nonce: d.nonce } } : null;
    case "syncro:ready":
      return oneOf(NODE_ROLES, d.nodeRole) && str(d.name, 200) ? { type: m.type, data: { nodeRole: d.nodeRole, name: d.name } } : null;
    case "syncro:navigate":
      return typeof d.path === "string" && CONSOLE_PATH_RE.test(d.path)
        ? { type: m.type, data: { path: d.path, push: d.push === true } } : null;
    case "syncro:title":
      return str(d.title, 120) ? { type: m.type, data: { title: d.title } } : null;
    case "syncro:signed-out":
      return oneOf(["expired", "revoked", "removed", "logout"] as const, d.reason) ? { type: m.type, data: { reason: d.reason } } : null;
    case "syncro:offline":
      return oneOf(["socket_lost", "node_shutdown", "unpaired"] as const, d.reason) ? { type: m.type, data: { reason: d.reason } } : null;
    case "syncro:error":
      return oneOf(["bad_pass", "pass_replayed", "not_member", "pending", "suspended", "unhandled"] as const, d.code) && str(d.message, 300)
        ? { type: m.type, data: { code: d.code, message: d.message } } : null;
    case "syncro:open-external":
      return typeof d.url === "string" && /^https:\/\//.test(d.url) && d.url.length <= 2000 ? { type: m.type, data: { url: d.url } } : null;
    case "syncro:toast":
      return oneOf(["info", "success", "warning", "error"] as const, d.kind) && str(d.text, 200)
        ? { type: m.type, data: { kind: d.kind, text: d.text } } : null;
    default:
      return null;
  }
}

/** Shell URL path → frame path: "/orgs/acme/console/r/a/b" + "?ref=x" → "/r/a/b?ref=x". Invalid → "/". */
export function framePathFromShell(slug: string, pathname: string, search: string): string {
  const prefix = `/orgs/${slug}/console`;
  if (!pathname.startsWith(prefix)) return "/";
  const rest = pathname.slice(prefix.length) || "/";
  const path = (rest.startsWith("/") ? rest : "/" + rest) + (search && search !== "?" ? search : "");
  return CONSOLE_PATH_RE.test(path) ? path : "/";
}

/** Frame path → shell URL: "/r/a/b?ref=x" → "/orgs/acme/console/r/a/b?ref=x"; "/" → "/orgs/acme/console". */
export function shellUrlForFramePath(slug: string, path: string): string {
  const safe = CONSOLE_PATH_RE.test(path) ? path : "/";
  return `/orgs/${slug}/console` + (safe === "/" ? "" : safe);
}

/** The frame URL. The node UI uses hash routes, so the frame path travels in the hash. */
export function frameSrc(nodeUrl: string, path: string, showcaseOrigin: string): string {
  const origin = new URL(nodeUrl).origin;
  const safe = CONSOLE_PATH_RE.test(path) ? path : "/";
  return `${origin}/?embed=1&parent=${encodeURIComponent(showcaseOrigin)}#${safe}`;
}

/** §3.3: the probe only counts if it is this org's node — never someone else's site at an old quick-tunnel URL. */
export function probeMatches(body: unknown, expected: { nodeId: string; orgSlug: string }): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as { ok?: unknown; nodeId?: unknown; orgSlug?: unknown };
  return b.ok === true && b.nodeId === expected.nodeId && b.orgSlug === expected.orgSlug;
}

export function consoleTitle(title: string, orgName: string): string {
  return `${title} · ${orgName} · S.A.N.K.A.L.P.`;
}

/** Pass route errors → the card to show (admindashboard-syncro.md §3.4). */
export function stateForPassError(status: number, code: unknown): ConsoleState {
  if (status === 401) return "signed_out";
  if (status === 403 && (code === "not_member" || code === "pending" || code === "suspended")) return code;
  if (status === 404 && code === "not_paired") return "not_paired";
  return "error";
}
