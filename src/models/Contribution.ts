import mongoose, { Schema, model, models } from "mongoose";

const ContributionSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["task", "code", "design", "documentation", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    media: [{
        type: String,
    }]
  },
  {
    timestamps: true,
  }
);

const Contribution = models.Contribution || model("Contribution", ContributionSchema);

export default Contribution;
