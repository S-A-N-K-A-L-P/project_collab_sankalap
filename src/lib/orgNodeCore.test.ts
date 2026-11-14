import assert from "node:assert/strict";
import test from "node:test";
import {
  attestSignature, b64url, decryptSecret, encryptSecret, fromB64url, generateNodeSecret, generatePairingCode,
  buildPassClaims, buildRoster, memberChangedEvent, normalizeNodeUrl, normalizePairingCode, parseSecretKey, PAIRING_CODE_RE, seatsFor,
  showcaseCallHeaders, signPass, signRequest, verifySignedRequest,
} from "./orgNodeCore.ts";

// Same vectors are asserted by Syncro.Git.Tests (OrgNodeTests.Signing_matches_showcase_vectors), so the
// C# node and this Showcase agree on every byte.
const SECRET = b64url(Buffer.from([...Array(32).keys()]));

test("signature vectors match the C# node", () => {
  assert.equal(SECRET, "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8");
  assert.equal(signRequest(SECRET, "put", "/api/orgs/acme/node", 1700000000, '{"a":1}'), "HD0MZX3kgNEJ5yhcYRRTlXxaeRAV-iJ7c_pJT9qXVsw");
  assert.equal(
    attestSignature(SECRET, "node_abcdefghijkl", "0123456789abcdef01234567", "https://x.trycloudflare.com", "00112233445566778899aabbccddeeff"),
    "J4L6ITkNYjjQdu-pra-Kw6oQbwJTAiTk9CuuWU9hFaI",
  );
});

test("verifySignedRequest accepts fresh, rejects stale, tampered and unsigned", () => {
  const now = 1700000000;
  const sig = signRequest(SECRET, "PUT", "/api/orgs/acme/node", now, "{}");
  assert.deepEqual(verifySignedRequest(SECRET, "PUT", "/api/orgs/acme/node", { timestamp: String(now), signature: sig }, "{}", now + 30), { ok: true });
  assert.equal(verifySignedRequest(SECRET, "PUT", "/api/orgs/acme/node", { timestamp: String(now), signature: sig }, "{}", now + 121).ok, false);
  assert.equal(verifySignedRequest(SECRET, "PUT", "/api/orgs/acme/node", { timestamp: String(now), signature: sig }, "{ }", now).ok, false);
  assert.equal(verifySignedRequest(SECRET, "PUT", "/api/orgs/other/node", { timestamp: String(now), signature: sig }, "{}", now).ok, false);
  assert.equal(verifySignedRequest(SECRET, "PUT", "/api/orgs/acme/node", { timestamp: null, signature: sig }, "{}", now).ok, false);
  assert.equal(verifySignedRequest(generateNodeSecret(), "PUT", "/api/orgs/acme/node", { timestamp: String(now), signature: sig }, "{}", now).ok, false);
});

test("pairing codes are well-formed and normalise", () => {
  for (let i = 0; i < 50; i++) assert.match(generatePairingCode(), PAIRING_CODE_RE);
  assert.equal(normalizePairingCode(" abcd-efgh-jkmn "), "ABCD-EFGH-JKMN");
  assert.equal(normalizePairingCode("abcdefghjkmn"), "ABCD-EFGH-JKMN");
  assert.equal(normalizePairingCode("ABCD-EFGH-JKM0"), null); // 0 isn't in the alphabet
  assert.equal(normalizePairingCode(42), null);
});

test("node secret round-trips through AES-256-GCM and detects tampering", () => {
  const key = parseSecretKey(b64url(Buffer.alloc(32, 7)))!;
  assert.ok(key);
  assert.equal(parseSecretKey("a".repeat(64))?.length, 32);
  assert.equal(parseSecretKey("short"), null);
  const secret = generateNodeSecret();
  assert.equal(secret.length, 43);
  const enc = encryptSecret(secret, key);
  assert.equal(decryptSecret(enc, key), secret);
  const parts = enc.split(".");
  parts[3] = parts[3].startsWith("A") ? "B" + parts[3].slice(1) : "A" + parts[3].slice(1);
  assert.equal(decryptSecret(parts.join("."), key), null);
  assert.equal(decryptSecret(enc, Buffer.alloc(32, 8)), null);
  // A truncated GCM tag must not authenticate (authTagLength is pinned to 16 bytes).
  const short = enc.split(".");
  short[2] = b64url(fromB64url(short[2]).subarray(0, 4));
  assert.equal(decryptSecret(short.join("."), key), null);
});

