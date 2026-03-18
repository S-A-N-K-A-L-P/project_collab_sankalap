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
      enum: ["idea", "research", "implementation", "collaboration", "protocol", "node", "infrastructure"],
      default: "idea",
    },
    status: {
      type: String,
      enum: ["proposal", "active", "closed", "draft", "disabled"],
      default: "proposal",
    },
    stage: {
      type: String,
      enum: ["proposal", "planning", "ideation", "architecture", "setup", "development", "completed"],
      default: "proposal",
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
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: () => new Date(+new Date() + 7*24*60*60*1000), // Default 7 days from now
    },
    maxVotesPerUser: {
      type: Number,
      default: 1,
    },
    allowVoteEdit: {
      type: Boolean,
      default: false,
    },
    voteMode: {
      type: String,
      enum: ["fixed", "flexible"],
      default: "fixed",
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    contributors: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    media: {
      type: [String],
      default: [],
    },
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
