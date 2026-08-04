"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  CreditCard,
  FileText,
  Loader2,
  Settings2,
} from "lucide-react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

const STEPS = [
  { label: "Identity", icon: FileText },
  { label: "Schedule", icon: CalendarRange },
  { label: "Participation", icon: Settings2 },
  { label: "Pricing", icon: CreditCard },
];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}
function buildTimeline(start: string, weeks: number) {
  const buildStart = addDays(start, 22);
  const submission = addDays(buildStart, weeks * 7);
  return {
    registrationOpens: start,
    registrationCloses: addDays(start, 7),
    proposalsOpen: addDays(start, 1),
    proposalsClose: addDays(start, 14),
    applicationsOpen: addDays(start, 15),
    applicationsClose: addDays(start, 21),
    buildingStarts: buildStart,
    submissionDeadline: submission,
    judgingStarts: addDays(submission, 1),
    resultsAt: addDays(submission, 8),
  };
}

export default function CreateSeasonPage() {
  const router = useRouter();
  const today = useMemo(() => isoDate(new Date()), []);
  const [step, setStep] = useState(0);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hostsLoading, setHostsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    hostOrgId: "",
    name: "",
    slug: "",
    tagline: "",
    description: "",
    visibility: "public",
    timezone: "Asia/Kolkata",
    durationWeeks: 8,
    timeline: buildTimeline(today, 8),
    rules: {
      minTeamSize: 1,
      maxTeamSize: 6,
      maxApplicationsPerParticipant: 3,
      participantCapacity: 100,
      requireOrgApproval: true,
      requireSeasonApproval: false,
      allowMultipleProjects: false,
      minimumWeeklyHours: 5,
    },
    pricing: {
      mode: "free",
      payerType: "participant",
      currency: "INR",
      amount: 0,
      joiningFee: 0,
      billingCycleCount: 2,
      trialDays: 0,
      gracePeriodDays: 5,
      paymentTiming: "after_acceptance",
      taxMode: "inclusive",
      refundPolicy: "manual_review",
      displayPublicly: true,
      scholarshipsEnabled: false,
      couponsEnabled: false,
    },
  });

  useEffect(() => {
    fetch("/api/seasons/hosts")
      .then(async (response) =>
        response.ok ? response.json() : { organizations: [] },
      )
      .then((data) => {
        const hosts = data.organizations || [];
        setOrganizations(hosts);
        if (hosts.length === 1)
          setForm((current: any) => ({ ...current, hostOrgId: hosts[0]._id }));
      })
      .finally(() => setHostsLoading(false));
  }, []);

  const set = (key: string, value: any) =>
    setForm((current: any) => ({ ...current, [key]: value }));
  const setRule = (key: string, value: any) =>
    setForm((current: any) => ({
      ...current,
      rules: { ...current.rules, [key]: value },
    }));
  const setPricing = (key: string, value: any) =>
    setForm((current: any) => ({
      ...current,
      pricing: { ...current.pricing, [key]: value },
    }));
  const setTimeline = (key: string, value: string) =>
    setForm((current: any) => ({
      ...current,
      timeline: { ...current.timeline, [key]: value },
    }));
  const setName = (name: string) =>
    setForm((current: any) => ({
      ...current,
      name,
      slug: slugEdited
        ? current.slug
        : name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 60),
    }));
  const setSlug = (slug: string) => {
    setSlugEdited(true);
    set(
      "slug",
      slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 60),
    );
  };

  const changeDuration = (weeks: number) =>
    setForm((current: any) => ({
      ...current,
      durationWeeks: weeks,
      timeline: buildTimeline(
        current.timeline.registrationOpens || today,
        weeks,
      ),
      pricing: { ...current.pricing, billingCycleCount: Math.ceil(weeks / 4) },
    }));
  const changeStart = (start: string) =>
    setForm((current: any) => ({
      ...current,
      timeline: buildTimeline(start, current.durationWeeks),
    }));

  function validateCurrent() {
    if (
      step === 0 &&
      (!form.hostOrgId ||
        !form.name.trim() ||
        !form.slug.trim() ||
        !form.description.trim())
    )
      return "Host organization, name, URL slug, and description are required.";
    if (step === 1 && Object.values(form.timeline).some((value) => !value))
      return "Complete all schedule dates.";
    if (
      step === 2 &&
      Number(form.rules.maxTeamSize) < Number(form.rules.minTeamSize)
    )
      return "Maximum team size must be at least the minimum.";
    if (
      step === 3 &&
      form.pricing.mode !== "free" &&
      Number(form.pricing.amount) <= 0
    )
      return "Enter a valid participation fee.";
    return null;
  }

  const next = () => {
    const message = validateCurrent();
    if (message) return setError(message);
    setError(null);
    setStep((value) => Math.min(3, value + 1));
  };
  const submit = async () => {
    const message = validateCurrent();
    if (message) return setError(message);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          (data.errors || []).join(" · ") ||
            data.message ||
            "Unable to create season",
        );
      router.push(`/seasons/${data.season.slug}/admin`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayoutClient wide hideRightPanel>
      <div className="mx-auto max-w-5xl pb-16 text-foreground">
        <div className="mb-5 flex items-center justify-between">
          <a
            href="/seasons"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} /> Seasons
          </a>
          <span className="text-xs text-muted-foreground">Draft setup</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="px-2 pb-4 pt-2">
              <h1 className="text-lg font-semibold">Create a season</h1>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Configure the program before opening registration.
              </p>
            </div>
            <div className="space-y-1">
              {STEPS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => index < step && setStep(index)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${index === step ? "bg-primary text-primary-foreground" : index < step ? "text-foreground hover:bg-muted-bg" : "cursor-default text-muted-foreground"}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-md ${index === step ? "bg-white/15" : "bg-muted-bg"}`}
                    >
                      {index < step ? <Check size={14} /> : <Icon size={14} />}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <header className="border-b border-border px-6 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Step {step + 1} of {STEPS.length}
              </div>
              <h2 className="mt-1 text-xl font-semibold">
                {STEPS[step].label}
              </h2>
            </header>
            <div className="space-y-5 p-6">
              {step === 0 && (
                <IdentityStep
                  form={form}
                  set={set}
                  setName={setName}
                  setSlug={setSlug}
                  organizations={organizations}
                  hostsLoading={hostsLoading}
                />
              )}
              {step === 1 && (
                <ScheduleStep
                  form={form}
                  setTimeline={setTimeline}
                  changeDuration={changeDuration}
                  changeStart={changeStart}
                />
              )}
              {step === 2 && (
                <ParticipationStep form={form} setRule={setRule} />
              )}
              {step === 3 && (
                <PricingStep form={form} setPricing={setPricing} />
              )}
              {error && (
                <div className="rounded-lg border border-error/30 bg-error-muted px-4 py-3 text-sm text-error-text">
                  {error}
                </div>
              )}
            </div>
            <footer className="flex items-center justify-between border-t border-border px-6 py-4">
              <button
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground disabled:opacity-30"
              >
                Back
              </button>
              {step < 3 ? (
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}{" "}
                  Create draft
                </button>
              )}
            </footer>
          </div>
        </div>
      </div>
    </AppLayoutClient>
  );
}

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
const label = "mb-1.5 block text-xs font-semibold text-muted-foreground";
function Field({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className={label}>{title}</span>
      {children}
    </label>
  );
}
function IdentityStep({ form, set, setName, setSlug, organizations, hostsLoading }: any) {
  return (
    <>
      <Field title="Host organization">
        <select className={input} value={form.hostOrgId} onChange={(e) => set("hostOrgId", e.target.value)} disabled={hostsLoading || !organizations.length}>
          <option value="">{hostsLoading ? "Loading organizations…" : organizations.length ? "Select an organization" : "No eligible organization"}</option>
          {organizations.map((organization: any) => <option key={organization._id} value={organization._id}>{organization.name}</option>)}
        </select>
      </Field>
      {!hostsLoading && !organizations.length && <div className="flex gap-3 rounded-lg border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"><Building2 size={18} className="mt-0.5 shrink-0" /><div><div className="font-semibold">An organization must host every season</div><p className="mt-1 text-xs leading-5">You must be an owner or admin of an approved organization before creating a season.</p><a href="/orgs/launch" className="mt-2 inline-block text-xs font-semibold underline">Launch an organization</a></div></div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field title="Season name">
          <input
            className={input}
            value={form.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Season of Development 2026"
          />
        </Field>
        <Field title="URL slug">
          <input
            className={input}
            value={form.slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="development-2026"
          />
        </Field>
      </div>
      <Field title="Tagline">
        <input
          className={input}
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="Build meaningful products with expert mentors"
        />
      </Field>
      <Field title="Description">
        <textarea
          className={`${input} resize-none`}
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Explain the season, its purpose, and expected outcomes."
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field title="Visibility">
          <select
            className={input}
            value={form.visibility}
            onChange={(e) => set("visibility", e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="invite_only">Invitation only</option>
          </select>
        </Field>
        <Field title="Time zone">
          <select
            className={input}
            value={form.timezone}
            onChange={(e) => set("timezone", e.target.value)}
          >
            <option value="Asia/Kolkata">India Standard Time</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="Europe/London">London</option>
          </select>
        </Field>
      </div>
    </>
  );
}
function ScheduleStep({ form, setTimeline, changeDuration, changeStart }: any) {
  const dates = [
    ["registrationOpens", "Registration opens"],
    ["registrationCloses", "Registration closes"],
    ["proposalsOpen", "Proposals open"],
    ["proposalsClose", "Proposals close"],
    ["applicationsOpen", "Applications open"],
    ["applicationsClose", "Applications close"],
    ["buildingStarts", "Building starts"],
    ["submissionDeadline", "Submission deadline"],
    ["judgingStarts", "Judging starts"],
    ["resultsAt", "Results announced"],
  ];
  return (
    <>
      <div>
        <span className={label}>Program duration</span>
        <div className="flex flex-wrap gap-2">
          {[4, 6, 8, 12].map((weeks) => (
            <button
              key={weeks}
              onClick={() => changeDuration(weeks)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${form.durationWeeks === weeks ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
            >
              {weeks} weeks
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={52}
            value={form.durationWeeks}
            onChange={(e) => changeDuration(Number(e.target.value))}
            className="w-24 rounded-lg border border-border bg-background px-3 text-sm"
            aria-label="Custom duration weeks"
          />
        </div>
      </div>
      <Field title="Registration start">
        <input
          type="date"
          className={input}
          value={form.timeline.registrationOpens}
          onChange={(e) => changeStart(e.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {dates.slice(1).map(([key, title]) => (
          <Field key={key} title={title}>
            <input
              type="date"
              className={input}
              value={form.timeline[key]}
              onChange={(e) => setTimeline(key, e.target.value)}
            />
          </Field>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Dates are generated from the start date and duration. You can override
        any phase.
      </p>
    </>
  );
}
function ParticipationStep({ form, setRule }: any) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field title="Participant capacity">
          <input
            type="number"
            min={1}
            className={input}
            value={form.rules.participantCapacity}
            onChange={(e) =>
              setRule("participantCapacity", Number(e.target.value))
            }
          />
        </Field>
        <Field title="Maximum applications per participant">
          <input
            type="number"
            min={1}
            className={input}
            value={form.rules.maxApplicationsPerParticipant}
            onChange={(e) =>
              setRule("maxApplicationsPerParticipant", Number(e.target.value))
            }
          />
        </Field>
        <Field title="Minimum team size">
          <input
            type="number"
            min={1}
            className={input}
            value={form.rules.minTeamSize}
            onChange={(e) => setRule("minTeamSize", Number(e.target.value))}
          />
        </Field>
        <Field title="Maximum team size">
          <input
            type="number"
            min={1}
            className={input}
            value={form.rules.maxTeamSize}
            onChange={(e) => setRule("maxTeamSize", Number(e.target.value))}
          />
        </Field>
        <Field title="Minimum weekly availability">
          <div className="relative">
            <input
              type="number"
              min={0}
              className={input}
              value={form.rules.minimumWeeklyHours}
              onChange={(e) =>
                setRule("minimumWeeklyHours", Number(e.target.value))
              }
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
              hours
            </span>
          </div>
        </Field>
      </div>
      <div className="divide-y divide-border rounded-lg border border-border">
        <Toggle
          title="Organization approval required"
          value={form.rules.requireOrgApproval}
          onChange={(value) => setRule("requireOrgApproval", value)}
        />
        <Toggle
          title="Season approval required"
          value={form.rules.requireSeasonApproval}
          onChange={(value) => setRule("requireSeasonApproval", value)}
        />
        <Toggle
          title="Allow participants in multiple projects"
          value={form.rules.allowMultipleProjects}
          onChange={(value) => setRule("allowMultipleProjects", value)}
        />
      </div>
    </>
  );
}
function PricingStep({ form, setPricing }: any) {
  const pricing = form.pricing;
  return (
    <>
      <div>
        <span className={label}>Participation fee</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["free", "Free", "No payment required"],
            ["one_time", "One-time", "Single participation payment"],
            ["monthly", "Monthly", "Recurring during the season"],
          ].map(([value, title, desc]) => (
            <button
              key={value}
              onClick={() => setPricing("mode", value)}
              className={`rounded-lg border p-4 text-left ${pricing.mode === value ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="text-sm font-semibold">{title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
            </button>
          ))}
        </div>
      </div>
      {pricing.mode !== "free" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              title={
                pricing.mode === "monthly" ? "Monthly fee" : "Participation fee"
              }
            >
              <div className="flex">
                <span className="rounded-l-lg border border-r-0 border-border bg-muted-bg px-3 py-2.5 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={1}
                  className={`${input} rounded-l-none`}
                  value={pricing.amount}
                  onChange={(e) => setPricing("amount", Number(e.target.value))}
                />
              </div>
            </Field>
            <Field title="Who pays">
              <select
                className={input}
                value={pricing.payerType}
                onChange={(e) => setPricing("payerType", e.target.value)}
              >
                <option value="participant">Participant</option>
                <option value="organization">Organization</option>
                <option value="either">Either</option>
              </select>
            </Field>
          </div>
          {pricing.mode === "monthly" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field title="Billing cycles">
                <input
                  type="number"
                  min={1}
                  max={24}
                  className={input}
                  value={pricing.billingCycleCount}
                  onChange={(e) =>
                    setPricing("billingCycleCount", Number(e.target.value))
                  }
                />
              </Field>
              <Field title="Joining fee">
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={pricing.joiningFee}
                  onChange={(e) =>
                    setPricing("joiningFee", Number(e.target.value))
                  }
                />
              </Field>
              <Field title="Grace period">
                <input
                  type="number"
                  min={0}
                  max={30}
                  className={input}
                  value={pricing.gracePeriodDays}
                  onChange={(e) =>
                    setPricing("gracePeriodDays", Number(e.target.value))
                  }
                />
              </Field>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field title="Payment due">
              <select
                className={input}
                value={pricing.paymentTiming}
                onChange={(e) => setPricing("paymentTiming", e.target.value)}
              >
                <option value="after_acceptance">After acceptance</option>
                <option value="before_application">Before application</option>
              </select>
            </Field>
            <Field title="Refund policy">
              <select
                className={input}
                value={pricing.refundPolicy}
                onChange={(e) => setPricing("refundPolicy", e.target.value)}
              >
                <option value="manual_review">Manual review</option>
                <option value="before_building">
                  Refund before building begins
                </option>
                <option value="none">No refunds</option>
              </select>
            </Field>
          </div>
        </>
      )}
      <div className="divide-y divide-border rounded-lg border border-border">
        <Toggle
          title="Display pricing publicly"
          value={pricing.displayPublicly}
          onChange={(value) => setPricing("displayPublicly", value)}
        />
        <Toggle
          title="Enable scholarships"
          value={pricing.scholarshipsEnabled}
          onChange={(value) => setPricing("scholarshipsEnabled", value)}
        />
        <Toggle
          title="Enable coupons"
          value={pricing.couponsEnabled}
          onChange={(value) => setPricing("couponsEnabled", value)}
        />
      </div>
      <div className="rounded-lg border border-amber-300/40 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
        Payment collection is not activated by this wizard. Pricing is saved as
        configuration until Razorpay entitlement and webhook handling are
        enabled.
      </div>
    </>
  );
}
function Toggle({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between px-4 py-3 text-sm">
      <span>{title}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
      />
    </label>
  );
}
