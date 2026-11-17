import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, FlaskConical, CloudCog, Users } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { IntroVideo } from "@/components/landing/IntroVideo";
import { JoinCta, LandingFooter, SectionHeading } from "@/components/landing/LandingSections";
import { BRAND, COMMUNITY, FOCUS_AREAS, INTRO_VIDEO, ROLES, SYNCRO_GIT_VIDEO, TEAM } from "@/components/landing/content";

export const metadata: Metadata = {
  title: "About us · S.A.N.K.A.L.P.",
  description:
    "S.A.N.K.A.L.P. is the engineering community of Morwin Technologies, a cloud, AI and IoT startup with an R&D Division for agriculture and healthcare and a Cloud Division for logistics.",
};

const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

export default function AboutPage() {
  const rnd = FOCUS_AREAS.filter((a) => a.division === "R&D Division").map((a) => a.title.toLowerCase());
  const cloud = FOCUS_AREAS.filter((a) => a.division === "Cloud Division").map((a) => a.title.toLowerCase());

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <LandingNav />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[480px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100 to-transparent blur-3xl dark:from-indigo-950/60" aria-hidden />
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 lg:pt-24">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">About us</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Connecting India digitally, through the engineers who live here.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
            {BRAND.company} is a cloud, AI and IoT startup focused on the talent of our country in applied engineering.
            {" "}{BRAND.name} is how that talent comes together.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 py-20 dark:border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3">
          <Card icon={Building2} title={BRAND.company}>
            The company behind the platform. We work with the latest cloud and AI technologies and pair them with IoT hardware,
            so solutions reach the field, the clinic and the road, not just the browser.
          </Card>
          <Card icon={FlaskConical} title="R&D Division">
            Research and product development for {rnd.join(" and ")}: sensors, connected devices and AI models, taken from
            prototype to tested pilot.
          </Card>
          <Card icon={CloudCog} title="Cloud Division">
            Cloud platforms for {cloud.join(" and ")}: the tracking, planning and integration layer that helps goods and
            services move across India, and connects more of the country digitally.
          </Card>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={BRAND.name}
              title="A self-guided community of engineers"
              text={`${BRAND.name} stands for ${BRAND.expansion}. It is an open community where students, working engineers and researchers take real problems from our divisions and partners, form teams around them and ship working solutions. Nobody waits to be told what to do: members choose projects that match their skills, and grow by building.`}
            />
            <Link href="/#how-it-works" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              How a project runs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <div key={r.title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-[16px] font-semibold">{r.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-20 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="People" title="The team" text="The architects who guide projects, and community members who help run them." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TEAM.map((m) => (
              <div key={m.name} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-[15px] font-bold text-white">{initials(m.name)}</span>
                <h3 className="mt-4 text-[15px] font-semibold">{m.name}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">{m.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300"><Users className="h-4 w-4" /> Community</span>
            {COMMUNITY.map((n) => (
              <span key={n} className="rounded-full border border-slate-200 px-3 py-1 text-[13px] text-slate-600 dark:border-slate-700 dark:text-slate-300">{n}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Videos"
            title="See S.A.N.K.A.L.P. and Syncro Git in action"
            text="Watch our community introduction and how Syncro Git indexes repositories for private, low-token code intelligence."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <IntroVideo id="about-intro-video" video={INTRO_VIDEO} />
              <p className="mt-3 text-[13.5px] text-slate-600 dark:text-slate-400">
                How {BRAND.name} connects engineers, mentors and divisions across India to ship real projects.
              </p>
            </div>
            <div>
              <IntroVideo id="about-syncro-video" video={SYNCRO_GIT_VIDEO} />
              <p className="mt-3 text-[13.5px] text-slate-600 dark:text-slate-400">
                How Syncro Git powers private Git hosting, automatic push indexing, RAG search and Hindsight memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      <JoinCta />
      <LandingFooter />
    </main>
  );
}

function Card({ icon: Icon, title, children }: { icon: typeof Building2; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-7 dark:border-slate-800">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{children}</p>
    </div>
  );
}
