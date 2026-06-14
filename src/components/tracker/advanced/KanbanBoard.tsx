"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, ArrowRight, History,
  Zap, Settings, Workflow, Clock, ChevronDown
} from "lucide-react";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KanbanTask {
  _id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "delayed";
  progress: number;
  deadline: string;
  assignedTo: string;
  assignedToName?: string;
}

export interface KanbanColumnDef {
  id: string;
  title: string;
  status: string;
  accent: string;
  tasks: KanbanTask[];
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY = {
  high:   { label: "High",   dot: "bg-red-400",    text: "text-red-400"    },
  medium: { label: "Medium", dot: "bg-amber-400",  text: "text-amber-400"  },
  low:    { label: "Low",    dot: "bg-slate-400",  text: "text-slate-400"  },
} as const;

const STATUS_LABELS: Record<string, string> = {
  pending:      "Backlog",
  "in-progress":"In Progress",
  completed:    "Completed",
  delayed:      "Delayed",
};

// ─── Board ───────────────────────────────────────────────────────────────────

export function KanbanBoard({
  columns,
  onTaskUpdate,
}: {
  columns: KanbanColumnDef[];
  onTaskUpdate?: (taskId: string, updates: { status?: string; progress?: number }) => void;
}) {
  if (columns.length === 0 || columns.every((c) => c.tasks.length === 0)) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border-subtle">
        <p className="text-[13px] text-muted">No tasks have been assigned to this project yet.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <KanbanColumn key={col.id} column={col} onTaskUpdate={onTaskUpdate} />
      ))}
    </div>
  );
}

// ─── Column ──────────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  onTaskUpdate,
}: {
  column: KanbanColumnDef;
  onTaskUpdate?: (taskId: string, updates: { status?: string; progress?: number }) => void;
}) {
  return (
    <div className="w-[260px] shrink-0 space-y-2">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 pb-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: column.accent }} />
        <span className="text-[12px] font-semibold text-foreground">{column.title}</span>
        <span className="text-[11px] text-muted bg-surface border border-border-subtle rounded-full px-1.5 py-0 leading-5">
          {column.tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[60px]">
        {column.tasks.map((task, i) => (
          <KanbanCard key={task._id} task={task} index={i} onTaskUpdate={onTaskUpdate} />
        ))}
        {column.tasks.length === 0 && (
          <div className="h-16 rounded-lg border border-dashed border-border-subtle flex items-center justify-center">
            <span className="text-[11px] text-muted">Empty</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function KanbanCard({
  task,
  index,
  onTaskUpdate,
}: {
  task: KanbanTask;
  index: number;
  onTaskUpdate?: (taskId: string, updates: { status?: string; progress?: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const pri = PRIORITY[task.priority] ?? PRIORITY.medium;

  const deadline    = new Date(task.deadline);
  const isOverdue   = deadline < new Date() && task.status !== "completed";
  const daysLeft    = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
  const deadlineStr = isOverdue
    ? `${Math.abs(daysLeft)}d overdue`
    : daysLeft === 0 ? "Due today"
    : `${daysLeft}d`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-surface border border-border-subtle rounded-lg p-3 hover:border-accent/30 transition-all group cursor-default"
    >
      {/* Priority + status row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
          <span className={`text-[10px] font-medium ${pri.text}`}>{pri.label}</span>
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-0.5 text-[10px] text-muted hover:text-foreground transition-colors"
          >
            {STATUS_LABELS[task.status] ?? task.status}
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {open && (
            <div className="absolute right-0 top-5 z-20 bg-surface border border-border-subtle rounded-lg shadow-lg py-1 w-32">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setOpen(false); onTaskUpdate?.(task._id, { status: val }); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                    task.status === val
                      ? "text-accent font-medium"
                      : "text-muted hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <p className={`text-[12px] font-semibold leading-snug mb-2 ${
        task.status === "completed" ? "text-muted line-through" : "text-foreground"
      }`}>
        {task.title}
      </p>

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="mb-2">
          <div className="h-1 rounded-full bg-border-subtle overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                task.progress >= 100 ? "bg-emerald-500" :
                task.progress >= 50  ? "bg-accent"      : "bg-amber-500"
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[8px] font-bold">
            {task.assignedToName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="truncate max-w-[80px]">{task.assignedToName ?? "Unassigned"}</span>
        </div>
        <span className={`flex items-center gap-0.5 ${isOverdue ? "text-red-400" : daysLeft <= 2 ? "text-amber-400" : ""}`}>
          <Clock className="w-2.5 h-2.5" />
          {deadlineStr}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Legacy exports (used by project_tracker demo page) ──────────────────────

export function WorkflowStages({ stages }: { stages: any[] }) {
  return (
    <div className="p-6 bg-surface border border-border-subtle rounded-xl space-y-6">
      <div className="flex items-center gap-2">
        <Workflow className="w-4 h-4 text-accent" />
        <h4 className="text-[14px] font-semibold text-foreground">Project Stages</h4>
      </div>
      <div className="flex items-center justify-between gap-3">
        {stages.map((stage, i) => (
          <div key={stage.label} className="relative flex-1 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              stage.status === "completed" ? "bg-accent/10 border-accent text-accent"            :
              stage.status === "active"   ? "bg-amber-500/10 border-amber-400 text-amber-400 animate-pulse" :
              "bg-surface border-border-subtle text-muted"
            }`}>
              {stage.status === "completed"
                ? <CheckCircle2 className="w-4 h-4" />
                : <Circle className="w-4 h-4" />
              }
            </div>
            <span className="text-[10px] font-medium text-muted text-center">{stage.label}</span>
            {i < stages.length - 1 && (
              <div className="absolute top-4 left-[calc(50%+18px)] w-[calc(100%-36px)] h-px bg-border-subtle">
                <ArrowRight className="absolute -right-2 -top-1.5 w-3 h-3 text-muted" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AutomationRules({ rules }: { rules: any[] }) {
  return (
    <div className="p-5 bg-surface border border-border-subtle rounded-xl space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        <h5 className="text-[13px] font-semibold text-foreground">Automation Rules</h5>
      </div>
      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div key={i} className="p-3 bg-background border border-border-subtle rounded-lg flex items-center justify-between hover:border-accent/20 transition-all">
            <div>
              <p className="text-[12px] font-medium text-foreground">{rule.trigger}</p>
              <p className="text-[10px] text-muted mt-0.5">If {rule.event} → {rule.action}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskHistory({ logs }: { logs: any[] }) {
  return (
    <div className="p-5 bg-surface border border-border-subtle rounded-xl space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-accent" />
        <h5 className="text-[13px] font-semibold text-foreground">Task History</h5>
      </div>
      <div className="space-y-3">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/50 mt-1" />
              {i < logs.length - 1 && <span className="w-px flex-1 bg-border-subtle mt-1" />}
            </div>
            <div className="pb-3">
              <p className="text-[12px] text-foreground leading-tight">
                <span className="font-medium">{log.user}</span> {log.action}
              </p>
              <span className="text-[10px] text-muted">{log.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
