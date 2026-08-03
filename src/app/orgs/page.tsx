"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, ArrowUpAZ, Building2, Grid3X3, Loader2, Plus, Search, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import OrgCard from "@/components/org/OrgCard";
import type { IOrgPublic } from "@/types/org";

const CATEGORIES = [
  { value: "", label: "All organizations" },
  { value: "community", label: "Community" },
  { value: "academic", label: "Academic & Research" },
  { value: "company", label: "Companies" },
  { value: "open_source", label: "Open Source" },
];

type SortMode = "featured" | "az" | "za";

export default function OrgsDirectoryPage() {
  const { data: session } = useSession();
  const [orgs, setOrgs] = useState<IOrgPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortMode>("featured");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const response = await fetch(`/api/orgs?${params}`);
      const data = await response.json();
      setOrgs(data.orgs || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);
  useEffect(() => { const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350); return () => clearTimeout(timer); }, [searchInput]);

  const sortedOrgs = useMemo(() => {
    const next = [...orgs];
    if (sort === "az") next.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") next.sort((a, b) => b.name.localeCompare(a.name));
    return next;
  }, [orgs, sort]);

  return (
    <AppLayoutClient wide hideRightPanel>
      <div className="overflow-hidden rounded-[32px] bg-[#f3f5f9] text-slate-950 dark:bg-slate-950 dark:text-white">
        <section className="relative min-h-[260px] overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 px-7 py-10 text-white md:px-12 md:py-12">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1.2px, transparent 1.2px)", backgroundSize: "26px 26px", maskImage: "linear-gradient(to left, black, transparent 72%)" }} />
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-8 md:flex-row md:items-end">
            <div><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-blue-100"><Sparkles size={15} /> Build together</div><h1 className="font-mono text-4xl font-medium tracking-tight md:text-6xl">Organizations</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-blue-100 md:text-base">Discover communities, research groups, companies, and open-source teams launching mentored projects on Syncro.</p></div>
            <div className="flex items-center gap-4"><div className="text-right"><div className="text-3xl font-black">{total}</div><div className="text-xs text-blue-100">active organizations</div></div>{session && <a href="/orgs/launch" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-xl transition-transform hover:-translate-y-1"><Plus size={16} /> Launch organization</a>}</div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-200/65 px-6 py-7 dark:border-white/10 dark:bg-white/5 md:px-10">
          <div className="flex flex-wrap gap-2">{CATEGORIES.map((item) => <button key={item.value} onClick={() => { setCategory(item.value); setPage(1); }} className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all ${category === item.value ? "bg-blue-600 text-white shadow-blue-500/25" : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"}`}>{category === item.value && <span className="mr-1.5">✓</span>}{item.label}</button>)}</div>
        </section>

        <section className="px-6 py-8 md:px-10 md:py-10">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search organizations, technology or topics" className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900" /></div>
            <div className="flex items-center gap-2 self-end"><span className="mr-1 text-xs text-slate-500">Sort by</span><SortButton active={sort === "featured"} onClick={() => setSort("featured")} icon={<Sparkles size={14} />} label="Featured" /><SortButton active={sort === "az"} onClick={() => setSort("az")} icon={<ArrowDownAZ size={14} />} label="A–Z" /><SortButton active={sort === "za"} onClick={() => setSort("za")} icon={<ArrowUpAZ size={14} />} label="Z–A" /><span className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"><Grid3X3 size={16} /></span></div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? <motion.div key="loading" className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={30} /></motion.div> : !sortedOrgs.length ? <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 dark:border-white/15 dark:bg-slate-900"><Building2 size={34} className="mb-3 text-slate-400" /><h2 className="font-bold">No organizations found</h2><p className="mt-1 text-sm text-slate-500">Try another category or search term.</p></motion.div> : <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{sortedOrgs.map((org, index) => <OrgCard key={org._id} org={org} index={index} />)}</motion.div>}
          </AnimatePresence>

          {total > 24 && !loading && <div className="mt-10 flex justify-center gap-3"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-30">Previous</button><span className="px-3 py-2 text-sm text-slate-500">Page {page}</span><button onClick={() => setPage((value) => value + 1)} disabled={orgs.length < 24} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-30">Next</button></div>}
        </section>
      </div>
    </AppLayoutClient>
  );
}

function SortButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${active ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"}`}>{icon}{label}</button>; }
