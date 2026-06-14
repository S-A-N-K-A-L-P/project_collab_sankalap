import { Schema, model, models } from "mongoose";

const WeeklyReportSchema = new Schema(
    {
        projectId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            default: "",
        },
        completedTasks: {
            type: [String],
            default: [],
        },
        blockers: {
            type: String,
            default: "",
        },
        nextWeekPlan: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const WeeklyReport = models.WeeklyReport || model("WeeklyReport", WeeklyReportSchema);

export default WeeklyReport;