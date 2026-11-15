import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { IntroVideo } from "./IntroVideo";
import { BRAND } from "./content";

type Stat = { label: string; value: number };

/** Hero: who we are in one sentence, the two main actions, the intro video and live community numbers. */
export function LandingHero({ stats }: { stats: Stat[] }) {
  return (
    <section className="relative overflow-hidden pt-[72px]">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100 via-sky-50 to-transparent blur-3xl dark:from-indigo-950/60 dark:via-slate-900/40" />
        <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] [background-image:radial-gradient(rgba(100,116,139,.35)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:pb-24 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-[12px] font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-slate-900/60 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Cloud · AI · IoT for Agriculture, Healthcare and Logistics
          </p>

          <h1 className="mt-6 text-[40px] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[50px] xl:text-[56px] dark:text-white">
            India&apos;s engineering talent,
            <span className="block bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-sky-400 dark:to-emerald-400">
              applied to real problems.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">{BRAND.name}</strong> ({BRAND.expansion}) is a
            self-guided community of engineers who build cloud, AI and IoT solutions alongside {BRAND.company}&apos;
            R&amp;D and Cloud divisions, connecting India digitally, one project at a time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              Join the community <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#intro-video"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <PlayCircle className="h-4 w-4" /> Watch the introduction
            </a>
          </div>

          {/* Live numbers from the platform; hidden rather than shown as zeros when the database can't be read. */}
          {stats.some((s) => s.value > 0) && <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{s.value.toLocaleString("en-IN")}</dd>
              </div>
            ))}
          </dl>}
        </div>

        <IntroVideo />
      </div>
    </section>
  );
}
