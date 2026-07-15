"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ActivityLogItem = {
    _id: string;
    userName?: string;
    action: string;
    createdAt: string;
};

export default function ProjectActivityPage() {
    const params = useParams<{ id: string }>();
    const projectId = params.id;
    const [logs, setLogs] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDateTime = (value: string) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "unknown-datetime" : `${date.toISOString().split("T")[0]} ${date.toISOString().slice(11, 16)}`;
    };

    useEffect(() => {
        if (!projectId) return;

        let active = true;
        setLoading(true);
        setError(null);

        fetch(`/api/project-progress/activity?projectId=${projectId}`)
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch activity");
                }
                if (active) setLogs(data.logs || []);
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

    if (loading) {
        return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading activity...</div>;
    }

    if (error) {
        return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <div className="mt-4 space-y-2">
                {logs.map((log) => (
                    <div key={log._id} className="rounded-lg border border-border bg-muted-bg p-3">
                        <p className="text-sm text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {log.userName || "Unknown"} | {formatDateTime(log.createdAt)}
                        </p>
                    </div>
                ))}
                {logs.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
            </div>
        </div>
    );
}
