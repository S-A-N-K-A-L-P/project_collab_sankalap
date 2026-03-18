import mongoose, { Schema, model, models } from "mongoose";

const ActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["vote", "join", "proposal_created", "comment", "profile_update"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: false, // Could be proposal id, for example
    },
    targetName: {
      type: String, // Cached name for quick feed rendering
      required: false,
    },
    metadata: {
      type: Schema.Types.Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Activity = models.Activity || model("Activity", ActivitySchema);

export default Activity;
