"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { BrandMark } from "./BrandMark";
import { NAV_LINKS } from "./content";

/** Top navigation for the public pages: brand, section links, sign-in and join. */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6" aria-label="Main">
        <BrandMark />

        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeSelector />
          <Link href="/login" className="px-3 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-[14px] font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Join the community
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pb-5 pt-2">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg bg-indigo-600 px-4 py-3 text-center text-[15px] font-semibold text-white">
              Join the community
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-[15px] font-medium text-slate-700 dark:text-slate-200">
              Sign in
            </Link>
            <ThemeSelector className="mt-2 self-start" />
          </div>
        </div>
      )}
    </header>
  );
}
