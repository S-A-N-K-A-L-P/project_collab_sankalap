"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Loader2, AlertCircle,
  Rocket, Users, Target, Palette, Eye,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ui/ImageUploader";
import type { IOrgCreate } from "@/types/org";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

const STEPS = [
  { id: "basics",   label: "Basics",  icon: Rocket },
  { id: "mission",  label: "Mission", icon: Target },
  { id: "branding", label: "Branding",icon: Palette },
  { id: "review",   label: "Review",  icon: Eye },
];

const CATEGORIES = [
  { value: "community",   label: "Community",    desc: "Open community for everyone" },
  { value: "academic",    label: "Academic",     desc: "University / research group" },
  { value: "company",     label: "Company",      desc: "Startup or established company" },
  { value: "open_source", label: "Open Source",  desc: "OSS project organization" },
];

const ORG_TYPES = [
  { value: "free",       label: "Free",        desc: "Open to all — no membership fee" },
  { value: "standard",   label: "Standard",    desc: "Some features require approval" },
  { value: "community",  label: "Community",   desc: "Community-led with voting" },
];

function SlugField({ slug, setSlug, available, checking }: {
  slug: string; setSlug: (s: string) => void;
  available: boolean | null; checking: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">
        Organization URL <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">
          sankalp.dev/orgs/
        </span>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="my-org"
          className="w-full pl-36 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {checking ? <Loader2 size={14} className="animate-spin text-white/30" /> :
           available === true  ? <Check size={14} className="text-emerald-400" /> :
           available === false ? <AlertCircle size={14} className="text-red-400" /> : null}
        </div>
      </div>
      {available === false && <p className="text-xs text-red-400 mt-1">This slug is already taken</p>}
      {available === true  && <p className="text-xs text-emerald-400 mt-1">✓ Available</p>}
    </div>
  );
}