test("node URLs: https hosts only", () => {
  assert.equal(normalizeNodeUrl("https://Calm-River-12.trycloudflare.com/"), "https://calm-river-12.trycloudflare.com");
  assert.equal(normalizeNodeUrl("https://node.example.dev"), "https://node.example.dev");
  for (const bad of ["http://x.trycloudflare.com", "https://localhost", "https://localhost.", "https://foo.localhost",
    "https://x.trycloudflare.com.", "https://10.0.0.1", "https://a.b/path",
    "https://a.b?x=1", "https://u:p@a.b", "https://a.b:8443", "javascript:alert(1)", "https://intranet", 5]) {
    assert.equal(normalizeNodeUrl(bad), null, String(bad));
  }
});

// Same pass vector is verified by Syncro.Git.Tests (OrgNodeSsoTests.Pass_vector_from_the_showcase_verifies).
const PASS_VECTOR =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb2plY3Qtc3luY3Jvby5uZXRsaWZ5LmFwcCIsImF1ZCI6Im9yZy1ub2RlOjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2NyIsInN1YiI6ImFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDYwLCJqdGkiOiIwMDExMjIzMzQ0NTU2Njc3ODg5OWFhYmJjY2RkZWVmZiIsIm5vbmNlIjoibm9uY2VfMDEyMzQ1Njc4OWFiY2RlZmdoaWoiLCJuYW1lIjoiVGVzdCBVc2VyIiwicGxhdGZvcm1Sb2xlIjoidXNlciIsIm9yZyI6eyJpZCI6IjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2NyIsInNsdWciOiJhY21lIiwicm9sZSI6Im1lbWJlciIsInN0YXR1cyI6ImFjdGl2ZSJ9LCJzZWF0cyI6W3sicHJvamVjdElkIjoiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiIiwicHJvamVjdFJvbGUiOiJsZWFkIiwibWF4QWN0aXZlVGFza3MiOjV9XX0." +
  "28YH6wbUlbOfwXGVMNxcYrBmc6VDVodt7GGqNUkBCaw";

test("sign-in pass matches the vector the node verifies", () => {
  const claims = buildPassClaims({
    issuer: "https://project-syncroo.netlify.app/",
    orgId: "0123456789abcdef01234567",
    orgSlug: "acme",
    userId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    name: "Test User",
    avatar: "",
    platformRole: "user",
    membership: { role: "member", status: "active" },
    seats: [{ projectId: "bbbbbbbbbbbbbbbbbbbbbbbb", projectRole: "lead", maxActiveTasks: 5 }],
    nonce: "nonce_0123456789abcdefghij",
    now: 1700000000,
    jti: "00112233445566778899aabbccddeeff",
  });
  assert.equal(signPass(claims, SECRET), PASS_VECTOR);
});

test("pass claims never carry unknown roles, and non-members get null org role/status", () => {
  const base = {
    issuer: "https://x.dev", orgId: "0123456789abcdef01234567", orgSlug: "acme", userId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    name: "N".repeat(200), platformRole: "god_mode", seats: [], nonce: "n".repeat(22), now: 10, jti: "j".repeat(32),
  };
  const c = buildPassClaims({ ...base, membership: null });
  assert.equal(c.platformRole, "user");
  assert.deepEqual(c.org, { id: base.orgId, slug: "acme", role: null, status: null });
  assert.equal(c.name.length, 120);
  assert.equal(c.exp - c.iat, 60);
  assert.equal("avatar" in c, false);
  const d = buildPassClaims({ ...base, avatar: "https://a/b.png", membership: { role: "superuser", status: "weird" } });
  assert.deepEqual([d.org.role, d.org.status, d.avatar], [null, null, "https://a/b.png"]);
  assert.deepEqual(Object.keys(d).slice(7, 10), ["name", "avatar", "platformRole"]);
});

