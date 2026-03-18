import mongoose, { Schema, model, models } from "mongoose";

const GitRepoSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      unique: true,
      required: true,
    },
    repoUrl: {
      type: String,
      required: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    defaultBranch: {
      type: String,
      default: "main",
    },
    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "failed", "verified"],
      default: "idle",
    },
    lastSyncAt: {
      type: Date,
    },
    stats: {
      commits: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      forks: { type: Number, default: 0 },
      issues: { type: Number, default: 0 },
    },
    commits: [{
      sha: String,
      message: String,
      author: String,
      date: Date,
      url: String,
    }]
  },
  {
    timestamps: true,
  }
);

const GitRepo = models.GitRepo || model("GitRepo", GitRepoSchema);

export default GitRepo;
