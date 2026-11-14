import { randomBytes } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import Project from "@/models/Project";
import User from "@/models/User";
import { asJsonObject, misconfigured, nodeError, nodeSecretKey, sessionUserId, type OrgWithNode } from "@/lib/orgNode";
import { buildPassClaims, decryptSecret, PASS_NONCE_RE, seatsFor, signPass } from "@/lib/orgNodeCore";

const ISSUER = (process.env.SHOWCASE_ORIGIN || process.env.NEXTAUTH_URL || "https://project-syncroo.netlify.app").replace(/\/+$/, "");
const PLATFORM_STAFF = new Set(["platform_moderator", "master_admin"]);

// 10 passes per minute per user (admindashboard-syncro.md §5.3). Best effort: each serverless instance counts on its own.
const recent = new Map<string, number[]>();
function rateLimited(userId: string): boolean {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < 60_000);
  const limited = hits.length >= 10;
  if (!limited) hits.push(now);
  if (recent.size > 5_000) recent.clear();
  recent.set(userId, hits);
  return limited;
}

type UserLean = { name?: string; avatar?: string; role?: string };
type MemberLean = { role?: string; status?: string };

/**
 * POST /api/orgs/[slug]/node/pass — mints the 60-second sign-in pass the console hands to the org's node
 * (roles.md §7). Body: { nonce } from the node UI's syncro:hello. Never carries email, phone or tokens.
 * Platform staff who aren't members still get a pass: only the node knows whether its owner allows staff access.
 */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const key = nodeSecretKey();
  if (!key) return misconfigured();
  const userId = sessionUserId(await getServerSession(authOptions));
  if (!userId) return nodeError(401, "unauthenticated", "Sign in first.");
  if (rateLimited(userId)) return nodeError(429, "rate_limited", "Too many console sign-ins. Wait a minute and try again.");

  let body: Record<string, unknown> | null = null;
  try { body = asJsonObject(await req.json()); } catch { /* handled below */ }
  const nonce = body?.nonce;
  if (typeof nonce !== "string" || !PASS_NONCE_RE.test(nonce)) return nodeError(400, "bad_input", "nonce must be 22-64 base64url characters.");

  const { slug } = await params;
  await dbConnect();
  const org = await Org.findOne({ slug }).select("+node +node.secretEnc").lean<OrgWithNode>();
  if (!org) return nodeError(404, "not_found", "Organization not found.");
  if (!org.node?.nodeId || !org.node.secretEnc) return nodeError(404, "not_paired", "This org's console isn't set up yet.");
  const secret = decryptSecret(org.node.secretEnc, key);
  if (!secret) return nodeError(500, "server_misconfigured", "The stored node secret can't be decrypted (NODE_SECRET_KEY changed?).");

  const [user, membership] = await Promise.all([
    User.findById(userId).select("name avatar role").lean<UserLean>(),
    OrgMember.findOne({ userId, orgId: org._id }).select("role status").lean<MemberLean>(),
  ]);
  if (!user) return nodeError(401, "unauthenticated", "Sign in first.");
  const active = membership?.status === "active";
  if (!active && !PLATFORM_STAFF.has(user.role ?? "")) {
    const code = membership?.status === "pending" || membership?.status === "suspended" ? membership.status : "not_member";
    return nodeError(403, code, code === "not_member" ? "This console is for org members." : `Membership is ${code}.`);
  }

  const projects = active
    ? await Project.find({ orgId: org._id, $or: [{ "teamRoster.userId": userId }, { lead: userId }, { members: userId }] })
        .select("_id lead members teamRoster")
        .limit(200)
        .lean<{ _id: unknown; lead?: unknown; members?: unknown[]; teamRoster?: { userId?: unknown; projectRole?: unknown; maxActiveTasks?: unknown }[] }[]>()
    : [];

  const claims = buildPassClaims({
    issuer: ISSUER,
    orgId: String(org._id),
    orgSlug: org.slug,
    userId,
    name: user.name ?? "",
    avatar: user.avatar,
    platformRole: user.role,
    membership: membership ?? null,
    seats: seatsFor(projects, userId),
    nonce,
    now: Math.floor(Date.now() / 1000),
    jti: randomBytes(16).toString("hex"),
  });
  return NextResponse.json(
    { pass: signPass(claims, secret), expiresAt: new Date(claims.exp * 1000).toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