export default function OrgLaunchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step,      setStep]      = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const [form, setForm] = useState<IOrgCreate>({
    name:        "",
    slug:        "",
    description: "",
    category:    "community",
    orgType:     "free",
    charter:     "",
    roadmap:     "",
    tagline:     "",
    website:     "",
    email:       "",
    socialLinks: {},
    logo:        "",
    bannerImage: "",
    themeColor:  "#6366f1",
    visibility:  "public",
  });

  // Slug check
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug]   = useState(false);
  useEffect(() => {
    if (!form.slug || form.slug.length < 3) { setSlugAvailable(null); return; }
    const t = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const res  = await fetch(`/api/orgs/slug-available?slug=${form.slug}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } finally { setCheckingSlug(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.slug]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!form.slug) {
      const s = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug: s.slice(0, 40) }));
    }
  }, [form.name]);

  const set = (field: keyof IOrgCreate, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.name.trim())   e.name = "Name is required";
      if (!form.slug.trim())   e.slug = "Slug is required";
      if (slugAvailable === false) e.slug = "This slug is taken";
      if (!form.description.trim()) e.description = "Description is required";
    }
    if (s === 1) {
      if (!form.charter.trim()) e.charter = "Mission statement is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => Math.min(3, s + 1)); };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!validate(3)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push("/orgs/launch/status");
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return null;
  if (!session) {
    router.push("/login?callbackUrl=/orgs/launch");
    return null;
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 transition-all";
  const labelCls = "block text-sm font-medium text-white/70 mb-1.5";
  const errCls   = "text-xs text-red-400 mt-1";

  return (
    <AppLayoutClient>
      <div className="text-white max-w-2xl mx-auto w-full py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/8">
          <a href="/orgs" className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="text-xl font-bold text-white">Launch Organization</h1>
            <p className="text-xs text-white/40">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex flex-col items-center gap-1 flex-shrink-0 ${i > 0 ? "ml-2" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    i < step  ? "bg-indigo-500 text-white" :
                    i === step ? "bg-indigo-500/20 border-2 border-indigo-400 text-indigo-300" :
                    "bg-white/5 border border-white/10 text-white/30"
                  }`}>
                    {i < step ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${
                    i <= step ? "text-white/60" : "text-white/20"
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-all ${i < step ? "bg-indigo-500" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Step 0: Basics */}
            {step === 0 && (
              <>
                <div>
                  <label className={labelCls}>Organization Name <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="My Awesome Org" value={form.name}
                    onChange={(e) => set("name", e.target.value)} className={inputCls} />
                  {errors.name && <p className={errCls}>{errors.name}</p>}
                </div>

                <SlugField slug={form.slug} setSlug={(s) => set("slug", s)}
                  available={slugAvailable} checking={checkingSlug} />
                {errors.slug && <p className={errCls}>{errors.slug}</p>}

                <div>
                  <label className={labelCls}>Short Tagline</label>
                  <input type="text" placeholder="What you build in one line…" value={form.tagline}
                    onChange={(e) => set("tagline", e.target.value)} maxLength={120} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <textarea rows={3} placeholder="What does your org do?" value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={`${inputCls} resize-none`} />
                  {errors.description && <p className={errCls}>{errors.description}</p>}
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button key={c.value} type="button" onClick={() => set("category", c.value)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          form.category === c.value
                            ? "border-indigo-400/60 bg-indigo-500/10 text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                        }`}>
                        <p className="text-xs font-semibold">{c.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Mission */}
            {step === 1 && (
              <>
                <div>
                  <label className={labelCls}>Mission Statement (Charter) <span className="text-red-400">*</span></label>
                  <p className="text-xs text-white/40 mb-2">Why does this org exist? What problem does it solve?</p>
                  <textarea rows={5} placeholder="We exist to…" value={form.charter}
                    onChange={(e) => set("charter", e.target.value)}
                    className={`${inputCls} resize-none`} />
                  {errors.charter && <p className={errCls}>{errors.charter}</p>}
                </div>

                <div>
                  <label className={labelCls}>Initial Roadmap</label>
                  <p className="text-xs text-white/40 mb-2">What are your plans for the next 6–12 months? (optional)</p>
                  <textarea rows={4} placeholder="Phase 1: …&#10;Phase 2: …" value={form.roadmap}
                    onChange={(e) => set("roadmap", e.target.value)}
                    className={`${inputCls} resize-none`} />
                </div>

                <div>
                  <label className={labelCls}>Website</label>
                  <input type="url" placeholder="https://yourorg.com" value={form.website}
                    onChange={(e) => set("website", e.target.value)} className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>GitHub Username</label>
                    <input type="text" placeholder="my-org" value={form.socialLinks?.github || ""}
                      onChange={(e) => set("socialLinks", { ...form.socialLinks, github: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Discord</label>
                    <input type="text" placeholder="invite link or handle" value={form.socialLinks?.discord || ""}
                      onChange={(e) => set("socialLinks", { ...form.socialLinks, discord: e.target.value })}
                      className={inputCls} />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Branding */}
            {step === 2 && (
              <>
                <div>
                  <label className={labelCls}>Organization Logo</label>
                  <ImageUploader
                    folder="sankalp/orgs/logos"
                    value={form.logo}
                    onUpload={(url) => set("logo", url)}
                    aspectRatio="1/1"
                    label="Upload Logo"
                    maxSizeLabel="2 MB max"
                  />
                </div>

                <div>
                  <label className={labelCls}>Banner Image</label>
                  <ImageUploader
                    folder="sankalp/orgs/banners"
                    value={form.bannerImage}
                    onUpload={(url) => set("bannerImage", url)}
                    aspectRatio="16/5"
                    label="Upload Banner"
                    maxSizeLabel="5 MB max"
                  />
                </div>

                <div>
                  <label className={labelCls}>Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.themeColor}
                      onChange={(e) => set("themeColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <input type="text" value={form.themeColor}
                      onChange={(e) => set("themeColor", e.target.value)}
                      className={`${inputCls} flex-1 font-mono text-sm`} />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-white/50">
                  Review your org details before submitting. Our team will review your request and get back to you within 24–48 hours.
                </p>

                <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  {/* Preview card */}
                  <div className="relative h-28 bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                    {form.bannerImage && <img src={form.bannerImage} alt="" className="w-full h-full object-cover opacity-60" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="px-5 -mt-6 pb-5">
                    <div className="w-12 h-12 rounded-xl border-2 border-white/20 overflow-hidden flex items-center justify-center text-xl font-bold"
                      style={{ background: form.themeColor || "#6366f1" }}>
                      {form.logo ? <img src={form.logo} alt="" className="w-full h-full object-cover" /> : form.name[0]?.toUpperCase()}
                    </div>
                    <h2 className="font-bold text-white mt-2 text-lg">{form.name || "Org Name"}</h2>
                    <p className="text-xs text-white/40">sankalp.dev/orgs/{form.slug}</p>
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">{form.tagline || form.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Category",    value: form.category },
                    { label: "Mission",     value: form.charter?.slice(0, 100) + (form.charter?.length > 100 ? "…" : "") },
                    { label: "Visibility",  value: form.visibility },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-3 text-sm">
                      <span className="text-white/40 w-24 flex-shrink-0">{label}</span>
                      <span className="text-white/70">{value}</span>
                    </div>
                  ))}
                </div>

                {errors.submit && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-400/20">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-300">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
          <button onClick={back} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ArrowLeft size={14} /> Back
          </button>

          {step < 3 ? (
            <button onClick={next}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all">
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-semibold text-sm transition-all">
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Rocket size={14} /> Submit Request</>}
            </button>
          )}
        </div>
      </div>
    </AppLayoutClient>
  );
}
