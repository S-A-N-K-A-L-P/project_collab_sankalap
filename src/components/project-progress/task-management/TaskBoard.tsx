'use client';

import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { Task } from "@/features/project-progress/utils/calculateProjectProgress";

interface TaskBoardProps {
  tasks: Task[];
}

const COLUMNS: { key: Task["status"]; label: string; icon: React.ElementType; color: string; border: string; bg: string }[] = [
  { key: "pending",     label: "Pending",     icon: Clock,         color: "text-amber-400",  border: "border-amber-700/40",  bg: "bg-amber-900/10"  },
  { key: "in-progress", label: "In Progress", icon: Loader2,       color: "text-indigo-400", border: "border-indigo-700/40", bg: "bg-indigo-900/10" },
  { key: "completed",   label: "Completed",   icon: CheckCircle2,  color: "text-emerald-400",border: "border-emerald-700/40",bg: "bg-emerald-900/10"},
];

const PRIORITY_BADGE: Record<Task["priority"], string> = {
  high:   "bg-rose-900/40 text-rose-300 border-rose-700/40",
  medium: "bg-amber-900/40 text-amber-300 border-amber-700/40",
  low:    "bg-slate-700/40 text-slate-400 border-slate-600/40",
};

function isOverdue(deadline: string, status: Task["status"]) {
  return status !== "completed" && new Date(deadline) < new Date();
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        No tasks yet. Create the first task to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        const Icon = col.icon;
        return (
          <div key={col.key} className={`rounded-xl border ${col.border} ${col.bg} p-4 space-y-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={col.color} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>
                {col.label}
              </span>
              <span className="ml-auto text-xs text-slate-500 font-medium">{colTasks.length}</span>
            </div>

            {colTasks.length === 0 ? (
              <div className="text-xs text-slate-600 text-center py-6">No tasks</div>
            ) : (
              colTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-lg border border-slate-700 bg-slate-800/70 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-slate-100 leading-tight">
                      {task.title}
                    </span>
                    <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase ${PRIORITY_BADGE[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{task.assignedToName || task.assignedTo.slice(0, 10)}</span>
                      <span className={isOverdue(task.deadline, task.status) ? "text-rose-400 font-semibold" : ""}>
                        {new Date(task.deadline).toLocaleDateString()}
                        {isOverdue(task.deadline, task.status) && " ⚠"}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{task.progress}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
