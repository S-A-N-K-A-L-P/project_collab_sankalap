"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { Menu, X } from "lucide-react";
import { MadhyamLogo } from "@/components/brand/MadhyamLogo";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { ImpactCounters } from "@/components/portfolio/ImpactCounters";
import { Hero } from "./Hero";
import { WhyMadhyam } from "./WhyMadhyam";
import { AgentFleet, Audiences, DocsConnectors, MadhyamIDE, Pricing } from "./ProductSections";
import {
  Architecture, Assignment, FinalCTA, GitHubIntelligence, Journey, MobileSection, ValueStrip, WorkflowStudio,
} from "./Sections";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const NAV = [
  { href: "#solutions", label: "Solutions" },
  { href: "#workflow-studio", label: "Workflow" },
  { href: "#agents", label: "Agents" },
  { href: "#ide", label: "IDE" },
  { href: "#docs", label: "Docs" },
  { href: "#mobile", label: "Mobile" },
  { href: "#why", label: "Why Madhyam" },
  { href: "#pricing", label: "Pricing" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-all duration-300 ${
        scrolled || open ? "border-[#E8E8EF] bg-white/85 dark:border-slate-800 dark:bg-slate-950/80" : "border-transparent bg-white/60 dark:bg-slate-950/40"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Madhyam AI home"><MadhyamLogo size={42} /></Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-[#737586] dark:text-slate-400 transition hover:text-[#6257E8] dark:hover:text-indigo-400">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 2xl:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#20B981]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">System Online</span>
          </div>
          <ThemeSelector />
          <Link href="/login" className="text-[13px] font-semibold text-[#171827] transition hover:text-[#6257E8] dark:text-slate-300 dark:hover:text-indigo-400">Sign in</Link>
          <a href="#demo" className="rounded-xl bg-[#6257E8] hover:bg-[#5246D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_3px_12px_-2px_rgba(98,87,232,0.42)] transition-all">Request Demo</a>
        </div>

        <button className="rounded-lg p-2 text-slate-700 dark:text-slate-300 xl:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#E8E8EF] dark:border-slate-800 px-4 pb-5 pt-2 xl:hidden">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-[15px] text-slate-700 dark:text-slate-300">
              {n.label}
            </a>
          ))}
          <ThemeSelector className="mt-3 w-fit" />
          <div className="mt-3 flex gap-2">
            <Link href="/login" className="flex-1 rounded-xl border border-[#E8E8EF] dark:border-slate-800 py-2.5 text-center text-[14px] font-medium text-[#171827] dark:text-white">Sign in</Link>
            <a href="#demo" onClick={() => setOpen(false)} className="flex-1 rounded-xl bg-[#6257E8] py-2.5 text-center text-xs font-semibold text-white">Request Demo</a>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    { t: "Product", l: [["Workflow Studio", "#workflow-studio"], ["Agent fleet", "#agents"], ["Madhyam IDE", "#ide"], ["Docs & connectors", "#docs"], ["Why Madhyam", "#why"], ["Mobile app", "#mobile"], ["Pricing", "#pricing"]] },
    { t: "Platform", l: [["Madhyam IDE", "/desktop"], ["Organizations", "/orgs"], ["Showcase", "/showcase"]] },
    { t: "Account", l: [["Sign in", "/login"], ["Create account", "/register"], ["Request demo", "#demo"]] },
  ];
  return (
    <footer className="border-t border-[#E8E8EF] bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <MadhyamLogo size={34} subtitle="Intent → Execution" />
          <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-[#737586] dark:text-slate-400">
            AI-powered technical workflow orchestration for engineering managers, developers and software teams.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#737586] dark:text-slate-400">{c.t}</div>
            <ul className="mt-4 space-y-2.5">
              {c.l.map(([label, href]) => (
                <li key={label}><a href={href} className="text-[14px] text-[#737586] dark:text-slate-400 transition hover:text-[#6257E8] dark:hover:text-white">{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#E8E8EF] dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-[12px] text-[#737586] dark:text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Madhyam AI. All rights reserved.</span>
          <span className="max-w-2xl md:text-right">
            Product vision: the workflow compiler, durable workflow engine, role-based inbox and process analytics are proposed additions.
            Interface examples are illustrative.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function MadhyamLanding() {
  return (
    <div className={`min-h-screen scroll-smooth ${inter.className} bg-[#F5F5F8] text-[#171827] antialiased selection:bg-[#EEECFF] selection:text-[#6257E8] dark:bg-slate-950 dark:text-white`}>
      <Nav />
      <main className="[&>section:nth-of-type(even)]:bg-white dark:[&>section:nth-of-type(even)]:bg-slate-900/50">
        <Hero />
        <ImpactCounters
          stats={[
            { label: "Agent runtimes", value: 5, suffix: "", color: "text-[#6257E8]" },
            { label: "Runner PCs per fleet", value: 10, suffix: "+", color: "text-[#9A8AEF]" },
            { label: "Connectors", value: 18, suffix: "", color: "text-[#20B981]" },
            { label: "Product tiers", value: 3, suffix: "", color: "text-[#F59E0B]" },
          ]}
        />
        <ValueStrip />
        <Audiences />
        <WorkflowStudio />
        <Assignment />
        <AgentFleet />
        <MadhyamIDE />
        <GitHubIntelligence />
        <DocsConnectors />
        <MobileSection />
        <Journey />
        <Architecture />
        <WhyMadhyam />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
