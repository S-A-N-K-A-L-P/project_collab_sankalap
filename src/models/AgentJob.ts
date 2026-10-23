import { Schema, model, models } from "mongoose";

/**
 * Work for a member's Syncro Desktop agent. A device claims a job atomically and holds it with a
 * short lease that its heartbeats extend; if the PC disappears the lease runs out and the job can be
 * claimed again (up to maxAttempts).
 *
 * Types today: "setup-task" (clone/fetch the repo, check out the task branch, activate the scope).
 * Planned: "simulate", "verify", "open-pr".
 */
const AgentJobSchema = new Schema(
  {
    type: { type: String, enum: ["setup-task", "simulate", "verify", "open-pr"], required: true },
    projectId: { type: String, required: true, index: true },
    taskId: { type: String, default: "", index: true },
    /** Member whose PCs may run it. */
    targetUserId: { type: String, required: true, index: true },
    targetUserName: { type: String, default: "" },
    /** Optional: only this device may claim it. Empty = any of the member's devices. */
    targetDeviceId: { type: String, default: "" },
    payload: { type: Schema.Types.Mixed, default: {} },

    /** queued → claimed → running → done | failed; cancelled when superseded. */
    status: {
      type: String,
      enum: ["queued", "claimed", "running", "done", "failed", "cancelled"],
      default: "queued",
      index: true,
    },
    claimedBy: { type: String, default: "" },
    claimedAt: { type: Date },
    leaseUntil: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    /** Latest progress note from the PC, e.g. "waiting for approval on the PC". */
    note: { type: String, default: "" },
    result: { type: Schema.Types.Mixed, default: null },
    error: { type: String, default: "" },
    finishedAt: { type: Date },

    createdBy: { type: String, default: "" },
    createdByName: { type: String, default: "" },
  },
  { timestamps: true }
);

AgentJobSchema.index({ targetUserId: 1, status: 1, createdAt: 1 });

const AgentJob = models.AgentJob || model("AgentJob", AgentJobSchema);
export default AgentJob;
