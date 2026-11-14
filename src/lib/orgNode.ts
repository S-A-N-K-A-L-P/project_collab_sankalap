/**
 * Org Node server helpers (DB + request handling). Pure crypto lives in orgNodeCore.ts.
 * Plan: Syncro.Desktop docs/org-server/gitupgrades.md §2, §11, §17; admindashboard-syncro.md §5.
 */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import { decryptSecret, parseSecretKey, verifySignedRequest } from "@/lib/orgNodeCore";

export type OrgNodeDoc = {
  nodeId?: string;
  nodeName?: string;
  secretEnc?: string;
  pairedBy?: unknown;
  url?: string | null;
  features?: string[];
  appVersion?: string;
  lastOnlineAt?: Date | null;
  lastOfflineAt?: Date | null;
  pairing?: { codeHash?: string; createdBy?: unknown; expiresAt?: Date } | null;
};
export type OrgWithNode = { _id: unknown; slug: string; name: string; node?: OrgNodeDoc | null };
export type JsonBody = Record<string, unknown>;

/** Session user id from next-auth (the app stores it on session.user.id). */
export function sessionUserId(session: unknown): string | undefined {
  const id = (session as { user?: { id?: unknown } } | null)?.user?.id;
  return typeof id === "string" ? id : undefined;
}

export function asJsonObject(v: unknown): JsonBody | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as JsonBody) : null;
}

export function nodeError(status: number, error: string, message: string) {
  return NextResponse.json({ error, message }, { status });
}

/** NODE_SECRET_KEY (32 bytes, base64/hex) encrypts every org's node secret at rest. */
export function nodeSecretKey(): Buffer | null {
  return parseSecretKey(process.env.NODE_SECRET_KEY);
}

export function misconfigured() {
  return nodeError(500, "server_misconfigured", "NODE_SECRET_KEY is not set (32 bytes, base64 or hex).");
}

/** True when the user is an ACTIVE org owner/admin. Platform staff get no automatic node rights (roles.md §3.1). */
export async function isOrgNodeAdmin(userId: string | undefined, orgId: unknown): Promise<boolean> {
  if (!userId) return false;
  const m = await OrgMember.findOne({ userId, orgId, status: "active" }).select("role").lean<{ role?: string }>();
  return m?.role === "owner" || m?.role === "admin";
}

export type SignedNodeCall = { org: OrgWithNode & { node: OrgNodeDoc & { nodeId: string } }; secret: string; rawBody: string };

/**
 * Verifies a node → Showcase call (§2.3): X-Syncro-Node must be the org's current node, and X-Syncro-Signature an
 * HMAC over METHOD \n path \n timestamp \n sha256(body) with that node's secret, within ±120 s.
 */
export async function verifyNodeCall(req: Request, slug: string): Promise<SignedNodeCall | NextResponse> {
  const key = nodeSecretKey();
  if (!key) return misconfigured();
  const rawBody = req.method === "GET" || req.method === "HEAD" ? "" : await req.text();
  await dbConnect();
  const org = await Org.findOne({ slug }).select("+node +node.secretEnc").lean<OrgWithNode>();
  if (!org?.node?.nodeId || !org.node.secretEnc) return nodeError(404, "not_paired", "This org has no paired node.");
  if (req.headers.get("x-syncro-node") !== org.node.nodeId) return nodeError(401, "unknown_node", "This node is not the org's paired node.");
  const secret = decryptSecret(org.node.secretEnc, key);
  if (!secret) return nodeError(500, "server_misconfigured", "The stored node secret can't be decrypted (NODE_SECRET_KEY changed?).");
  const check = verifySignedRequest(secret, req.method, new URL(req.url).pathname, {
    timestamp: req.headers.get("x-syncro-timestamp"),
    signature: req.headers.get("x-syncro-signature"),
  }, rawBody);
  if (!check.ok) return nodeError(401, check.error, "Request signature rejected.");
  return { org: org as SignedNodeCall["org"], secret, rawBody };
}

/** Public node status (admindashboard-syncro.md §5.2). Never includes the secret or pairing data. */
export function publicNodeStatus(org: OrgWithNode, hostName?: string) {
  const n = org?.node;
  if (!n?.nodeId) return { paired: false };
  return {
    paired: true,
    nodeId: n.nodeId,
    hostName: hostName ?? "",
    url: n.url ?? null,
    features: n.features ?? [],
    lastOnlineAt: n.lastOnlineAt ?? null,
    lastOfflineAt: n.lastOfflineAt ?? null,
  };
}
