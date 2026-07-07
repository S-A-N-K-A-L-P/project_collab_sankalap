import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  projectId: string;
  userId: string;
  userName?: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    projectId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, default: "" },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
