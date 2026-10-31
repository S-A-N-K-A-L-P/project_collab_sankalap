"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Activity } from "lucide-react";

interface ActivityLogItem {
  _id: string;
  userName?: string;
  action: string;
  createdAt: string;
}

export default function ProjectActivityPage() {
  const { id: projectId } = useParams();
  const [logs, setLogs]   = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/project-progress/activity?projectId=${projectId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load activity");
        if (active) setLogs(data.logs ?? []);
      })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [projectId]);

  if (loading) return (
    <div className="flex items-center gap-2 text-muted text-[13px] py-8">
      <Loader2 className="w-4 h-4 animate-spin text-accent" /> Loading activity log…
    </div>
  );

  if (error) return (
    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-[13px] text-red-400">{error}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-accent" />
        <h2 className="text-[16px] font-semibold text-foreground">Activity Log</h2>
        <span className="text-[12px] text-muted ml-1">({logs.length} entries)</span>
      </div>

      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-surface border border-border-subtle rounded-xl">
          <p className="text-[13px] text-muted">No activity has been recorded for this project yet.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border-subtle rounded-xl divide-y divide-border-subtle overflow-hidden">
          {logs.map((log) => (
            <div key={log._id} className="flex items-start gap-4 px-5 py-4 hover:bg-accent/[0.02] transition-colors">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent/50 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-[13px] text-foreground leading-snug">{log.action}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  {log.userName && <span className="font-medium text-accent">{log.userName}</span>}
                  <span>
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
