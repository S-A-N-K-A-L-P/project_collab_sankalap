import assert from "node:assert/strict";
import test from "node:test";
import {
  attestSignature, b64url, decryptSecret, encryptSecret, fromB64url, generateNodeSecret, generatePairingCode,
  normalizeNodeUrl, normalizePairingCode, parseSecretKey, PAIRING_CODE_RE, signRequest, verifySignedRequest,
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
