import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema(
    {
        projectId: {
            type: String,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        assignedTo: {
            type: String,
            required: true,
        },
        assignedToName: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "delayed"],
            default: "pending",
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        deadline: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const Task = models.Task || model("Task", TaskSchema);

export default Task;