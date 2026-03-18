import mongoose, { Schema, model, models } from "mongoose";

const ProposalSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    type: {
      type: String,
      enum: ["idea", "research", "implementation", "collaboration"],
      default: "idea",
    },
    status: {
      type: String,
      enum: ["proposal", "active", "disabled"],
      default: "proposal",
    },
    stage: {
      type: String,
      enum: ["proposal", "planning", "ideation", "architecture", "setup", "development", "completed"],
      default: "proposal",
    },
    votes: {
      type: Number,
      default: 0,
    },
    techStack: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    media: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    contributors: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Proposal = models.Proposal || model("Proposal", ProposalSchema);

export default Proposal;
