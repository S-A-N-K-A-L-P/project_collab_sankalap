"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectProgressProvider, useProjectProgress } from "@/context/ProjectProgressContext";
import TaskBoard from "@/components/project-progress/task-management/TaskBoard";
import TaskForm from "@/components/project-progress/task-management/TaskForm";
import { Button } from "@/components/ui/button";
import { CreateTaskInput } from "@/features/project-progress/types/task.types";
import { createSupabaseClient } from "@/lib/auth";
import { Plus } from "lucide-react";

function TasksContent({ projectId }: { projectId: string }) {
  const { tasks, loading, fetchTasks } = useProjectProgress();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data: CreateTaskInput) => {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...data, role: "admin" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create task");
    }

    await fetchTasks();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Task Board</h1>
            <p className="text-slate-400 text-sm mt-0.5">{tasks.length} tasks</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            New Task
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading tasks…</div>
        ) : (
          <TaskBoard tasks={tasks} />
        )}
      </div>

      {showForm && (
        <TaskForm
          projectId={projectId}
          onSubmit={handleCreateTask}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default function TasksPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProgressProvider projectId={projectId}>
      <TasksContent projectId={projectId} />
    </ProjectProgressProvider>
  );
}
