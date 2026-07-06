'use client';

import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/features/project-progress/utils/calculateProjectProgress";

interface TeamMember {
  userId: string;
  name: string;
  role: string;
}

interface TeamOverviewProps {
  members: TeamMember[];
  tasks: Task[];
}

export default function TeamOverview({ members, tasks }: TeamOverviewProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No team members assigned yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.assignedTo === member.userId);
        const completed = memberTasks.filter((t) => t.status === "completed").length;
        const inProgress = memberTasks.filter((t) => t.status === "in-progress").length;
        const pending = memberTasks.filter((t) => t.status === "pending").length;
        const overdue = memberTasks.filter(
          (t) => t.status !== "completed" && new Date(t.deadline) < new Date()
        ).length;
        const avgProgress =
          memberTasks.length === 0
            ? 0
            : Math.round(
                memberTasks.reduce((sum, t) => sum + t.progress, 0) / memberTasks.length
              );
        const initials = member.name
          ? member.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
          : "?";

        return (
          <div
            key={member.userId}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-100 truncate">
                  {member.name || "Unknown"}
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {member.role.replace("_", " ")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-900/20 border border-emerald-700/30 p-2">
                <CheckCircle2 size={14} className="text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-emerald-400">{completed}</div>
                <div className="text-xs text-slate-500">Done</div>
              </div>
              <div className="rounded-lg bg-indigo-900/20 border border-indigo-700/30 p-2">
                <Clock size={14} className="text-indigo-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-indigo-400">{inProgress}</div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
              <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 p-2">
                <AlertCircle size={14} className="text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-amber-400">{pending}</div>
                <div className="text-xs text-slate-500">Queued</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400">Avg Progress</span>
                <span className="text-xs font-semibold text-indigo-400">{avgProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>

            {overdue > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle size={12} />
                {overdue} task{overdue > 1 ? "s" : ""} overdue
              </div>
            )}

            {memberTasks.length === 0 && (
              <div className="text-xs text-slate-500 text-center">No tasks assigned</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
