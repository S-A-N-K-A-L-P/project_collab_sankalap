"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

interface OrgRequest {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  orgType: string;
  status: string;
  createdAt: string;
  review?: {
    decision?: string;
    reason?: string;
    reviewedAt?: string;
  };
}

export default function OrgLaunchStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<OrgRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/orgs/launch/status");
      return;
    }

    if (status === "authenticated") {
      fetchRequests();
    }
  }, [status]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Admins and review-queue endpoint handles retrieving the user's specific items when requested.
      // We'll create a dedicated endpoint or reuse the request list filtered for the current owner.
      // Actually, we can fetch all requests since the admin endpoint is gated, but let's query a user-specific list.
      // Let's call /api/admin/org-requests?status=all for now, or build a quick endpoint/check.
      // Wait, let's look at /api/admin/org-requests. It's gated to platform_moderators.
      // We need a way for regular users to see their own requests.
      // Let's make sure `/api/orgs` can return a user's pending org requests, or let's create a custom endpoint / route for user's requests.
      // Wait, let's check what GET /api/orgs does. It returns "active" orgs.
      // Let's create `/api/orgs/my-requests` or fetch `/api/orgs?status=requested` but that's admin-only in the planning.
      // Let's create a quick `/api/orgs/my-requests` API route so users can fetch their own requests securely.
      const res = await fetch("/api/orgs/my-requests");
      if (!res.ok) throw new Error("Failed to fetch launch requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0a0f] text-foreground dark:text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={28} />
      </div>
    );
  }

  return (
    <AppLayoutClient>
      <div className="text-foreground dark:text-white max-w-3xl mx-auto w-full py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border dark:border-white/8">
          <a href="/orgs" className="text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="text-xl font-bold text-foreground dark:text-white">Launch Requests</h1>
            <p className="text-xs text-muted-foreground dark:text-white/40">Track the status of your organization proposals</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-error-muted dark:bg-red-500/10 border border-error dark:border-red-400/20 flex items-start gap-2">
            <AlertCircle className="text-error dark:text-red-400 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-error-text dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-card dark:bg-white/5 border border-dashed border-border dark:border-white/10 rounded-2xl">
              <Clock className="mx-auto text-muted-foreground dark:text-white/20 mb-3" size={36} />
              <h3 className="font-medium text-foreground dark:text-white mb-1">No launch requests found</h3>
              <p className="text-xs text-muted-foreground dark:text-white/40 mb-4">You haven't submitted any organization launch requests yet.</p>
              <a
                href="/orgs/launch"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover dark:from-indigo-500 dark:to-purple-500 text-primary-foreground dark:text-white font-semibold text-sm transition-all hover:brightness-110 shadow-sm"
              >
                Launch an Organization
              </a>
            </div>
          ) : (
            requests.map((req) => {
              const statusColors: Record<string, string> = {
                requested: "bg-warning-muted dark:bg-yellow-500/10 text-warning-text dark:text-yellow-400 border-warning dark:border-yellow-500/20",
                in_review: "bg-info-muted dark:bg-blue-500/10 text-info-text dark:text-blue-400 border-info dark:border-blue-500/20",
                active: "bg-success-muted dark:bg-emerald-500/10 text-success-text dark:text-emerald-400 border-success dark:border-emerald-500/20",
                rejected: "bg-error-muted dark:bg-red-500/10 text-error-text dark:text-red-400 border-error dark:border-red-500/20",
              };

              return (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 backdrop-blur-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-foreground dark:text-white text-lg">{req.name}</h3>
                      <p className="text-xs text-muted-foreground dark:text-white/40">Slug: {req.slug} · Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[req.status] || "bg-muted-strong dark:bg-white/10 text-muted-foreground dark:text-white/60"}`}>
                      {req.status === "active" ? "Approved & Active" : req.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground dark:text-white/60 line-clamp-2">{req.description}</p>

                  {req.review?.decision && (
                    <div className={`p-4 rounded-xl border ${
                      req.review.decision === "approved"
                        ? "bg-success-muted/50 dark:bg-emerald-500/5 border-success dark:border-emerald-500/10 text-success-text dark:text-emerald-300"
                        : "bg-error-muted/50 dark:bg-red-500/5 border-error dark:border-red-500/10 text-error-text dark:text-red-300"
                    }`}>
                      <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                        {req.review.decision === "approved" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {req.review.decision === "approved" ? "Approved" : "Rejection Reason"}
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-white/70 leading-relaxed">{req.review.reason || "No feedback provided."}</p>
                    </div>
                  )}

                  {req.status === "active" && (
                    <div className="flex justify-end pt-2">
                      <a
                        href={`/orgs/${req.slug}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover dark:from-indigo-500 dark:to-purple-500 text-primary-foreground dark:text-white text-xs font-semibold transition-all hover:brightness-110"
                      >
                        Visit Organization Page →
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayoutClient>
  );
}
