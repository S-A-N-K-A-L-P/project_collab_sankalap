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
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
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
        return <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 text-sm text-[#9ca3af]">Loading activity...</div>;
    }

    if (error) {
        return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
    }

    return (
        <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5">
            <h2 className="text-lg font-semibold text-[#e5e7eb]">Recent Activity</h2>
            <div className="mt-4 space-y-2">
                {logs.map((log) => (
                    <div key={log._id} className="rounded-lg border border-[#1f1f23] bg-[#17171a] p-3">
                        <p className="text-sm text-[#e5e7eb]">{log.action}</p>
                        <p className="text-xs text-[#9ca3af] mt-1">
                            {log.userName || "Unknown"} | {formatDateTime(log.createdAt)}
                        </p>
                    </div>
                ))}
                {logs.length === 0 ? <p className="text-sm text-[#9ca3af]">No activity yet.</p> : null}
            </div>
        </div>
    );
}