import { Schema, model, models } from "mongoose";

const ProgressUpdateSchema = new Schema(
    {
        taskId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
        },
        progress: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        message: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const ProgressUpdate = models.ProgressUpdate || model("ProgressUpdate", ProgressUpdateSchema);

export default ProgressUpdate;