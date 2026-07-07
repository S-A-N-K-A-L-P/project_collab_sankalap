"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

type TaskItem = {
  _id: string;
  assignedTo: string;
  assignedToName?: string;
  status: "pending" | "in-progress" | "completed" | "delayed";
  progress: number;
};

export default function ProjectTeamPage() {
  const { id: projectId } = useParams();
  const [tasks, setTasks]     = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/project-progress/tasks/project/${projectId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load team data");
        if (active) setTasks(data.tasks ?? []);
      })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [projectId]);

  const members = useMemo(() => {
    const grouped = new Map<string, {
      id: string; name: string; total: number; completed: number; avgProgress: number;
    }>();

    for (const t of tasks) {
      const id   = t.assignedTo;
      const name = t.assignedToName ?? id;
      if (!grouped.has(id)) {
        grouped.set(id, { id, name, total: 0, completed: 0, avgProgress: 0 });
      }
      const m = grouped.get(id)!;
      m.total++;
      if (t.status === "completed") m.completed++;
      m.avgProgress += t.progress;
    }

    return Array.from(grouped.values()).map((m) => ({
      ...m, avgProgress: m.total ? Math.round(m.avgProgress / m.total) : 0,
    }));
  }, [tasks]);

  if (loading) return (
    <div className="flex items-center gap-2 text-muted text-[13px] py-8">
      <Loader2 className="w-4 h-4 animate-spin text-accent" /> Loading team data…
    </div>
  );

  if (error) return (
    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-[13px] text-red-400">{error}</div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-[16px] font-semibold text-foreground">Team Overview</h2>

      {members.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-surface border border-dashed border-border-subtle rounded-xl">
          <p className="text-[13px] text-muted">No team members have been assigned tasks yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3 hover:border-accent/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[13px] font-bold">
                  {member.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{member.name}</p>
                  <p className="text-[11px] text-muted">{member.completed} of {member.total} tasks completed</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Avg. progress</span>
                  <span>{member.avgProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      member.avgProgress >= 100 ? "bg-emerald-500" :
                      member.avgProgress >= 60  ? "bg-accent"      : "bg-amber-500"
                    }`}
                    style={{ width: `${member.avgProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
