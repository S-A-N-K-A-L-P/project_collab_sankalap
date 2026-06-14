/** Shared handle validation + reserved list for portfolios. */

export const RESERVED_HANDLES = new Set([
  "admin", "api", "portfolio", "login", "register", "feed", "orgs", "org",
  "showcase", "marketplace", "settings", "me", "new", "null", "undefined",
  "dashboard", "profile", "ideas", "tasks", "discover", "notifications",
  "my-completed", "unauthorized", "project_tracker", "projects",
]);

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/; // 3–30, a-z0-9-, no leading/trailing dash

export function normalizeHandle(raw: string): string {
  return (raw || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function validateHandle(raw: string): { ok: boolean; error?: string; handle?: string } {
  const handle = normalizeHandle(raw);
  if (handle.length < 3 || handle.length > 30) return { ok: false, error: "Handle must be 3–30 characters." };
  if (!HANDLE_RE.test(handle)) return { ok: false, error: "Use lowercase letters, numbers, and hyphens (no leading/trailing hyphen)." };
  if (RESERVED_HANDLES.has(handle)) return { ok: false, error: "That handle is reserved." };
  return { ok: true, handle };
}

/** Suggest a handle from a display name + short random suffix. */
export function suggestHandle(name: string): string {
  const base = normalizeHandle(name).slice(0, 22) || "builder";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`.slice(0, 30);
}
