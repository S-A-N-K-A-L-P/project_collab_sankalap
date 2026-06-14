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
    const params = useParams<{ id: string }>();
    const projectId = params.id;
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
                <h2 className="text-lg font-semibold text-[#e5e7eb]">Team Overview</h2>
                <div className="mt-3 space-y-2">
                    {members.map((member) => (
                        <div key={member.id} className="rounded-lg border border-[#1f1f23] bg-[#17171a] p-3 flex justify-between">
                            <span className="text-sm text-[#e5e7eb]">{member.name}</span>
                            <span className="text-xs text-[#9ca3af]">{member.taskCount} tasks</span>
                        </div>
                    ))}
                    {members.length === 0 && <p className="text-sm text-[#9ca3af]">No team members assigned yet.</p>}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-lg border border-[#1f1f23] bg-[#17171a] p-4 text-center">
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-[#e5e7eb] mt-2">{value}</p>
        </div>
    );
}
