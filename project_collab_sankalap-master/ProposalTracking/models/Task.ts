import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  projectId: string;
  title: string;
  description: string;
  assignedTo: string; // userId (Supabase UID)
  assignedToName?: string;
  status: "pending" | "in-progress" | "completed" | "delayed";
  progress: number; // 0–100
  priority: "low" | "medium" | "high";
  deadline: Date;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assignedTo: { type: String, required: true },
    assignedToName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "delayed"],
      default: "pending",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
