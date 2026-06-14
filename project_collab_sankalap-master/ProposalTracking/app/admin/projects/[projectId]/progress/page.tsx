"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProjectProgressProvider, useProjectProgress } from "@/context/ProjectProgressContext";
import ProjectProgressSummary from "@/components/project-progress/progress/ProjectProgressSummary";
import TeamOverview from "@/components/project-progress/team/TeamOverview";
import { getProjectProgressSummary } from "@/features/project-progress/utils/calculateProjectProgress";
import { BarChart3, ListTodo, Users, Clock, Activity } from "lucide-react";

const NAV_TABS = [
  { label: "Dashboard", href: "", icon: BarChart3 },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Team", href: "/team", icon: Users },
  { label: "Weekly Review", href: "/weekly-review", icon: Clock },
  { label: "Activity", href: "/activity", icon: Activity },
];

function ProgressDashboardContent({ projectId }: { projectId: string }) {
  const { tasks, loading, fetchTasks } = useProjectProgress();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const summary = getProjectProgressSummary(tasks);
  const members = Array.from(
    new Map(
      tasks.map((t) => [
        t.assignedTo,
        { userId: t.assignedTo, name: t.assignedToName ?? "", role: "pixel_member" },
      ])
    ).values()
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="text-indigo-400 font-black text-lg tracking-tight">PIXEL</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300 text-sm font-medium truncate max-w-[140px]">
              {projectId}
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.label}
                href={`/admin/projects/${projectId}/progress${tab.href}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Project Progress</h1>
          <p className="text-slate-400 text-sm">Overview of all tasks and team performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
            Loading…
          </div>
        ) : (
          <>
            <ProjectProgressSummary summary={summary} />
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Team Members</h2>
              <TeamOverview members={members} tasks={tasks} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ProgressPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProgressProvider projectId={projectId}>
      <ProgressDashboardContent projectId={projectId} />
    </ProjectProgressProvider>
  );
}