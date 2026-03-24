"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectProgressProvider, useProjectProgress } from "@/context/ProjectProgressContext";
import ActivityFeed from "@/components/project-progress/activity/ActivityFeed";

function ActivityContent() {
  const { activityLogs, loading, fetchActivityLogs } = useProjectProgress();

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Activity History</h1>
        <p className="text-slate-400 text-sm mb-8">
          Chronological log of all actions in this project.
        </p>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading activity…</div>
        ) : (
          <ActivityFeed logs={activityLogs} />
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProgressProvider projectId={projectId}>
      <ActivityContent />
    </ProjectProgressProvider>
  );
}
