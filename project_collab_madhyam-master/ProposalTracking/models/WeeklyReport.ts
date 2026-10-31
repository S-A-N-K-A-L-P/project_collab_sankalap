import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWeeklyReport extends Document {
  projectId: string;
  userId: string;
  userName?: string;
  completedTasks: string[];
  blockers: string;
  nextWeekPlan: string;
  createdAt: Date;
}

const WeeklyReportSchema = new Schema<IWeeklyReport>(
  {
    projectId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, default: "" },
    completedTasks: { type: [String], default: [] },
    blockers: { type: String, default: "" },
    nextWeekPlan: { type: String, default: "" },
  },
  { timestamps: true }
);

const WeeklyReport: Model<IWeeklyReport> =
  mongoose.models.WeeklyReport ||
  mongoose.model<IWeeklyReport>("WeeklyReport", WeeklyReportSchema);

export default WeeklyReport;
