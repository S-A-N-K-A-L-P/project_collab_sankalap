"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  Lightbulb,
  Loader2,
  Users,
} from "lucide-react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import { useSeasonRazorpay } from "@/hooks/useSeasonRazorpay";
import type { ISeasonPublic } from "@/types/season";
import { SEASON_STATUS_LABELS, SEASON_STATUS_ORDER } from "@/types/season";

export default function SeasonDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadSeason = useCallback(
    () =>
      fetch(`/api/seasons/${slug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setData),
    [slug],
  );
  useEffect(() => {
    loadSeason().finally(() => setLoading(false));
  }, [loadSeason]);
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold">Season not found</h1>
          <a href="/seasons" className="text-primary text-sm">
            Back to seasons
          </a>
        </div>
      </div>
    );

  const season = data.season as ISeasonPublic;
  const currentStep = SEASON_STATUS_ORDER.indexOf(season.status);
  return (
    <AppLayoutClient>
      <div className="w-full pb-16 text-foreground space-y-6">
        <a
          href="/seasons"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={14} /> Seasons
        </a>
        <section
          className="relative min-h-72 rounded-3xl overflow-hidden border border-border flex items-end p-6 md:p-8"
          style={{
            background: `linear-gradient(135deg, ${season.themeColor || "#4f46e5"}, #111827)`,
          }}
        >
          {season.bannerImage && (
            <img
              src={season.bannerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="relative text-white max-w-3xl">
            <span className="inline-flex px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-3">
              {SEASON_STATUS_LABELS[season.status]}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              {season.name}
            </h1>
            {season.tagline && (
              <p className="text-white/75 mt-2 text-base md:text-lg">
                {season.tagline}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 overflow-x-auto">
          <div className="flex min-w-[720px]">
            {SEASON_STATUS_ORDER.slice(1, 8).map((status, index) => {
              const actualIndex = index + 1;
              const active = actualIndex <= currentStep;
              return (
                <div
                  key={status}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-primary text-primary-foreground" : "bg-muted-bg text-muted-foreground border border-border"}`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {SEASON_STATUS_LABELS[status]}
                    </span>
                  </div>
                  {index < 6 && (
                    <div
                      className={`h-px flex-1 mx-2 ${actualIndex < currentStep ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric
            icon={<Building2 />}
            value={season.stats?.organizationCount || data.organizations.length}
            label="Organizations"
          />
          <Metric
            icon={<Users />}
            value={season.stats?.mentorCount || data.mentors.length}
            label="Mentors"
          />
          <Metric
            icon={<Lightbulb />}
            value={season.stats?.proposalCount || data.proposals.length}
            label="Proposals"
          />
          <Metric
            icon={<FolderKanban />}
            value={season.stats?.projectCount || data.projects.length}
            label="Projects"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg mb-3">About this season</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {season.description}
              </p>
            </section>
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Open proposals</h2>
                <span className="text-xs text-muted-foreground">
                  {data.proposals.length}
                </span>
              </div>
              {data.proposals.length ? (
                <div className="space-y-3">
                  {data.proposals.slice(0, 6).map((proposal: any) => (
                    <a
                      key={proposal._id}
                      href={`/ideas/${proposal._id}`}
                      className="block p-4 rounded-xl border border-border hover:border-primary/40 transition-colors"
                    >
                      <h3 className="font-semibold text-sm">
                        {proposal.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {proposal.problemStatement || proposal.description}
                      </p>
                      <div className="text-[10px] text-primary font-semibold mt-2">
                        {proposal.orgId?.name || "Season proposal"}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <Empty text="Mentor proposals will appear here." />
              )}
            </section>
          </div>
          <aside className="space-y-6">
            <SeasonJoinCard slug={slug} data={data} refresh={loadSeason} />
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold mb-4">Timeline</h2>
              <div className="space-y-3">
                {Object.entries(season.timeline || {})
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <CalendarDays size={14} className="text-primary mt-0.5" />
                      <div>
                        <div className="text-xs font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(value as string).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold mb-4">Participating organizations</h2>
              {data.organizations.length ? (
                <div className="space-y-2">
                  {data.organizations.map((item: any) => (
                    <a
                      key={item._id}
                      href={`/orgs/${item.orgId?.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted-bg"
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted-bg overflow-hidden flex items-center justify-center font-bold">
                        {item.orgId?.logo ? (
                          <img
                            src={item.orgId.logo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.orgId?.name?.[0]
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {item.orgId?.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.focusAreas?.slice(0, 2).join(" · ") ||
                            "Participating organization"}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <Empty text="Organizations will be announced soon." />
              )}
            </section>
          </aside>
        </div>
      </div>
    </AppLayoutClient>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </span>
      <div>
        <div className="text-xl font-black">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
      {text}
    </div>
  );
}

function SeasonJoinCard({ slug, data, refresh }: { slug: string; data: any; refresh: () => Promise<any> }) {
  const { status } = useSession();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const paymentSuccess = useCallback(() => { void refresh(); }, [refresh]);
  const payment = useSeasonRazorpay(slug, paymentSuccess);
  const pricing = data.pricing;
  const enrollment = data.enrollment;
  const paidCycles = enrollment?.paidCycleCount || 0;
  const allCyclesPaid = pricing?.mode === "monthly" && paidCycles >= pricing.billingCycleCount;
  const amount = Number(pricing?.amount || 0) + (!paidCycles ? Number(pricing?.joiningFee || 0) : 0);

  const join = async () => {
    setJoining(true); setJoinError("");
    try {
      const response = await fetch(`/api/seasons/${slug}/enrollment`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to join season");
      await refresh();
    } catch (error: any) { setJoinError(error.message); } finally { setJoining(false); }
  };

  return <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-wider text-primary">Participation</div><h2 className="mt-1 font-bold">Join this season</h2></div><CreditCard size={18} className="text-muted-foreground" /></div>
    {pricing ? <div className="mt-4"><div className="text-2xl font-black">{pricing.mode === "free" ? "Free" : `₹${Number(pricing.amount).toLocaleString("en-IN")}`} {pricing.mode === "monthly" && <span className="text-xs font-medium text-muted-foreground">/ month</span>}</div>{pricing.joiningFee > 0 && <div className="mt-1 text-xs text-muted-foreground">+ ₹{Number(pricing.joiningFee).toLocaleString("en-IN")} joining fee on the first cycle</div>}</div> : <p className="mt-4 text-xs text-muted-foreground">Contact the organizer for participation details.</p>}
    {enrollment?.accessStatus === "active" && <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} /> Access active{pricing?.mode === "monthly" ? ` · ${paidCycles}/${pricing.billingCycleCount} cycles paid` : ""}</div>}
    <div className="mt-4">
      {status === "unauthenticated" ? <a href={`/api/auth/signin?callbackUrl=/seasons/${slug}`} className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Sign in to participate</a>
      : !enrollment ? <button onClick={join} disabled={joining || status === "loading"} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{joining ? "Joining…" : pricing?.mode === "free" ? "Join season" : "Continue to payment"}</button>
      : pricing?.mode !== "free" && !allCyclesPaid && (enrollment.paymentStatus !== "paid" || pricing.mode === "monthly") ? <button onClick={payment.openCheckout} disabled={payment.isLoading || !pricing.paymentsEnabled} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{payment.isLoading ? "Opening Razorpay…" : enrollment.paymentStatus === "paid" ? `Pay cycle ${paidCycles + 1} · ₹${amount.toLocaleString("en-IN")}` : `Pay securely · ₹${amount.toLocaleString("en-IN")}`}</button>
      : enrollment ? <div className="text-center text-xs font-medium text-muted-foreground">You are registered for this season.</div> : null}
    </div>
    {(joinError || payment.error) && <p className="mt-3 text-xs text-red-600">{joinError || payment.error}</p>}
    {pricing?.mode !== "free" && <p className="mt-3 text-[10px] leading-4 text-muted-foreground">Secure checkout by Razorpay. {pricing.refundPolicy === "none" ? "Payments are non-refundable." : "Refund requests follow the season policy."}</p>}
  </section>;
}
