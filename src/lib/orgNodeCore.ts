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