test("seats come from teamRoster, then lead, then members", () => {
  const u = "aaaaaaaaaaaaaaaaaaaaaaaa";
  const seats = seatsFor([
    { _id: "p1", teamRoster: [{ userId: u, projectRole: "qa", maxActiveTasks: 3 }], lead: u },
    { _id: "p2", lead: u, members: [] },
    { _id: "p3", members: [u] },
    { _id: "p4", teamRoster: [{ userId: u, projectRole: "wizard", maxActiveTasks: 99 }] },
    { _id: "p5", members: ["someone-else"] },
  ], u);
  assert.deepEqual(seats, [
    { projectId: "p1", projectRole: "qa", maxActiveTasks: 3 },
    { projectId: "p2", projectRole: "lead", maxActiveTasks: 5 },
    { projectId: "p3", projectRole: "contributor", maxActiveTasks: 5 },
    { projectId: "p4", projectRole: "contributor", maxActiveTasks: 50 },
  ]);
});

// Asserted by Syncro.Git.Tests (OrgNodeProjectsTests.Showcase_event_vector_verifies) too.
const EVENT_BODY = '{"type":"member.changed","userId":"cccccccccccccccccccccccc","orgRole":"lead","status":"active","removed":false,"at":"2023-11-14T22:13:20.000Z","name":"Lou Lead","platformRole":"user"}';

test("member.changed body and Showcase signature match the vector the node verifies", () => {
  const body = JSON.stringify(memberChangedEvent({
    userId: "cccccccccccccccccccccccc", membership: { role: "lead", status: "active" }, user: { name: "Lou Lead", role: "user", email: "x@y.z" } as never,
    at: new Date(1700000000000),
  }));
  assert.equal(body, EVENT_BODY);
  assert.deepEqual(showcaseCallHeaders("0123456789abcdef01234567", SECRET, "POST", "/api/org/v1/events", body, 1700000000), {
    "Content-Type": "application/json",
    "X-Syncro-Showcase": "0123456789abcdef01234567",
    "X-Syncro-Timestamp": "1700000000",
    "X-Syncro-Signature": "XMJcf61-HsElPoGH-hBSHlCNuPvg-Jj2_dUdBuHDWZ0",
  });
  const removed = memberChangedEvent({ userId: "cccccccccccccccccccccccc", membership: null, user: null, at: new Date(0) });
  assert.deepEqual(removed, { type: "member.changed", userId: "cccccccccccccccccccccccc", orgRole: null, status: null, removed: true, at: "1970-01-01T00:00:00.000Z" });
});

test("roster lists valid members with seats and unused approved proposals, never email", () => {
  const a = "aaaaaaaaaaaaaaaaaaaaaaaa", b = "bbbbbbbbbbbbbbbbbbbbbbbb", c = "cccccccccccccccccccccccc", p1 = "111111111111111111111111", p2 = "222222222222222222222222";
  const roster = buildRoster({
    orgId: "0123456789abcdef01234567",
    now: new Date(1700000000000),
    memberships: [
      { userId: a, role: "owner", status: "active" },
      { userId: b, role: "member", status: "pending" },
      { userId: c, role: "wizard", status: "active" },              // unknown role: left out
      { userId: "dddddddddddddddddddddddd", role: "member", status: "active" }, // user gone: left out
    ],
    users: new Map([
      [a, { name: "Olive Owner", avatar: "https://x/a.png", role: "master_admin", email: "o@x.y" } as never],
      [b, { name: "Pat Pending", role: "weird" }],
      [c, { name: "Cam", role: "user" }],
    ]),
    projects: [{ _id: p1, lead: a, members: [b] }],
    proposals: [
      { _id: p1, title: "Used already", techStack: [] },
      { _id: p2, title: "Payments API", techStack: ["Next.js", 7, "Postgres"], createdBy: b },
    ],
    usedProposalIds: new Set([p1]),
  });
  assert.deepEqual(roster, {
    orgId: "0123456789abcdef01234567",
    generatedAt: "2023-11-14T22:13:20.000Z",
    members: [
      { userId: a, name: "Olive Owner", avatar: "https://x/a.png", platformRole: "master_admin", orgRole: "owner", status: "active",
        seats: [{ showcaseProjectId: p1, projectRole: "lead", maxActiveTasks: 5 }] },
      { userId: b, name: "Pat Pending", platformRole: "user", orgRole: "member", status: "pending",
        seats: [{ showcaseProjectId: p1, projectRole: "contributor", maxActiveTasks: 5 }] },
    ],
    approvedProposals: [{ proposalId: p2, title: "Payments API", techStack: ["Next.js", "Postgres"], createdBy: b }],
  });
  assert.ok(!JSON.stringify(roster).includes("@"));
});
