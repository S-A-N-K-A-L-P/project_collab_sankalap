/**
 * Org Node crypto and validation — pure functions, no DB (tested in orgNodeCore.test.ts).
 * Must match syncro-git/Syncro.Git.Core/OrgNode.cs (NodeSigning) byte for byte.
 * Plan: Syncro.Desktop docs/org-server/gitupgrades.md §2, §11, §17.
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/** Crockford-ish alphabet without I, O, 0, 1 (matches ^[A-HJ-NP-Z2-9]{4}-…$). */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const PAIRING_CODE_RE = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
export const NODE_ID_RE = /^node_[a-z0-9]{12}$/;
export const PAIRING_TTL_MS = 10 * 60 * 1000;
export const SIGNATURE_SKEW_S = 120;

export function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function generatePairingCode(): string {
  let raw = "";
  for (let i = 0; i < 12; i++) raw += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
}

/** Accepts "abcd-efgh-jklm" or "ABCDEFGHJKLM"; returns the canonical form or null. */
export function normalizePairingCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let c = input.trim().toUpperCase().replace(/\s+/g, "");
  if (/^[A-Z0-9]{12}$/.test(c)) c = `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}`;
  return PAIRING_CODE_RE.test(c) ? c : null;
}

export function hashPairingCode(code: string): string {
  return createHash("sha256").update("syncro-pairing:" + code).digest("hex");
}

/** 32 random bytes, base64url (43 chars). Returned to the node once. */
export function generateNodeSecret(): string {
  return b64url(randomBytes(32));
}

export function sha256Hex(body: Buffer | string): string {
  return createHash("sha256").update(body).digest("hex");
}

function hmac(nodeSecret: string, message: string): string {
  return b64url(createHmac("sha256", fromB64url(nodeSecret)).update(message, "utf8").digest());
}

/** X-Syncro-Signature: HMAC(secret, METHOD \n path \n timestamp \n sha256hex(body)). */
export function signRequest(nodeSecret: string, method: string, path: string, timestamp: number, body: Buffer | string): string {
  return hmac(nodeSecret, `${method.toUpperCase()}\n${path}\n${timestamp}\n${sha256Hex(body)}`);
}

/** Signature the node returns from GET <url>/api/org/v1/node/attest. */
export function attestSignature(nodeSecret: string, nodeId: string, orgId: string, url: string, nonce: string): string {
  return hmac(nodeSecret, `${nodeId}|${orgId}|${url}|${nonce}`);
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

export type SignatureCheck = { ok: true } | { ok: false; error: string };

export function verifySignedRequest(
  nodeSecret: string,
  method: string,
  path: string,
  headers: { timestamp: string | null; signature: string | null },
  body: Buffer | string,
  nowSeconds = Math.floor(Date.now() / 1000),
): SignatureCheck {
  const ts = Number(headers.timestamp);
  if (!headers.timestamp || !Number.isInteger(ts)) return { ok: false, error: "missing_timestamp" };
  if (Math.abs(nowSeconds - ts) > SIGNATURE_SKEW_S) return { ok: false, error: "stale_timestamp" };
  if (!headers.signature) return { ok: false, error: "missing_signature" };
  const expected = signRequest(nodeSecret, method, path, ts, body);
  return safeEqual(expected, headers.signature) ? { ok: true } : { ok: false, error: "bad_signature" };
}

/** NODE_SECRET_KEY: 32 bytes as base64 / base64url (44/43 chars) or hex (64 chars). */
export function parseSecretKey(raw: string | undefined): Buffer | null {
  if (!raw) return null;
  const v = raw.trim();
  const buf = /^[0-9a-fA-F]{64}$/.test(v) ? Buffer.from(v, "hex") : fromB64url(v);
  return buf.length === 32 ? buf : null;
}

/** AES-256-GCM. Output: v1.<iv>.<tag>.<ciphertext>, all base64url. */
export function encryptSecret(plain: string, key: Buffer): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `v1.${b64url(iv)}.${b64url(c.getAuthTag())}.${b64url(ct)}`;
}

