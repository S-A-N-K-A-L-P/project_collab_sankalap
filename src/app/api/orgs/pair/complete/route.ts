import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import { asJsonObject, isOrgNodeAdmin, misconfigured, nodeError, nodeSecretKey, type OrgWithNode } from "@/lib/orgNode";
import { encryptSecret, generateNodeSecret, hashPairingCode, NODE_ID_RE, normalizePairingCode } from "@/lib/orgNodeCore";

const SHOWCASE_ORIGIN = (process.env.SHOWCASE_ORIGIN || process.env.NEXTAUTH_URL || "https://project-syncroo.netlify.app").replace(/\/+$/, "");

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length > 0 && v.length <= max ? v : null;
}

/**
 * POST /api/orgs/pair/complete — called by Syncro Desktop / `syncro org pair` (gitupgrades.md §2.2).
 * Redeems a pairing code once and returns the node secret ONCE. Re-pairing replaces the old node.
 */
export async function POST(req: Request) {
  const key = nodeSecretKey();
  if (!key) return misconfigured();

  let body: Record<string, unknown> | null = null;
  try { body = asJsonObject(await req.json()); } catch { /* handled below */ }
  if (!body) return nodeError(400, "bad_input", "Body must be a JSON object.");
  const code = normalizePairingCode(body.code);
  const nodeId = str(body.nodeId, 40);
  const nodeName = str(body.nodeName, 80);
  const appVersion = str(body.appVersion, 40);
  const os = str(body.os, 60);
  if (!code) return nodeError(400, "bad_code", "That pairing code isn't valid.");
  if (!nodeId || !NODE_ID_RE.test(nodeId) || !nodeName || !appVersion || !os)
    return nodeError(400, "bad_input", "nodeId, nodeName, appVersion and os are required.");

  await dbConnect();
  const org = await Org.findOne({ "node.pairing.codeHash": hashPairingCode(code) }).select("+node +node.pairing.codeHash").lean<OrgWithNode>();
  const pairing = org?.node?.pairing;
  if (!org || !pairing) return nodeError(400, "bad_code", "That pairing code isn't valid.");
  if (!pairing.expiresAt || new Date(pairing.expiresAt).getTime() < Date.now()) {
    await Org.updateOne({ _id: org._id }, { $set: { "node.pairing": null } });
    return nodeError(410, "code_expired", "That pairing code has expired. Generate a new one.");
  }
  if (!(await isOrgNodeAdmin(String(pairing.createdBy), org._id)))
    return nodeError(403, "forbidden", "Whoever created this code is no longer an org owner or admin.");

  const secret = generateNodeSecret();
  const now = new Date();
  // Single use: the filter includes the code hash, so two PCs redeeming at once can't both win.
  const res = await Org.updateOne(
    { _id: org._id, "node.pairing.codeHash": hashPairingCode(code) },
    {
      $set: {
        node: {
          nodeId, nodeName, appVersion, os,
          secretEnc: encryptSecret(secret, key),
          pairedBy: pairing.createdBy,
          pairedAt: now,
          url: null,
          features: [],
          lastOnlineAt: null,
          lastOfflineAt: org.node?.url ? now : (org.node?.lastOfflineAt ?? null),
          pairing: null,
        },
      },
    },
  );
  if (res.modifiedCount !== 1) return nodeError(400, "bad_code", "That pairing code was already used.");

  return NextResponse.json({
    orgId: String(org._id),
    orgSlug: org.slug,
    orgName: org.name,
    ownerUserId: String(pairing.createdBy),
    nodeSecret: secret,
    showcaseOrigin: SHOWCASE_ORIGIN,
  });
}
