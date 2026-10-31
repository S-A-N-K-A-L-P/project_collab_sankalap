import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePullRequestFiles, lockPaths } from "./gitTaskScopeCore.ts";

test("lockPaths includes folder globs as well as files", () => {
  assert.deepEqual(
    lockPaths({ assignedFiles: ["src/a.ts", "src/a.ts"], allowedGlobs: ["backend/**", ""] }),
    ["src/a.ts", "backend/**"],
  );
});

test("strict task blocks a file outside its scope", () => {
  const r = evaluatePullRequestFiles(
    { title: "API", assignedFiles: ["src/a.ts"], allowedGlobs: ["lib/**"], fileLockMode: "strict" },
    ["src/a.ts", "lib/b.ts", "other/c.ts"],
    [],
  );
  assert.equal(r.blocking, true);
  assert.equal(r.reasons.length, 1);
  assert.match(r.reasons[0], /other\/c\.ts is outside the scope/);
});

test("a folder glob on a teammate's task locks files inside it", () => {
  const r = evaluatePullRequestFiles(
    { title: "Mine", assignedFiles: ["backend/agent/run.ts"], fileLockMode: "strict" },
    ["backend/agent/run.ts"],
    [{ title: "Theirs", assignedToName: "Ada", assignedFiles: [], allowedGlobs: ["backend/agent/**"], fileLockMode: "strict" }],
  );
  assert.equal(r.blocking, true);
  assert.match(r.reasons[0], /locked by Ada/);
});

test("advisory scope warns and does not block the merge", () => {
  const r = evaluatePullRequestFiles(
    { title: "API", assignedFiles: ["src/a.ts"], fileLockMode: "advisory" },
    ["other/c.ts"],
    [],
  );
  assert.equal(r.blocking, false);
  assert.equal(r.warnings.length, 1);
});

test("a task with no file list is unrestricted except read-only and teammate locks", () => {
  const open = evaluatePullRequestFiles({ title: "Open", fileLockMode: "strict" }, ["anywhere.ts"], []);
  assert.equal(open.blocking, false);

  const ro = evaluatePullRequestFiles(
    { title: "Open", readOnlyFiles: ["README.md"], fileLockMode: "strict" },
    ["README.md"],
    [],
  );
  assert.equal(ro.blocking, true);
  assert.match(ro.reasons[0], /read-only/);
});