export function decryptSecret(enc: string, key: Buffer): string | null {
  const parts = enc.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  try {
    const d = createDecipheriv("aes-256-gcm", key, fromB64url(parts[1]), { authTagLength: 16 });
    d.setAuthTag(fromB64url(parts[2]));
    return Buffer.concat([d.update(fromB64url(parts[3])), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** §11.1: https only; a trycloudflare quick tunnel or a plain host name. No path, query, port, credentials. */
export function normalizeNodeUrl(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 300) return null;
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  if (u.protocol !== "https:" || u.username || u.password || u.port || u.search || u.hash) return null;
  if (u.pathname !== "/" && u.pathname !== "") return null;
  const host = u.hostname.toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return null;
  // Never let a node point browsers at private/loopback addresses.
  if (host.endsWith(".") || /^(localhost|.*\.localhost|.*\.local|.*\.internal)$/.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
  return `https://${host}`;
}

export const NODE_FEATURES = ["console", "projects", "tasks", "merge-requests", "intelligence", "database-map", "agents", "ci"] as const;

// ── Sign-in pass (roles.md §7.2, admindashboard-syncro.md §5.3) ─────────────────────────────────────────────

export const PASS_TTL_S = 60;
export const PASS_NONCE_RE = /^[A-Za-z0-9_-]{22,64}$/;
export const PLATFORM_ROLES = ["user", "sankalp_member", "sankalp_associate", "platform_moderator", "master_admin"] as const;
export const ORG_ROLES = ["observer", "member", "contributor", "lead", "admin", "owner"] as const;
export const ORG_STATUSES = ["active", "pending", "suspended"] as const;
export const PROJECT_ROLES = ["lead", "architect", "backend", "frontend", "mobile", "sre", "qa", "contributor"] as const;

export type PassSeat = { projectId: string; projectRole: (typeof PROJECT_ROLES)[number]; maxActiveTasks: number };
export type PassClaims = {
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
  nonce: string;
  name: string;
  avatar?: string;
  platformRole: (typeof PLATFORM_ROLES)[number];
  org: { id: string; slug: string; role: (typeof ORG_ROLES)[number] | null; status: (typeof ORG_STATUSES)[number] | null };
  seats: PassSeat[];
};

/**
 * HS256 JWT over the exact JSON text, keyed with the raw 32 bytes of the node secret (same key as signRequest).
 * Verified on the node by Syncro.Git.Server/Node/PassVerifier.cs; both are pinned by one test vector.
 */
export function signPass(claims: PassClaims, nodeSecret: string): string {
  const input = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))) + "." + b64url(Buffer.from(JSON.stringify(claims)));
  return input + "." + b64url(createHmac("sha256", fromB64url(nodeSecret)).update(input, "ascii").digest());
}

const isOneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] => typeof v === "string" && (list as readonly string[]).includes(v);

type ProjectLike = {
  _id: unknown;
  lead?: unknown;
  members?: unknown[];
  teamRoster?: { userId?: unknown; projectRole?: unknown; maxActiveTasks?: unknown }[];
};

/** Seats for one user across an org's projects: teamRoster first, then lead, then plain members (max 50). */
export function seatsFor(projects: ProjectLike[], userId: string): PassSeat[] {
  const seats: PassSeat[] = [];
  for (const p of projects) {
    if (seats.length >= 50) break;
    const roster = (p.teamRoster ?? []).find((t) => String(t.userId) === userId);
    let role: PassSeat["projectRole"] | null = null;
    let max = 5;
    if (roster) {
      role = isOneOf(PROJECT_ROLES, roster.projectRole) ? roster.projectRole : "contributor";
      if (typeof roster.maxActiveTasks === "number" && Number.isInteger(roster.maxActiveTasks)) max = Math.min(50, Math.max(0, roster.maxActiveTasks));
    } else if (String(p.lead) === userId) {
      role = "lead";
    } else if ((p.members ?? []).some((m) => String(m) === userId)) {
      role = "contributor";
    }
    if (role) seats.push({ projectId: String(p._id), projectRole: role, maxActiveTasks: max });
  }
  return seats;
}

/** Builds pass claims. Unknown enum values fall back to the least-privileged value; never email/phone/tokens. */
export function buildPassClaims(input: {
  issuer: string;
  orgId: string;
  orgSlug: string;
  userId: string;
  name: string;
  avatar?: string | null;
  platformRole: unknown;
  membership: { role?: unknown; status?: unknown } | null;
  seats: PassSeat[];
  nonce: string;
  now: number;
  jti: string;
}): PassClaims {
  const avatar = input.avatar && input.avatar.length <= 500 ? input.avatar : undefined;
  // Keys in schema order (the shared test vector depends on JSON.stringify keeping insertion order).
  return {
    iss: input.issuer.replace(/\/+$/, ""),
    aud: `org-node:${input.orgId}`,
    sub: input.userId,
    iat: input.now,
    exp: input.now + PASS_TTL_S,
    jti: input.jti,
    nonce: input.nonce,
    name: (input.name || "").slice(0, 120),
    ...(avatar ? { avatar } : {}),
    platformRole: isOneOf(PLATFORM_ROLES, input.platformRole) ? input.platformRole : "user",
    org: {
      id: input.orgId,
      slug: input.orgSlug,
      role: input.membership && isOneOf(ORG_ROLES, input.membership.role) ? input.membership.role : null,
      status: input.membership && isOneOf(ORG_STATUSES, input.membership.status) ? input.membership.status : null,
    },
    seats: input.seats.slice(0, 50),
  };
}
