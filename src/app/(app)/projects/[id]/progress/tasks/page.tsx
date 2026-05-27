"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Clock } from "lucide-react";

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

const STATUS_LABEL: Record<Status, string> = {
  pending: "Backlog", "in-progress": "In Progress", completed: "Completed", delayed: "Delayed",
};

export default function ProgressTasksPage() {
  const params    = useParams<{ id: string }>();
  const projectId = params.id;

  const [tasks, setTasks]     = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchTasks = async (id: string) => {
    const r    = await fetch(`/api/project-progress/tasks/project/${id}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Failed to load tasks");
    setTasks(data.tasks ?? []);
  };

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchTasks(projectId)
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

  const stats = useMemo(() => ({
    total:     tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
  }), [tasks]);

  if (loading) return (
    <div className="flex items-center gap-2 text-muted text-[13px] py-8">
      <Loader2 className="w-4 h-4 animate-spin text-accent" /> Loading tasks…
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-foreground">My Tasks</h2>
          <p className="text-[12px] text-muted mt-0.5">{stats.completed} of {stats.total} completed</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-[13px] text-red-400">{error}</div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => {
          const deadline  = new Date(task.deadline);
          const isOverdue = deadline < new Date() && task.status !== "completed";

          return (
            <div key={task._id} className="bg-surface border border-border-subtle rounded-xl p-5 hover:border-accent/20 transition-colors">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-[240px] space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border capitalize ${PRIORITY_STYLE[task.priority]}`}>
                      {task.priority} priority
                    </span>
                    <p className="text-[14px] font-semibold text-foreground">{task.title}</p>
                  </div>
                  {task.description && (
                    <p className="text-[13px] text-muted leading-relaxed">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-[12px] text-muted">
                    {task.assignedToName && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[9px] font-bold">
                          {task.assignedToName[0]?.toUpperCase()}
                        </div>
                        {task.assignedToName}
                      </div>
                    )}
                    <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
                      <Clock className="w-3 h-3" />
                      {isOverdue ? "Overdue: " : "Due: "}
                      {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[140px]">
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task._id, { status: e.target.value })}
                    className="bg-surface border border-border-subtle rounded-lg px-3 py-1.5 text-[12px] text-foreground outline-none focus:border-accent/40 cursor-pointer"
                  >
                    {(Object.entries(STATUS_LABEL) as [Status, string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <input
                      type="range" min={0} max={100} value={task.progress}
                      onChange={(e) => updateTask(task._id, { progress: Number(e.target.value) })}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-40 border border-dashed border-border-subtle rounded-xl">
            <p className="text-[13px] text-muted">No tasks assigned to this project yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
