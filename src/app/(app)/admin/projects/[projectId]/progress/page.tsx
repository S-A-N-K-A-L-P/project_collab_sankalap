"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type TaskItem = {
    _id: string;
    assignedTo: string;
    assignedToName?: string;
    status: "pending" | "in-progress" | "completed" | "delayed";
    progress: number;
};

export default function ProjectProgressDashboardPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;

        let active = true;
        setLoading(true);
        setError(null);

        fetch(`/api/project-progress/tasks/project/${projectId}`)
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to fetch tasks");
                }
                return res.json();
            })
            .then((data) => {
                if (active) setTasks(data.tasks || []);
            })
            .catch((err: Error) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [projectId]);

    const summary = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.status === "completed").length;
        const inProgress = tasks.filter((task) => task.status === "in-progress").length;
        const pending = tasks.filter((task) => task.status === "pending").length;
        const delayed = tasks.filter((task) => task.status === "delayed").length;
        const avgProgress = total
            ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / total)
            : 0;

        return { total, completed, inProgress, pending, delayed, avgProgress };
    }, [tasks]);

    const members = useMemo(
        () =>
            Array.from(
                new Map(
                    tasks.map((task) => [
                        task.assignedTo,
                        {
                            id: task.assignedTo,
                            name: task.assignedToName || task.assignedTo,
                            taskCount: tasks.filter((item) => item.assignedTo === task.assignedTo).length,
                        },
                    ])
                ).values()
            ),
        [tasks]
    );

    if (loading) {
        return <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 text-sm text-[#9ca3af]">Loading progress summary...</div>;
    }

    if (error) {
        return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricCard label="Total Tasks" value={summary.total} />
                <MetricCard label="Completed" value={summary.completed} />
                <MetricCard label="In Progress" value={summary.inProgress} />
                <MetricCard label="Pending" value={summary.pending} />
                <MetricCard label="Delayed" value={summary.delayed} />
                <MetricCard label="Avg Progress" value={`${summary.avgProgress}%`} />
            </div>

            <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5">
                <h2 className="text-sm font-semibold text-[#e5e7eb]">Team Overview</h2>
                {members.length === 0 ? (
                    <p className="text-sm text-[#9ca3af] mt-2">No team activity found yet.</p>
                ) : (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {members.map((member) => (
                            <div key={member.id} className="rounded-xl border border-[#1f1f23] bg-[#17171a] p-3">
                                <p className="text-sm font-medium text-[#e5e7eb]">{member.name}</p>
                                <p className="text-xs text-[#9ca3af] mt-1">{member.taskCount} assigned tasks</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-xl border border-[#1f1f23] bg-[#121214] p-4">
            <p className="text-[11px] uppercase tracking-wide font-bold text-[#9ca3af]">{label}</p>
            <p className="text-lg font-bold text-[#e5e7eb] mt-1">{value}</p>
        </div>
    );
}