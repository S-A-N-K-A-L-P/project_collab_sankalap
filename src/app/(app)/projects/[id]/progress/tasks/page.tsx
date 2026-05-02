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
    const params = useParams<{ id: string }>();
    const projectId = params.id;
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        assignedToName: "",
        priority: "medium" as "low" | "medium" | "high",
        deadline: "",
    });

    const fetchTasks = async (id: string) => {
        const response = await fetch(`/api/project-progress/tasks/project/${id}`);
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

        fetchTasks(projectId)
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

    const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!projectId) return;

        setSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/project-progress/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, projectId }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create task");
            }

            await fetchTasks(projectId);
            setFormOpen(false);
            setForm({
                title: "",
                description: "",
                assignedTo: "",
                assignedToName: "",
                priority: "medium",
                deadline: "",
            });
        } catch (err: any) {
            setError(err.message || "Failed to create task");
        } finally {
            setSaving(false);
        }
    };

    const updateTask = async (taskId: string, updates: { status?: string; progress?: number }) => {
        const response = await fetch(`/api/project-progress/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to update task");
        }

        setTasks((current) =>
            current.map((item) => 
                item._id === taskId 
                    ? { ...item, ...updates as Partial<typeof item> } 
                    : item
            )
        );
    };

    if (loading) {
        return <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 text-sm text-[#9ca3af]">Loading tasks...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-[#e5e7eb]">Task Board</h2>
                    <p className="text-sm text-[#9ca3af] mt-1">
                        {statusCount.completed}/{statusCount.total} tasks completed
                    </p>
                </div>
                <button
                    onClick={() => setFormOpen((state) => !state)}
                    className="rounded-lg bg-[#6366f1] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4f46e5]"
                >
                    {formOpen ? "Close" : "New Task"}
                </button>
            </div>

            {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
            ) : null}

            {formOpen ? (
                <form onSubmit={handleCreateTask} className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5 space-y-3">
                    <input
                        value={form.title}
                        onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
                        placeholder="Task title"
                        required
                        className="w-full rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none"
                    />
                    <textarea
                        value={form.description}
                        onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                        placeholder="Description"
                        className="w-full rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            value={form.assignedTo}
                            onChange={(event) => setForm((state) => ({ ...state, assignedTo: event.target.value }))}
                            placeholder="Assigned user ID"
                            required
                            className="rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none"
                        />
                        <input
                            value={form.assignedToName}
                            onChange={(event) => setForm((state) => ({ ...state, assignedToName: event.target.value }))}
                            placeholder="Assigned user name"
                            className="rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none"
                        />
                        <select
                            value={form.priority}
                            onChange={(event) =>
                                setForm((state) => ({ ...state, priority: event.target.value as "low" | "medium" | "high" }))
                            }
                            className="rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <input
                        value={form.deadline}
                        onChange={(event) => setForm((state) => ({ ...state, deadline: event.target.value }))}
                        type="date"
                        required
                        className="rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none"
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm font-semibold text-[#e5e7eb] hover:border-[#2a2a2f] disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Create Task"}
                    </button>
                </form>
            ) : null}

            <div className="space-y-2">
                {tasks.map((task) => (
                    <div key={task._id} className="rounded-xl border border-[#1f1f23] bg-[#121214] p-4">
                        <div className="flex flex-wrap justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-[#e5e7eb]">{task.title}</p>
                                <p className="text-xs text-[#9ca3af] mt-1">{task.description || "No description"}</p>
                                <p className="text-xs text-[#9ca3af] mt-1">
                                    Assigned to: {task.assignedToName || task.assignedTo} | Priority: {task.priority}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <select
                                    value={task.status}
                                    onChange={(event) => updateTask(task._id, { status: event.target.value })}
                                    className="rounded border border-[#1f1f23] bg-[#17171a] px-2 py-1 text-xs text-[#e5e7eb]"
                                >
                                    <option value="pending">pending</option>
                                    <option value="in-progress">in-progress</option>
                                    <option value="completed">completed</option>
                                    <option value="delayed">delayed</option>
                                </select>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={task.progress}
                                    onChange={(event) => updateTask(task._id, { progress: Number(event.target.value) })}
                                    className="w-24 rounded border border-[#1f1f23] bg-[#17171a] px-2 py-1 text-xs text-[#e5e7eb]"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 ? (
                    <div className="rounded-xl border border-[#1f1f23] bg-[#121214] p-4 text-sm text-[#9ca3af]">
                        No tasks yet for this project.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
