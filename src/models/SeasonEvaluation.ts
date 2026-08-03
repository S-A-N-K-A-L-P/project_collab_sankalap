import { Schema, model, models } from "mongoose";

const RubricScoreSchema = new Schema({
  criterionKey: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  comment: { type: String, default: "" },
}, { _id: false });

const SeasonEvaluationSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  judgeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rubricScores: { type: [RubricScoreSchema], default: [] },
  totalScore: { type: Number, default: 0, min: 0, max: 100 },
  feedback: { type: String, default: "" },
  conflictDeclared: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "submitted", "locked"], default: "draft" },
  submittedAt: Date,
}, { timestamps: true });

SeasonEvaluationSchema.index({ seasonId: 1, projectId: 1, judgeId: 1 }, { unique: true });
SeasonEvaluationSchema.index({ seasonId: 1, status: 1 });

const SeasonEvaluation = models.SeasonEvaluation || model("SeasonEvaluation", SeasonEvaluationSchema);
export default SeasonEvaluation;
