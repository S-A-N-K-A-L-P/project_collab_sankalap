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
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: "",
    },
    universityLogo: {
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
    roles: {
      type: [String],
      enum: ["user", "pixel_head", "project_lead", "pixel_member", "normal_user"],
      default: ["user"],
    },
    role: { 
      type: String,
      enum: ["user", "pixel_head", "project_lead", "pixel_member", "normal_user"],
      default: "user",
    },
    followers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
