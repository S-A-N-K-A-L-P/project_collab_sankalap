"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Clock, CheckCircle2, AlertTriangle, Circle } from "lucide-react";

type Status   = "pending" | "in-progress" | "completed" | "delayed";
type Priority = "low" | "medium" | "high";

interface TaskItem {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  priority: Priority;
  status: Status;
  progress: number;
  deadline: string;
}

const PRIORITY_STYLE: Record<Priority, string> = {
  high:   "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low:    "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const STATUS_STYLE: Record<Status, string> = {
  pending:      "text-slate-400 bg-slate-500/10 border-slate-500/20",
  "in-progress":"text-blue-400 bg-blue-500/10 border-blue-500/20",
  completed:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  delayed:      "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Backlog", "in-progress": "In Progress", completed: "Completed", delayed: "Delayed",
};

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-border-subtle overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-accent" : "bg-amber-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted w-7 text-right">{pct}%</span>
    </div>
  );
}

export default function ProjectTasksPage() {
  const { id: projectId } = useParams();
  const [tasks, setTasks]         = useState<TaskItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchTasks = async (pid: string) => {
    const r    = await fetch(`/api/project-progress/tasks/project/${pid}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Failed to load tasks");
    setTasks(data.tasks ?? []);
  };

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchTasks(projectId as string)
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  const updateTask = async (taskId: string, updates: { status?: string; progress?: number }) => {
    const r = await fetch(`/api/project-progress/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (r.ok) setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, ...updates } as TaskItem : t));
  };

  const completed = tasks.filter(t => t.status === "completed").length;

  if (loading) return (
    <div className="flex items-center gap-2 text-muted text-[13px] py-8">
      <Loader2 className="w-4 h-4 animate-spin text-accent" /> Loading tasks…
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-foreground">Task Board</h2>
          <p className="text-[12px] text-muted mt-0.5">{completed} of {tasks.length} completed</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-[13px] text-red-400">{error}</div>
      )}

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-surface border border-dashed border-border-subtle rounded-xl">
          <p className="text-[13px] text-muted">No tasks have been assigned to this project yet.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden divide-y divide-border-subtle">
          {tasks.map((task) => {
            const deadline = new Date(task.deadline);
            const isOverdue = deadline < new Date() && task.status !== "completed";
            const daysLeft  = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);

            return (
              <div key={task._id} className="flex items-start gap-4 px-5 py-4 hover:bg-accent/[0.02] transition-colors group">
                {/* Dot */}
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-border-subtle flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-3 justify-between">
                    <div className="min-w-0">
                      <p className={`text-[13px] font-semibold leading-snug ${
                        task.status === "completed" ? "text-muted line-through" : "text-foreground"
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[12px] text-muted mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                    <div className={`flex-shrink-0 flex items-center gap-1 text-[11px] ${
                      isOverdue ? "text-red-400" : daysLeft <= 2 ? "text-amber-400" : "text-muted"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {isOverdue
                        ? `${Math.abs(daysLeft)}d overdue`
                        : daysLeft === 0 ? "Due today"
                        : deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border capitalize ${PRIORITY_STYLE[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${STATUS_STYLE[task.status]}`}>
                      {STATUS_LABEL[task.status]}
                    </span>
                    {task.assignedToName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted">
                        <div className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[8px] font-bold flex items-center justify-center">
                          {task.assignedToName[0]?.toUpperCase()}
                        </div>
                        {task.assignedToName}
                      </div>
                    )}
                  </div>

                  <ProgressBar value={task.progress} />
                </div>

                {/* Controls — shown on hover */}
                <div className="flex-shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task._id, { status: e.target.value })}
                    className="py-1 px-2 bg-background border border-border-subtle rounded-lg text-[11px] text-muted outline-none focus:border-accent/40 cursor-pointer"
                  >
                    <option value="pending">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                  <input
                    type="range" min={0} max={100} value={task.progress}
                    onChange={(e) => updateTask(task._id, { progress: Number(e.target.value) })}
                    className="w-28 h-1 appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
