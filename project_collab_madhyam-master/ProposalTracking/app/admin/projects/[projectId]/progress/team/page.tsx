"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectProgressProvider, useProjectProgress } from "@/context/ProjectProgressContext";
import TeamOverview from "@/components/project-progress/team/TeamOverview";
import { Users } from "lucide-react";

function TeamContent() {
  const { tasks, loading, fetchTasks } = useProjectProgress();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Derive unique members from tasks
  const members = Array.from(
    new Map(
      tasks.map((t) => [
        t.assignedTo,
        {
          userId: t.assignedTo,
          name: t.assignedToName ?? t.assignedTo.slice(0, 10),
          role: "pixel_member",
          // infer last activity from most recent task update
          lastUpdateAt: undefined as string | undefined,
        },
      ])
    ).values()
  );

  const activeCount = members.length;
  const completionRate =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((t) => t.status === "completed").length / tasks.length) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Team Analytics</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {activeCount} members · {completionRate}% overall completion
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users size={16} />
            <span>{activeCount} member{activeCount !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading team data…</div>
        ) : (
          <TeamOverview members={members} tasks={tasks} />
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProgressProvider projectId={projectId}>
      <TeamContent />
    </ProjectProgressProvider>
  );
}
