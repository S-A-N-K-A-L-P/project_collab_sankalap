import assert from "node:assert/strict";
import test from "node:test";
import { computeProjectMetrics } from "./projectMetrics.ts";

const NOW = Date.UTC(2026, 9, 24, 12, 0, 0);
const day = 86_400_000;
const passGate = { buildStatus: "passed", testsStatus: "passed", sastStatus: "passed", contractsStatus: "not run: no contracts" };

test("empty project has no completion and is healthy", () => {
  const m = computeProjectMetrics([], NOW, () => false);
  assert.equal(m.completionPct, null);
  assert.equal(m.gatePassRatePct, null);
  assert.equal(m.health, "healthy");
  assert.deepEqual(m.healthReasons, []);
});

test("counts completion, overdue and merged PRs from tasks", () => {
  const tasks = [
    { _id: "a", title: "A", status: "completed", deadline: new Date(NOW - 5 * day) },
    { _id: "b", title: "B", status: "in-progress", deadline: new Date(NOW - day) },           // overdue
    { _id: "c", title: "C", status: "pending", deadline: new Date(NOW + 3 * day) },             // due this week
    { _id: "d", title: "D", status: "in-progress", deadline: new Date(NOW + 20 * day),
      pullRequest: { number: 4, state: "merged" } },                                            // done via merge
  ];
  const m = computeProjectMetrics(tasks, NOW, () => false);
  assert.equal(m.totalTasks, 4);
  assert.equal(m.completedTasks, 2);
  assert.equal(m.completionPct, 50);
  assert.equal(m.overdueTasks, 1);
  assert.equal(m.dueThisWeek, 1);
  assert.equal(m.mergedPrs, 1);
  assert.equal(m.nextDeadline?.taskId, "c");
  assert.equal(m.health, "blocker");
  assert.match(m.healthReasons[0], /1 overdue/);
});

test("open PRs split into merge-ready and blocked; stale verification detected", () => {
  const tasks = [
    { _id: "a", title: "A", status: "in-progress", deadline: new Date(NOW + 10 * day), verificationGate: passGate,
      latestCommitSha: "abc1234", pullRequest: { number: 1, state: "open", headSha: "abc1234def" } },
    { _id: "b", title: "B", status: "in-progress", deadline: new Date(NOW + 10 * day), verificationGate: passGate,
      latestCommitSha: "abc1234", pullRequest: { number: 2, state: "open", headSha: "fff9999" } },
  ];
  const m = computeProjectMetrics(tasks, NOW, (t) => t._id === "a");
  assert.equal(m.openPrs, 2);
  assert.equal(m.mergeReadyPrs, 1);
  assert.equal(m.blockedPrs, 1);
  assert.equal(m.staleVerification, 1);
  assert.equal(m.gatePassRatePct, 100);
  assert.equal(m.health, "needsReview");
});

test("dependencies: waiting until the dependency is done (or merged)", () => {
  const tasks = [
    { _id: "a", title: "A", status: "in-progress" },
    { _id: "b", title: "B", status: "pending", dependsOn: ["a"] },
    { _id: "c", title: "C", status: "pending", dependsOn: ["a"], dependencyRule: "merged" },
  ];
  assert.equal(computeProjectMetrics(tasks, NOW, () => false).waitingOnDependencies, 2);
  tasks[0].status = "completed";
  assert.equal(computeProjectMetrics(tasks, NOW, () => false).waitingOnDependencies, 1); // "merged" rule still waits
});

test("a failed gate makes the project a blocker", () => {
  const tasks = [{ _id: "a", title: "A", status: "in-progress", verificationGate: { buildStatus: "failed: 3 errors" } }];
  const m = computeProjectMetrics(tasks, NOW, () => false);
  assert.equal(m.failedGateTasks, 1);
  assert.equal(m.gatePassRatePct, 0);
  assert.equal(m.health, "blocker");
});
