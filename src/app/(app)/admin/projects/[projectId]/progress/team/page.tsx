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

export default function ProjectTeamPage() {
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
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch tasks");
                }
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

    const members = useMemo(() => {
        const grouped = new Map<
            string,
            { id: string; name: string; total: number; completed: number; avgProgress: number }
        >();

        tasks.forEach((task) => {
            const key = task.assignedTo;
            const existing = grouped.get(key) || {
                id: key,
                name: task.assignedToName || key,
                total: 0,
                completed: 0,
                avgProgress: 0,
            };

            existing.total += 1;
            existing.completed += task.status === "completed" ? 1 : 0;
            existing.avgProgress += task.progress || 0;

            grouped.set(key, existing);
        });

        return Array.from(grouped.values()).map((member) => ({
            ...member,
            avgProgress: member.total ? Math.round(member.avgProgress / member.total) : 0,
        }));
    }, [tasks]);

    if (loading) {
        return <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 text-sm text-[#9ca3af]">Loading team data...</div>;
    }

    if (error) {
        return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
    }

    return (
        <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5">
            <h2 className="text-lg font-semibold text-[#e5e7eb]">Team Analytics</h2>
            <div className="mt-4 space-y-2">
                {members.map((member) => (
                    <div key={member.id} className="rounded-lg border border-[#1f1f23] bg-[#17171a] p-3">
                        <p className="text-sm font-medium text-[#e5e7eb]">{member.name}</p>
                        <p className="text-xs text-[#9ca3af] mt-1">
                            Tasks: {member.total} | Completed: {member.completed} | Avg progress: {member.avgProgress}%
                        </p>
                    </div>
                ))}
                {members.length === 0 ? <p className="text-sm text-[#9ca3af]">No team members assigned yet.</p> : null}
            </div>
        </div>
    );
}