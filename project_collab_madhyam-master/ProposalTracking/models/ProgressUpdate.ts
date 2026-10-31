import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgressUpdate extends Document {
  taskId: string;
  userId: string;
  progress: number;
  message: string;
  createdAt: Date;
}

const ProgressUpdateSchema = new Schema<IProgressUpdate>(
  {
    taskId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    progress: { type: Number, required: true, min: 0, max: 100 },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

const ProgressUpdate: Model<IProgressUpdate> =
  mongoose.models.ProgressUpdate ||
  mongoose.model<IProgressUpdate>("ProgressUpdate", ProgressUpdateSchema);

export default ProgressUpdate;
