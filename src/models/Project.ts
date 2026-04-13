import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Org",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["planning", "active", "completed", "archived"],
      default: "planning",
    },
    lead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    githubRepo: {
      type: String,
    },
    techStack: {
      type: [String],
      default: [],
    },
    gitRepo: {
      type: Schema.Types.ObjectId,
      ref: "GitRepo",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Project = models.Project || model("Project", ProjectSchema);

export default Project;
