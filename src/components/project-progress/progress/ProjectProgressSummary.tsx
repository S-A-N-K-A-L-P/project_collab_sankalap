'use client';

import { CheckCircle2, Clock, AlertTriangle, TrendingUp, ListTodo, Flame } from "lucide-react";
import type { ProjectProgressSummaryData } from "@/features/project-progress/utils/calculateProjectProgress";

interface ProjectProgressSummaryProps {
  summary: ProjectProgressSummaryData;
}

export default function ProjectProgressSummary({ summary }: ProjectProgressSummaryProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: summary.total,
      icon: ListTodo,
      color: "text-slate-300",
      bg: "bg-slate-700/50",
      border: "border-slate-600",
    },
    {
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-900/20",
      border: "border-emerald-700/40",
    },
    {
      label: "In Progress",
      value: summary.inProgress,
      icon: TrendingUp,
      color: "text-indigo-400",
      bg: "bg-indigo-900/20",
      border: "border-indigo-700/40",
    },
    {
      label: "Pending",
      value: summary.pending,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-900/20",
      border: "border-amber-700/40",
    },
    {
      label: "Overdue",
      value: summary.overdue,
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-900/20",
      border: "border-rose-700/40",
    },
    {
      label: "High Priority Open",
      value: summary.byPriority.high,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-900/20",
      border: "border-orange-700/40",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${s.bg} ${s.border}`}
          >
            <s.icon size={18} className={s.color} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Overall Progress</span>
          <span className="text-sm font-bold text-indigo-400">{summary.overallProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${summary.overallProgress}%` }}
          />
        </div>
        {summary.total > 0 && (
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span>{summary.completed} done</span>
            <span>{summary.inProgress} active</span>
            <span>{summary.pending} queued</span>
            {summary.overdue > 0 && (
              <span className="text-rose-400">{summary.overdue} overdue</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
