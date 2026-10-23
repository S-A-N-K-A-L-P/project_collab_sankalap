import { Schema, model, models } from "mongoose";

/**
 * A member's PC running Syncro Desktop. Registered by the desktop app with the member's mobile
 * JWT; kept alive by heartbeats. One user can have several devices.
 */
const AgentDeviceSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: "" },
    /** Stable id generated once per install (stored in %LOCALAPPDATA% on the PC). */
    deviceId: { type: String, required: true },
    name: { type: String, default: "" },
    os: { type: String, default: "" },
    appVersion: { type: String, default: "" },
    workspaceRoot: { type: String, default: "" },
    /** idle | busy | waiting-approval | disabled | error */
    status: { type: String, default: "idle" },
    statusNote: { type: String, default: "" },
    currentJobId: { type: String, default: "" },
    lastSeenAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

AgentDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const AgentDevice = models.AgentDevice || model("AgentDevice", AgentDeviceSchema);
export default AgentDevice;
