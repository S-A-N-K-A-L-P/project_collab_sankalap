import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import { isOrgNodeAdmin, misconfigured, nodeError, nodeSecretKey, sessionUserId, type OrgWithNode } from "@/lib/orgNode";
import { generatePairingCode, hashPairingCode, PAIRING_TTL_MS } from "@/lib/orgNodeCore";

/**
 * POST /api/orgs/[slug]/node/pairing-code — org owner/admin gets a 10-minute code to paste into
 * Syncro Desktop (Org server → Pair) or `syncro org pair <code>`. Only the hash is stored.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!nodeSecretKey()) return misconfigured();
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return nodeError(401, "unauthenticated", "Sign in first.");

  const { slug } = await params;
  await dbConnect();
  const org = await Org.findOne({ slug }).select("_id node.nodeId node.nodeName").lean<OrgWithNode>();
  if (!org) return nodeError(404, "not_found", "Organization not found.");
  if (!(await isOrgNodeAdmin(userId, org._id))) return nodeError(403, "forbidden", "Only org owners and admins can pair a node.");

  const code = generatePairingCode();
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS);
  const pairing = { codeHash: hashPairingCode(code), createdBy: userId, expiresAt };
  // MongoDB can't $set a field inside a null subdocument, so an org that never had a node gets the whole object.
  await Org.updateOne({ _id: org._id }, org.node ? { $set: { "node.pairing": pairing } } : { $set: { node: { pairing } } });
  return NextResponse.json({
    code,
    expiresAt: expiresAt.toISOString(),
    replacesNode: org.node?.nodeId ? (org.node.nodeName || org.node.nodeId) : null,
  });
}
