import assert from "node:assert/strict";
import test from "node:test";
import { boardColumn, closedWithoutPr, isTaskDone, laneSteps, stalledText, type CRJob, type CRTask } from "./pipeline.ts";

const now = Date.parse("2026-10-24T00:00:00Z");

function job(over: Partial<CRJob>): CRJob {
  return {
    id: "j", type: "setup-task", taskId: "t", title: "Task",
    targetUserId: "u", targetUserName: "Ada",
    status: "queued", stalled: false, deviceOnline: true,
    runAt: "2026-10-24T00:00:00Z", waitingOn: [],
    claimedBy: "", claimedByName: "", attempts: 1, maxAttempts: 3,
    note: "", error: "", result: null, createdAt: "2026-10-23T00:00:00Z",
    ...over,
  };
}

function task(over: Partial<CRTask> = {}): CRTask {
  return {
    _id: "t", title: "Task", description: "", assignedTo: "u", assignedToName: "Ada",
    status: "in-progress", priority: "medium", progress: 10,
    deadline: "2026-11-01T00:00:00Z", startAt: null, createdAt: "2026-10-01T00:00:00Z",
    dependsOn: [], dependencyRule: "completed", waitingOn: [],
    repoUrl: "https://github.com/acme/app", baseBranch: "main", targetBranch: "task",
    assignedFiles: [], allowedGlobs: [], readOnlyFiles: [], fileLockMode: "strict",
    latestCommitSha: "", commitCount: 0, verificationGate: {},
    pullRequestUrl: "", pullRequest: null, verification: null, mergeGate: null,
    setupJob: null,
    ...over,
  };
}

test("a cancelled setup is a failure, even when the task is no longer pending", () => {
  const t = task({ status: "in-progress", setupJob: job({ status: "cancelled" }) });
  const steps = laneSteps(t, now);
  assert.equal(steps[1].state, "fail");
  assert.equal(steps[1].detail, "cancelled");
  assert.equal(boardColumn(t, now), "blocked");
  assert.equal(isTaskDone(t, now), false);
});

test("an open pull request stays in review, and earlier blank steps are filled in order", () => {
  const t = task({
    status: "completed",
    pullRequest: { number: 7, url: "", state: "open", draft: false, mergeable: true, mergeableState: "clean", headSha: "abc", reviewDecision: "", approvals: 0, changesRequested: 0, checks: [] },
  });
  const steps = laneSteps(t, now);
  assert.equal(steps[1].state, "done");
  assert.equal(steps[2].state, "done");
  assert.equal(steps[3].detail, "not recorded");
  assert.equal(steps[4].state, "done");
  assert.ok(steps.findIndex((s) => s.state !== "done") > 3);
  assert.equal(boardColumn(t, now), "review");
  assert.equal(isTaskDone(t, now), false);
});

test("done counts a merged pull request and a completed task with no pull request", () => {
  const merged = task({
    status: "in-progress",
    pullRequest: { number: 3, url: "", state: "merged", draft: false, mergeable: null, mergeableState: "", headSha: "abc", reviewDecision: "approved", approvals: 1, changesRequested: 0, checks: [] },
  });
  const manual = task({ status: "completed", pullRequest: null, setupJob: job({ status: "done", result: { headSha: "abc1234" } }) });
  assert.equal(boardColumn(merged, now), "merged");
  assert.equal(isTaskDone(merged, now), true);
  assert.equal(isTaskDone(manual, now), true);
});

test("gates passed and no pull request sit in verified, after coding", () => {
  const t = task({ verificationGate: { buildStatus: "passed", testsStatus: "passed" }, setupJob: job({ status: "done" }) });
  const steps = laneSteps(t, now);
  assert.equal(steps[2].state, "done");
  assert.equal(steps[3].state, "done");
  assert.equal(boardColumn(t, now), "verified");
});

test("a running job on an offline PC is not an active setup", () => {
  const t = task({ setupJob: job({ status: "running", stalled: true, deviceOnline: false, claimedByName: "Desk" }) });
  const steps = laneSteps(t, now);
  assert.equal(steps[1].state, "fail");
  assert.equal(steps[1].detail, "Desk offline");
  assert.equal(boardColumn(t, now), "blocked");
});

test("a stalled job says which PC and since when", () => {
  const j = job({ status: "claimed", stalled: true, deviceOnline: false, claimedByName: "TUSHAR-PC", deviceLastSeenAt: "2026-10-01T00:00:00Z" });
  assert.equal(stalledText(j, now), "TUSHAR-PC offline since 23d ago");
  assert.equal(stalledText(job({ stalled: true, deviceOnline: true, claimedByName: "" }), now), "the PC went quiet");
});

test("code closed without a pull request is not done, and says so", () => {
  const t = task({ status: "completed", commitCount: 3, verificationGate: { buildStatus: "passed", testsStatus: "passed" },
    setupJob: job({ status: "cancelled" }) });
  assert.equal(closedWithoutPr(t), true);
  const steps = laneSteps(t, now);
  assert.equal(steps[4].state, "fail");
  assert.equal(steps[4].detail, "closed without PR");
  assert.equal(isTaskDone(t, now), false);
  assert.equal(boardColumn(t, now), "blocked");
  // completed with nothing to merge still counts as done
  assert.equal(closedWithoutPr(task({ status: "completed" })), false);
});

test("a missing pull request reads as not opened, never as an open PR", () => {
  const t = task({ verificationGate: { buildStatus: "passed", testsStatus: "passed" }, commitCount: 2, setupJob: job({ status: "done" }) });
  const steps = laneSteps(t, now);
  assert.equal(steps[4].state, "todo");
  assert.equal(steps[4].detail, "not opened yet");
});

test("a setup Syncro never recorded is marked as not recorded", () => {
  const t = task({ status: "in-progress", commitCount: 2, setupJob: null });
  assert.equal(laneSteps(t, now)[1].detail, "not recorded");
});
