import mongoose, { Schema, model, models } from "mongoose";

const OrgSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    rules: {
      maxVotesPerUser: {
          type: Number,
          default: 1,
      },
      voteDuration: {
          type: Number, // in days
          default: 7,
      },
      requireVerification: {
          type: Boolean,
          default: true,
      },
      allowVoteEdit: {
          type: Boolean,
          default: false,
      }
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    avatar: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

const Org = models.Org || model("Org", OrgSchema);

export default Org;
