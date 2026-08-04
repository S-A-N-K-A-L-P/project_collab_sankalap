"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Rocket,
  Users,
} from "lucide-react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import { SEASON_STATUS_LABELS } from "@/types/season";

export default function SeasonAdminPage() {
  const { slug } = useParams() as { slug: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/seasons/${slug}/manage`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.message || "Unable to load season");
        return body;
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [slug]);

  const publish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/seasons/${slug}/manage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error((body.errors || []).join(" · ") || body.message);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto text-error" />
          <h1 className="mt-3 font-semibold">Organizer access unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );

  const { season, pricing } = data;
  const enrollmentTotal = (data.enrollmentCounts || []).reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );
  const dates = [
    [
      "Registration",
      season.timeline?.registrationOpens,
      season.timeline?.registrationCloses,
    ],
    [
      "Mentor proposals",
      season.timeline?.proposalsOpen,
      season.timeline?.proposalsClose,
    ],
    [
      "Applications",
      season.timeline?.applicationsOpen,
      season.timeline?.applicationsClose,
    ],
    [
      "Building",
      season.timeline?.buildingStarts,
      season.timeline?.submissionDeadline,
    ],
    ["Judging", season.timeline?.judgingStarts, season.timeline?.resultsAt],
  ];
  const feeLabel =
    pricing?.mode === "free"
      ? "Free"
      : pricing?.mode === "monthly"
        ? `₹${pricing.amount}/month × ${pricing.billingCycleCount}`
        : `₹${pricing?.amount || 0} once`;

  return (
    <AppLayoutClient wide hideRightPanel>
      <div className="mx-auto max-w-6xl pb-16 text-foreground">
        <div className="mb-5 flex items-center justify-between gap-4">
          <a
            href={`/seasons/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Public season
          </a>
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {
              SEASON_STATUS_LABELS[
                season.status as keyof typeof SEASON_STATUS_LABELS
              ]
            }
          </span>
        </div>
        <header className="rounded-xl border border-border bg-card px-6 py-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Organizer console
              </div>
              <h1 className="mt-1 text-2xl font-semibold">{season.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {season.tagline || season.description}
              </p>
            </div>
            {season.status === "draft" && (
              <button
                onClick={publish}
                disabled={publishing}
                className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 md:self-auto"
              >
                {publishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Rocket size={14} />
                )}{" "}
                Open registration
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error-muted px-4 py-3 text-sm text-error-text">
            {error}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric
            icon={<Clock3 />}
            label="Duration"
            value={`${season.durationWeeks} weeks`}
          />
          <Metric
            icon={<CreditCard />}
            label="Participation fee"
            value={feeLabel}
          />
          <Metric
            icon={<Users />}
            label="Enrollments"
            value={enrollmentTotal}
          />
          <Metric
            icon={<Building2 />}
            label="Capacity"
            value={season.rules?.participantCapacity || 0}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-xl border border-border bg-card shadow-sm">
            <header className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-semibold">
              <CalendarDays size={16} /> Program schedule
            </header>
            <div className="divide-y divide-border px-5">
              {dates.map(([name, start, end]) => (
                <div
                  key={name}
                  className="grid grid-cols-[150px_1fr] gap-4 py-3 text-sm"
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">
                    {formatDate(start)} — {formatDate(end)}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <aside className="space-y-4">
            <section className="rounded-xl border border-border bg-card shadow-sm">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-semibold">
                <CreditCard size={16} /> Pricing configuration
              </header>
              <div className="space-y-3 p-5 text-sm">
                <Row
                  label="Mode"
                  value={String(pricing?.mode || "free").replaceAll("_", " ")}
                />
                <Row
                  label="Payer"
                  value={pricing?.payerType || "participant"}
                />
                <Row
                  label="Payment due"
                  value={String(
                    pricing?.paymentTiming || "after_acceptance",
                  ).replaceAll("_", " ")}
                />
                <Row
                  label="Refunds"
                  value={String(
                    pricing?.refundPolicy || "manual_review",
                  ).replaceAll("_", " ")}
                />
                <div className={`rounded-lg border p-3 text-xs leading-5 ${pricing?.mode === "free" ? "border-border bg-muted-bg text-muted-foreground" : pricing?.paymentsEnabled ? "border-emerald-300/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200" : "border-amber-300/40 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"}`}>
                  {pricing?.mode === "free" ? "No participant payment is required." : pricing?.paymentsEnabled ? "Razorpay checkout is active. Participants can pay after enrollment." : "Payments activate automatically when registration is opened."}
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-border bg-card shadow-sm">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-semibold">
                <CheckCircle2 size={16} /> Participation rules
              </header>
              <div className="space-y-3 p-5 text-sm">
                <Row
                  label="Team size"
                  value={`${season.rules?.minTeamSize}–${season.rules?.maxTeamSize}`}
                />
                <Row
                  label="Applications"
                  value={`${season.rules?.maxApplicationsPerParticipant} per participant`}
                />
                <Row
                  label="Weekly availability"
                  value={`${season.rules?.minimumWeeklyHours} hours`}
                />
                <Row
                  label="Organization approval"
                  value={
                    season.rules?.requireOrgApproval
                      ? "Required"
                      : "Not required"
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayoutClient>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium capitalize">{value}</span>
    </div>
  );
}
function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";
}
