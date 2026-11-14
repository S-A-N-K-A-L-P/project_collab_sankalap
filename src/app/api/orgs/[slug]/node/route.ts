import { randomBytes } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import User from "@/models/User";
import { asJsonObject, isOrgNodeAdmin, nodeError, publicNodeStatus, sessionUserId, verifyNodeCall, type OrgWithNode } from "@/lib/orgNode";
import { attestSignature, NODE_FEATURES, normalizeNodeUrl, safeEqual } from "@/lib/orgNodeCore";

const CONSOLE_BASE = (process.env.SHOWCASE_ORIGIN || process.env.NEXTAUTH_URL || "https://project-syncroo.netlify.app").replace(/\/+$/, "");

type Ctx = { params: Promise<{ slug: string }> };

/** GET /api/orgs/[slug]/node — public status (admindashboard-syncro.md §5.2). The browser probe decides online/offline. */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  await dbConnect();
  // Only the fields the public status needs: .select("node") would project {node: 1} and read both secrets.
  const org = await Org.findOne({ slug })
    .select("node.nodeId node.pairedBy node.url node.features node.lastOnlineAt node.lastOfflineAt")
    .lean<OrgWithNode>();
  if (!org) return nodeError(404, "not_found", "Organization not found.");
  let hostName: string | undefined;
  if (org.node?.pairedBy) {
    const u = await User.findById(org.node.pairedBy).select("name").lean<{ name?: string }>();
    hostName = u?.name?.split(" ")[0];
  }
  return NextResponse.json(publicNodeStatus(org, hostName), { headers: { "Cache-Control": "no-store" } });
}

/**
 * PUT /api/orgs/[slug]/node — signed "online at this URL" (gitupgrades.md §11.1). Before saving, the Showcase
 * attests the URL: only a server holding the org's secret can sign our nonce, so nobody can point the console
 * at a fake site.
 */
export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const call = await verifyNodeCall(req, slug);
  if (call instanceof NextResponse) return call;
  const { org, secret, rawBody } = call;

  let body: Record<string, unknown> | null = null;
  try { body = asJsonObject(JSON.parse(rawBody)); } catch { /* handled below */ }
  if (!body) return nodeError(400, "bad_input", "Body must be a JSON object.");
  const url = normalizeNodeUrl(body.url);
  if (body.nodeId !== org.node.nodeId) return nodeError(400, "bad_input", "nodeId doesn't match the signing node.");
  if (!url) return nodeError(400, "bad_input", "url must be an https address with no path, port or query.");
  const tunnelKind = body.tunnelKind === "named" ? "named" : body.tunnelKind === "quick" ? "quick" : null;
  if (!tunnelKind) return nodeError(400, "bad_input", "tunnelKind must be quick or named.");
  const features = Array.isArray(body.features)
    ? [...new Set(body.features.filter((f): f is string => typeof f === "string" && (NODE_FEATURES as readonly string[]).includes(f)))]
    : [];

  // Attest: GET <url>/api/org/v1/node/attest?nonce=… must return our nonce signed with the node secret.
  const nonce = randomBytes(16).toString("hex");
  let attested = false;
  try {
    const res = await fetch(`${url}/api/org/v1/node/attest?nonce=${nonce}`, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const a = asJsonObject(await res.json()) ?? {};
      const orgId = String(org._id);
      attested = a.nodeId === org.node.nodeId && a.orgId === orgId && a.nonce === nonce
        && typeof a.signature === "string"
        && safeEqual(a.signature, attestSignature(secret, org.node.nodeId, orgId, url, nonce));
    }
  } catch {
    attested = false;
  }
  if (!attested) return nodeError(422, "attest_failed", `The Showcase couldn't verify ${url} from the internet. Is the tunnel up?`);

  await Org.updateOne(
    { _id: org._id, "node.nodeId": org.node.nodeId },
    {
      $set: {
        "node.url": url,
        "node.tunnelKind": tunnelKind,
        "node.features": features,
        "node.appVersion": typeof body.appVersion === "string" ? body.appVersion.slice(0, 40) : org.node.appVersion,
        "node.lastOnlineAt": new Date(),
      },
    },
  );
  return NextResponse.json({ ok: true, attested: true, consoleUrl: `${CONSOLE_BASE}/orgs/${slug}/console` });
}

/**
 * DELETE /api/orgs/[slug]/node — unpair (gitupgrades.md §2.4). Either the node itself (signed) or an org
 * owner/admin from the Showcase (session). Live work stays on the PC and can be re-paired.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (req.headers.get("x-syncro-signature")) {
    const call = await verifyNodeCall(req, slug);
    if (call instanceof NextResponse) return call;
    await Org.updateOne({ _id: call.org._id }, { $set: { node: null } });
    return NextResponse.json({ ok: true });
  }

  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return nodeError(401, "unauthenticated", "Sign in first.");
  await dbConnect();
  const org = await Org.findOne({ slug }).select("_id node.nodeId").lean<OrgWithNode>();
  if (!org) return nodeError(404, "not_found", "Organization not found.");
  if (!(await isOrgNodeAdmin(userId, org._id))) return nodeError(403, "forbidden", "Only org owners and admins can unpair the node.");
  if (!org.node?.nodeId) return nodeError(404, "not_paired", "This org has no paired node.");
  await Org.updateOne({ _id: org._id }, { $set: { node: null } });
  return NextResponse.json({ ok: true });
}
