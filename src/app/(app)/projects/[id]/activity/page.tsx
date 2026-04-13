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
    const { id: projectId } = useParams();
    const [logs, setLogs] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDateTime = (value: string) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) 
            ? "INITIALIZING..." 
            : date.toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
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
        return <div className="p-6 text-sm text-muted animate-pulse font-mono">RETRIEVING PULSE SIGNAL...</div>;
    }

    if (error) {
        return <div className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl font-mono">SIGNAL_LOST: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase italic px-1">Deployment Pulse</h2>
            <div className="space-y-3">
                {logs.map((log) => (
                    <div key={log._id} className="group relative pl-6 border-l border-border-subtle hover:border-accent transition-colors">
                        <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-surface border border-border-subtle group-hover:bg-accent group-hover:border-accent group-hover:shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all"></div>
                        <div className="rounded-2xl border border-border-subtle bg-surface-alt p-4 group-hover:border-border-strong transition-all">
                            <p className="text-sm font-bold text-foreground leading-tight tracking-tight">{log.action}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-mono font-black text-accent uppercase tracking-widest">{log.userName || "SYSTEM"}</span>
                                <span className="text-[10px] font-mono text-muted">@ {formatDateTime(log.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {logs.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-sm text-muted italic">Pulse is flat. No recent transmissions detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
