import mongoose, { Schema, model, models } from "mongoose";

const ActivitySchema = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["VOTE", "JOIN", "CREATE_PROPOSAL", "FOLLOW", "COMMENT"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["USER", "PROPOSAL", "COMMENT"],
      required: true,
    },
    metadata: {
      type: Schema.Types.Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Activity = models.Activity || model("Activity", ActivitySchema);

export default Activity;
