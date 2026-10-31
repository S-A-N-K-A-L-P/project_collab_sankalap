import mongoose, { Schema, model, models } from "mongoose";

const VoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    value: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one vote entry per user per proposal
// If multiple votes allowed, we still only store one row per user/proposal with a 'value'
VoteSchema.index({ userId: 1, proposalId: 1 }, { unique: true });

const Vote = models.Vote || model("Vote", VoteSchema);

export default Vote;
