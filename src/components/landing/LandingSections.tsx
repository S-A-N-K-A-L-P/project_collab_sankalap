import Link from "next/link";
import { ArrowRight, Cloud, Cpu, HeartPulse, Radio, Sprout, Truck, CheckCircle2 } from "lucide-react";
import { BrandMark, PoweredBy } from "./BrandMark";
import { BRAND, FOCUS_AREAS, NAV_LINKS, PILLARS, STEPS, type FocusArea } from "./content";
export { SyncroShowcase } from "./SyncroShowcase";

export function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{title}</h2>
      {text && <p className="mt-4 text-[16px] leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>}
    </div>
  );
}

const FOCUS_ICON: Record<FocusArea["icon"], typeof Sprout> = { sprout: Sprout, heart: HeartPulse, truck: Truck };
const FOCUS_TONE: Record<FocusArea["icon"], string> = {
  sprout: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  heart: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  truck: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
};
const PILLAR_ICON = [Cloud, Cpu, Radio];

/** The three technologies, then the industries the two divisions apply them to. */
export function FocusAreas() {
  return (
    <section id="focus" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-20 sm:py-24 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="What we build"
          title="Applied engineering where India needs it most"
          text="Our R&D Division works on agriculture and healthcare. Our Cloud Division builds the logistics backbone. Community engineers take part in both."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = PILLAR_ICON[i];
            return (
              <div key={p.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{p.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {FOCUS_AREAS.map((a) => {
            const Icon = FOCUS_ICON[a.icon];
            return (
              <article key={a.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${FOCUS_TONE[a.icon]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">{a.division}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{a.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{a.summary}</p>
                <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                  {a.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[14px] text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" /> {pt}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** How a project moves through the community, in four steps. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="A self-guided community, with a clear path for every project"
              text="No one waits to be assigned. Engineers pick work that fits their skills, ship a working version, and get reviewed by people who have built it before."
            />
            <Link href="/about" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Roles in the community <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="relative space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[14px] font-bold text-white dark:bg-white dark:text-slate-900">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export type FeaturedProject = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  stage?: string;
  techStack?: string[];
  createdBy?: { name?: string } | null;
};

const clip = (s = "", n = 150) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

/** The community's most-voted proposals, straight from the database. Hidden when there are none. */
export function FeaturedProjects({ projects }: { projects: FeaturedProject[] }) {
  if (!projects.length) return null;
  return (
    <section id="projects" className="scroll-mt-20 border-t border-slate-200 py-20 sm:py-24 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Projects" title="What the community is building" text="The most-supported proposals on the platform right now." />
          <Link href="/login?callbackUrl=/feed" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            See all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <article key={p._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
                {p.type && <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{p.type}</span>}
                {p.stage && <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{p.stage}</span>}
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{clip(p.description)}</p>
              {!!p.techStack?.length && (
                <p className="mt-4 text-[12px] text-slate-500 dark:text-slate-400">{p.techStack.slice(0, 4).join(" · ")}</p>
              )}
              {p.createdBy?.name && <p className="mt-3 border-t border-slate-100 pt-3 text-[13px] text-slate-500 dark:border-slate-800 dark:text-slate-400">Proposed by <span className="font-medium text-slate-700 dark:text-slate-200">{p.createdBy.name}</span></p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JoinCta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center sm:px-12 dark:bg-indigo-950/60 dark:ring-1 dark:ring-indigo-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.35),transparent_60%)]" aria-hidden />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">Build what India needs next.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-slate-300">
            Students, working engineers and researchers are all welcome. Bring your skills; we bring real problems, mentors and a team.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-900 hover:bg-slate-100">Join the community</Link>
            <Link href="/about" className="rounded-xl border border-white/25 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-white/10">About us</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
            {BRAND.expansion}. A community of engineers applying cloud, AI and IoT to agriculture, healthcare and logistics.
          </p>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Explore</h3>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-[14px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Account</h3>
          <ul className="mt-3 space-y-2">
            <li><Link href="/register" className="text-[14px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Join the community</Link></li>
            <li><Link href="/login" className="text-[14px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:px-6 dark:text-slate-400">
          <span>© {new Date().getFullYear()} {BRAND.company}. All rights reserved.</span>
          <PoweredBy />
        </div>
      </div>
    </footer>
  );
}
