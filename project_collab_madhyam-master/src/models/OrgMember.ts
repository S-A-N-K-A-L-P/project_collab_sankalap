import mongoose, { Schema, model, models } from "mongoose";

const OrgMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Org",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "lead", "admin"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

OrgMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true });

const OrgMember = models.OrgMember || model("OrgMember", OrgMemberSchema);

export default OrgMember;
