'use client';

import { useState } from "react";
import { Send } from "lucide-react";
import type { CreateWeeklyReportInput } from "@/features/project-progress/types/weekly.types";

interface WeeklySubmissionFormProps {
  projectId: string;
  onSubmit: (data: CreateWeeklyReportInput) => Promise<void>;
}

export default function WeeklySubmissionForm({ projectId, onSubmit }: WeeklySubmissionFormProps) {
  const [completedTasksText, setCompletedTasksText] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const completedTasks = completedTasksText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await onSubmit({ projectId, completedTasks, blockers, nextWeekPlan });
      setSuccess(true);
      setCompletedTasksText("");
      setBlockers("");
      setNextWeekPlan("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <h2 className="text-sm font-semibold text-slate-200 mb-5">Submit Weekly Report</h2>

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-900/30 border border-emerald-700/40 px-4 py-2 text-sm text-emerald-300">
          Report submitted successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-rose-900/30 border border-rose-700/40 px-4 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            Completed This Week{" "}
            <span className="text-slate-600">(one item per line)</span>
          </label>
          <textarea
            value={completedTasksText}
            onChange={(e) => setCompletedTasksText(e.target.value)}
            placeholder={"Finished login page\nFixed API timeout bug"}
            rows={4}
            className={`${ta} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">Blockers / Issues</label>
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="Anything blocking progress…"
            rows={2}
            className={`${ta} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">Plan for Next Week</label>
          <textarea
            value={nextWeekPlan}
            onChange={(e) => setNextWeekPlan(e.target.value)}
            placeholder="Goals for next week…"
            rows={2}
            className={`${ta} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Send size={14} />
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

const ta =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors";
