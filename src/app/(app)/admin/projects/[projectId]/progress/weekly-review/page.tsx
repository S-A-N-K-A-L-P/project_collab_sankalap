"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type WeeklyReport = {
    _id: string;
    userName?: string;
    completedTasks: string[];
    blockers: string;
    nextWeekPlan: string;
    createdAt: string;
};

export default function WeeklyReviewPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const [reports, setReports] = useState<WeeklyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        completedTasks: "",
        blockers: "",
        nextWeekPlan: "",
    });

    const formatDateTime = (value: string) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "unknown-datetime" : `${date.toISOString().split("T")[0]} ${date.toISOString().slice(11, 16)}`;
    };

    const fetchReports = async (id: string) => {
        const response = await fetch(`/api/project-progress/weekly-reports?projectId=${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch weekly reports");
        }

        setReports(data.reports || []);
    };
    useEffect(() => {
        if (!projectId) return;

        let active = true;
        setLoading(true);
        setError(null);

        fetchReports(projectId)
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!projectId) return;

        setSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/project-progress/weekly-reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    completedTasks: form.completedTasks
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    blockers: form.blockers,
                    nextWeekPlan: form.nextWeekPlan,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to submit report");
            }

            await fetchReports(projectId);
            setForm({ completedTasks: "", blockers: "", nextWeekPlan: "" });
        } catch (err: any) {
            setError(err.message || "Failed to submit report");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5 space-y-3">
                <h2 className="text-lg font-semibold text-[#e5e7eb]">Submit Weekly Report</h2>
                {error ? (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
                ) : null}
                <textarea
                    value={form.completedTasks}
                    onChange={(event) => setForm((state) => ({ ...state, completedTasks: event.target.value }))}
                    placeholder="Completed tasks (one per line)"
                    className="w-full rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none min-h-28"
                />
                <textarea
                    value={form.blockers}
                    onChange={(event) => setForm((state) => ({ ...state, blockers: event.target.value }))}
                    placeholder="Blockers"
                    className="w-full rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none min-h-20"
                />
                <textarea
                    value={form.nextWeekPlan}
                    onChange={(event) => setForm((state) => ({ ...state, nextWeekPlan: event.target.value }))}
                    placeholder="Next week plan"
                    className="w-full rounded-lg border border-[#1f1f23] bg-[#17171a] px-3 py-2 text-sm text-[#e5e7eb] outline-none min-h-20"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#6366f1] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4f46e5] disabled:opacity-60"
                >
                    {saving ? "Submitting..." : "Submit Report"}
                </button>
            </form>

            <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5">
                <h2 className="text-lg font-semibold text-[#e5e7eb]">Submitted Reports</h2>
                {loading ? <p className="text-sm text-[#9ca3af] mt-3">Loading reports...</p> : null}

                <div className="mt-3 space-y-2">
                    {reports.map((report) => (
                        <div key={report._id} className="rounded-lg border border-[#1f1f23] bg-[#17171a] p-3">
                            <p className="text-sm text-[#e5e7eb]">{report.userName || "Unknown"}</p>
                            <p className="text-xs text-[#9ca3af] mt-1">{formatDateTime(report.createdAt)}</p>
                            <p className="text-xs text-[#9ca3af] mt-2">
                                Completed: {report.completedTasks.length ? report.completedTasks.join(", ") : "None"}
                            </p>
                            <p className="text-xs text-[#9ca3af] mt-1">Blockers: {report.blockers || "None"}</p>
                            <p className="text-xs text-[#9ca3af] mt-1">Next: {report.nextWeekPlan || "None"}</p>
                        </div>
                    ))}
                    {!loading && reports.length === 0 ? <p className="text-sm text-[#9ca3af]">No reports submitted yet.</p> : null}
                </div>
            </div>
        </div>
    );
}