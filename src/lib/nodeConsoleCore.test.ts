import assert from "node:assert/strict";
import test from "node:test";
import {
  consoleTitle, framePathFromShell, frameSrc, parseFrameMessage, probeMatches, shellUrlForFramePath, stateForPassError,
} from "./nodeConsoleCore.ts";

test("frame messages are validated against the protocol", () => {
  assert.deepEqual(parseFrameMessage({ v: 1, type: "syncro:hello", data: { nonce: "abcdefghijklmnopqrstuvwxyz012345" } }),
    { type: "syncro:hello", data: { nonce: "abcdefghijklmnopqrstuvwxyz012345" } });
  assert.equal(parseFrameMessage({ v: 1, type: "syncro:hello", data: { nonce: "short" } }), null);
  assert.equal(parseFrameMessage({ v: 2, type: "syncro:hello", data: { nonce: "abcdefghijklmnopqrstuvwxyz012345" } }), null);
  assert.equal(parseFrameMessage({ v: 1, type: "syncro:steal", data: {} }), null);
  assert.equal(parseFrameMessage("syncro:hello"), null);
  assert.deepEqual(parseFrameMessage({ v: 1, type: "syncro:navigate", data: { path: "/r/a/b?ref=main" } }),
    { type: "syncro:navigate", data: { path: "/r/a/b?ref=main", push: false } });
  for (const path of ["//evil.example", "/x<script>", "r/a", "/a b", "/" + "a".repeat(301)])
    assert.equal(parseFrameMessage({ v: 1, type: "syncro:navigate", data: { path } }), null, path);
  assert.equal(parseFrameMessage({ v: 1, type: "syncro:ready", data: { nodeRole: "root", name: "x" } }), null);
  assert.equal(parseFrameMessage({ v: 1, type: "syncro:open-external", data: { url: "javascript:alert(1)" } }), null);
  assert.equal(parseFrameMessage({ v: 1, type: "syncro:error", data: { code: "bad_pass", message: "x".repeat(301) } }), null);
});

test("shell and frame paths map both ways", () => {
  assert.equal(framePathFromShell("acme", "/orgs/acme/console", ""), "/");
  assert.equal(framePathFromShell("acme", "/orgs/acme/console/r/acme/api/tree/main", "?ref=dev"), "/r/acme/api/tree/main?ref=dev");
  assert.equal(framePathFromShell("acme", "/orgs/other/console/r", ""), "/");
  assert.equal(shellUrlForFramePath("acme", "/"), "/orgs/acme/console");
  assert.equal(shellUrlForFramePath("acme", "/r/acme/api?x=1"), "/orgs/acme/console/r/acme/api?x=1");
  assert.equal(shellUrlForFramePath("acme", "//evil.example"), "/orgs/acme/console");
  assert.equal(frameSrc("https://calm-river.trycloudflare.com/ignored", "/r/a/b", "https://project-syncroo.netlify.app"),
    "https://calm-river.trycloudflare.com/?embed=1&parent=https%3A%2F%2Fproject-syncroo.netlify.app#/r/a/b");
});

test("the probe only accepts this org's node", () => {
  const exp = { nodeId: "node_abcdefghijkl", orgSlug: "acme" };
  assert.equal(probeMatches({ ok: true, nodeId: "node_abcdefghijkl", orgSlug: "acme" }, exp), true);
  assert.equal(probeMatches({ ok: true, nodeId: "node_zzzzzzzzzzzz", orgSlug: "acme" }, exp), false);
  assert.equal(probeMatches({ ok: true, nodeId: "node_abcdefghijkl", orgSlug: "other" }, exp), false);
  assert.equal(probeMatches({ ok: false, nodeId: "node_abcdefghijkl", orgSlug: "acme" }, exp), false);
  assert.equal(probeMatches("<html>", exp), false);
});

test("pass errors pick the right card", () => {
  assert.equal(stateForPassError(401, "unauthenticated"), "signed_out");
  assert.equal(stateForPassError(403, "pending"), "pending");
  assert.equal(stateForPassError(403, "suspended"), "suspended");
  assert.equal(stateForPassError(403, "not_member"), "not_member");
  assert.equal(stateForPassError(404, "not_paired"), "not_paired");
  assert.equal(stateForPassError(429, "rate_limited"), "error");
  assert.equal(consoleTitle("acme/api", "Acme"), "acme/api · Acme · S.A.N.K.A.L.P.");
});
