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
    const { id: projectId } = useParams();
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
        return <div className="p-6 text-sm text-muted">Node synchronization in progress...</div>;
    }

    if (error) {
        return <div className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase italic px-1">Collective Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-border-subtle bg-surface-alt p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-foreground">{member.name}</p>
                            <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/20">
                                {member.avgProgress}% SYNC
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${member.avgProgress}%` }}></div>
                            </div>
                            <p className="text-[10px] text-muted uppercase tracking-wider font-mono">
                                Nodes: {member.total} | Verified: {member.completed}
                            </p>
                        </div>
                    </div>
                ))}
                {members.length === 0 && <p className="text-sm text-muted italic p-1">No active collective signals detected.</p>}
            </div>
        </div>
    );
}
