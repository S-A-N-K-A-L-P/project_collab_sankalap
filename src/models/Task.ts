import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema(
    {
        projectId: {
            type: String,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        assignedTo: {
            type: String,
            required: true,
        },
        assignedToName: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "delayed"],
            default: "pending",
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        deadline: {
            type: Date,
            required: true,
        },
        /* ── Git Task Distribution & Scope Fields ─────────────────── */
        repoUrl: {
            type: String,
            default: "",
        },
        baseBranch: {
            type: String,
            default: "main",
        },
        targetBranch: {
            type: String,
            default: "",
        },
        assignedFiles: {
            type: [String],
            default: [],
        },
        allowedGlobs: {
            type: [String],
            default: [],
        },
        readOnlyFiles: {
            type: [String],
            default: [],
        },
        fileLockMode: {
            type: String,
            enum: ["advisory", "strict", "exclusive"],
            default: "strict",
        },
        assignedBy: {
            type: String,
            default: "",
        },
        assignedByName: {
            type: String,
            default: "",
        },
        /* ── Receiver Execution & Verification Telemetry ──────────── */
        acceptedAt: {
            type: Date,
        },
        latestCommitSha: {
            type: String,
            default: "",
        },
        commitCount: {
            type: Number,
            default: 0,
        },
        pullRequestUrl: {
            type: String,
            default: "",
        },
        verificationGate: {
            buildPassed:     { type: Boolean, default: false },
            testsPassed:     { type: Boolean, default: false },
            sastPassed:      { type: Boolean, default: false },
            contractsPassed: { type: Boolean, default: false },
            /* "passed" | "failed: …" | "not run: …" — empty = never verified */
            buildStatus:     { type: String, default: "" },
            testsStatus:     { type: String, default: "" },
            sastStatus:      { type: String, default: "" },
            contractsStatus: { type: String, default: "" },
            verifiedAt:      { type: Date },
        },
    },
    { timestamps: true }
);

const Task = models.Task || model("Task", TaskSchema);

export default Task;
