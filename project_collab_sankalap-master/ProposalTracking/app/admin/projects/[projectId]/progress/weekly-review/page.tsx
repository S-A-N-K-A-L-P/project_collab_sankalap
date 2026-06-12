"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectProgressProvider, useProjectProgress } from "@/context/ProjectProgressContext";
import WeeklySubmissionForm from "@/components/project-progress/weekly/WeeklySubmissionForm";
import WeeklyReportCard from "@/components/project-progress/weekly/WeeklyReportCard";
import { CreateWeeklyReportInput } from "@/features/project-progress/types/weekly.types";
import { createSupabaseClient } from "@/lib/auth";
import { FileText } from "lucide-react";

function WeeklyReviewContent() {
  const { weeklyReports, fetchWeeklyReports, projectId } = useProjectProgress();

  useEffect(() => {
    fetchWeeklyReports();
  }, [fetchWeeklyReports]);

  const handleSubmit = async (data: CreateWeeklyReportInput) => {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

    const res = await fetch("/api/weekly-reports", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...data, userName: session?.user?.email }),
    });

    if (res.ok) await fetchWeeklyReports();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Weekly Review</h1>
        <p className="text-slate-400 text-sm mb-8">
          Submit your weekly report and view the team's submissions
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission form */}
          <div>
            <WeeklySubmissionForm projectId={projectId} onSubmit={handleSubmit} />
          </div>

          {/* Submitted reports (admin view) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-300">
                Submitted Reports ({weeklyReports.length})
              </h2>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {weeklyReports.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No reports submitted yet this week.
                </div>
              ) : (
                weeklyReports.map((report) => (
                  <WeeklyReportCard key={report._id} report={report} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WeeklyReviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProgressProvider projectId={projectId}>
      <WeeklyReviewContent />
    </ProjectProgressProvider>
  );
}
