'use client';

import { CheckCircle2, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import type { WeeklyReport } from "@/features/project-progress/types/weekly.types";

interface WeeklyReportCardProps {
  report: WeeklyReport;
}

export default function WeeklyReportCard({ report }: WeeklyReportCardProps) {
  const date = new Date(report.createdAt);
  const dateStr = Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  const initials = report.userName
    ? report.userName.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-200 truncate">{report.userName}</div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar size={10} />
            {dateStr}
          </div>
        </div>
      </div>

      {report.completedTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mb-1.5">
            <CheckCircle2 size={11} /> Completed
          </div>
          <ul className="space-y-1">
            {report.completedTasks.map((task, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="mt-0.5 text-emerald-600">•</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.blockers && (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 mb-1">
            <AlertTriangle size={11} /> Blockers
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{report.blockers}</p>
        </div>
      )}

      {report.nextWeekPlan && (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 mb-1">
            <ArrowRight size={11} /> Next Week
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{report.nextWeekPlan}</p>
        </div>
      )}
    </div>
  );
}
