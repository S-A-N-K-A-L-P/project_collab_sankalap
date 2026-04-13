"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type TaskItem = {
    _id: string;
    title: string;
    description: string;
    assignedTo: string;
    assignedToName?: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "in-progress" | "completed" | "delayed";
    progress: number;
    deadline: string;
};

export default function ProjectTasksPage() {
    const { id: projectId } = useParams();
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchTasks = async (pid: string) => {
        const response = await fetch(`/api/project-progress/tasks/project/${pid}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch tasks");
        }
        setTasks(data.tasks || []);
    };

    useEffect(() => {
        if (!projectId) return;

        let active = true;
        setLoading(true);
        setError(null);

        fetchTasks(projectId as string)
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

    const statusCount = useMemo(
        () => ({
            total: tasks.length,
            completed: tasks.filter((item) => item.status === "completed").length,
        }),
        [tasks]
    );

    const updateTask = async (taskId: string, updates: any) => {
        try {
            const response = await fetch(`/api/project-progress/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update task");
            }

            setTasks((current) =>
                current.map((item) =>
                    item._id === taskId ? { ...item, ...updates } : item
                )
            );
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-muted">Awaiting tactical transmission...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-border-subtle bg-surface p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground italic uppercase">Tactical Ops Node</h2>
                    <p className="text-xs text-muted font-mono uppercase tracking-widest">
                        {statusCount.completed} / {statusCount.total} Targets Neutralized
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-300 font-mono">
                    [ERR_SIGNAL]: {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                    <div key={task._id} className="rounded-2xl border border-border-subtle bg-surface-alt p-5 hover:border-border-strong transition-all">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="flex-1 min-w-[240px] space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                        task.priority === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-accent/30 text-accent bg-accent/5'
                                    }`}>
                                        {task.priority} PRIORITY
                                    </span>
                                    <h3 className="text-[15px] font-bold text-foreground">{task.title}</h3>
                                </div>
                                <p className="text-sm text-muted leading-relaxed">{task.description}</p>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-[8px] font-bold text-muted">
                                            {task.assignedToName?.charAt(0) || "U"}
                                        </div>
                                        <span className="text-xs font-medium text-muted">{task.assignedToName || "Unassigned"}</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-muted uppercase">Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 min-w-[120px]">
                                <select
                                    value={task.status}
                                    onChange={(e) => updateTask(task._id, { status: e.target.value })}
                                    className="bg-surface border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground font-bold uppercase transition-all focus:border-accent outline-none"
                                >
                                    <option value="pending">PENDING</option>
                                    <option value="in-progress">ACTIVE</option>
                                    <option value="completed">VERIFIED</option>
                                    <option value="delayed">DELAYED</option>
                                </select>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
                                        <span>Progress</span>
                                        <span>{task.progress}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={task.progress}
                                        onChange={(e) => updateTask(task._id, { progress: Number(e.target.value) })}
                                        className="w-full h-1 bg-surface rounded-full appearance-none cursor-pointer accent-accent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-border-subtle rounded-3xl">
                        <p className="text-sm text-muted italic">Tactical queue is empty. Awaiting new orders.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
