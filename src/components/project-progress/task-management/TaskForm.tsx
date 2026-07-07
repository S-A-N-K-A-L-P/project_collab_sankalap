'use client';

import { useState } from "react";
import { X } from "lucide-react";
import type { CreateTaskInput } from "@/features/project-progress/types/task.types";

interface TaskFormProps {
  projectId: string;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onClose: () => void;
}

export default function TaskForm({ projectId, onSubmit, onClose }: TaskFormProps) {
  const [form, setForm] = useState<Omit<CreateTaskInput, "projectId">>({
    title: "",
    description: "",
    assignedTo: "",
    assignedToName: "",
    priority: "medium",
    deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo || !form.deadline) {
      setError("Title, assigned user, and deadline are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, projectId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-100">New Task</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-900/30 border border-rose-700/40 px-4 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}

          <Field label="Title *">
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="Task title"
              className={inputCls}
              required
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Optional details…"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Assigned To (ID) *">
              <input
                value={form.assignedTo}
                onChange={set("assignedTo")}
                placeholder="user-id"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Display Name">
              <input
                value={form.assignedToName}
                onChange={set("assignedToName")}
                placeholder="Alice"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <select value={form.priority} onChange={set("priority")} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Deadline *">
              <input
                type="date"
                value={form.deadline}
                onChange={set("deadline")}
                className={inputCls}
                required
              />
            </Field>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2 text-sm font-semibold text-white transition-colors"
            >
              {submitting ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors";
