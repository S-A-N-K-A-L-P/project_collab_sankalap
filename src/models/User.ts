import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: [true, "University name is required"],
    },
    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment number is required"],
    },
    techStackPreference: {
      type: String,
      required: [true, "Tech stack preference is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    handle: {
      type: String,
      unique: true,
      sparse: true,      // allow many nulls without unique collision
      lowercase: true,
      trim: true,
      // 3–30 chars, [a-z0-9-]; validated at the API layer + reserved list
    },
    avatar: {
      type: String,
      default: "",
    },
    universityLogo: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: "",
    },
    /**
     * Platform roles (hierarchy.md §3.1):
     *   user               — regular registered user
     *   sankalp_member     — active host-org contributor
     *   sankalp_associate  — host-org manager (admin panel access, read-only config)
     *   platform_moderator — review org requests, moderate content (NEW)
     *   master_admin       — full platform control
     */
    role: {
      type: String,
      enum: ["user", "sankalp_member", "sankalp_associate", "platform_moderator", "master_admin"],
      default: "user",
    },
    reputation: {
      type: Number,
      default: 0,
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    proSince: {
      type: Date,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    followers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    profileViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
