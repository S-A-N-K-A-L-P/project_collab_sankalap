"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, ArrowUpAZ, Building2, Loader2, Plus, Search, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import OrgCard from "@/components/org/OrgCard";
import type { IOrgPublic } from "@/types/org";

const CATEGORIES = [
  { value: "",            label: "All Organizations" },
  { value: "community",   label: "Community" },
  { value: "academic",    label: "Academic & Research" },
  { value: "company",     label: "Companies" },
  { value: "open_source", label: "Open Source" },
];

type SortMode = "featured" | "az" | "za";

export default function OrgsDirectoryPage() {
  const { data: session } = useSession();
  const [orgs, setOrgs]               = useState<IOrgPublic[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory]       = useState("");
  const [sort, setSort]               = useState<SortMode>("featured");
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);

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
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const sortedOrgs = useMemo(() => {
    const next = [...orgs];
    if (sort === "az") next.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") next.sort((a, b) => b.name.localeCompare(a.name));
    return next;
  }, [orgs, sort]);

  return (
    <AppLayoutClient wide hideRightPanel>
      <div className="max-w-6xl mx-auto space-y-6 pb-10">

        {/* Featured SaaS Hero Header */}
        <section className="saas-card-featured p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
                <Building2 className="w-3.5 h-3.5" />
                Organizations & Builder Hubs
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Organizations
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                Discover communities, research labs, companies, and open-source teams launching mentored initiatives on Madhyam AI.
              </p>
            </div>

            <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
              <div className="saas-card px-4 py-2.5 text-right">
                <div className="text-xl font-bold text-primary tabular-nums leading-none">{total}</div>
                <div className="text-[11px] font-medium text-muted mt-1">Active Orgs</div>
              </div>
              {session && (
                <a
                  href="/orgs/launch"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-[0_3px_12px_-2px_rgba(98,87,232,0.40)] transition-all"
                >
                  <Plus size={15} /> Launch Organization
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="saas-card p-4 space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search organizations, technology, or research topics…"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted outline-none transition-all focus:border-primary focus:bg-card focus:ring-3 focus:ring-primary/15"
              />
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-1.5 self-start lg:self-auto">
              <span className="mr-1 text-xs font-medium text-muted">Sort:</span>
              <SortButton active={sort === "featured"} onClick={() => setSort("featured")} icon={<Sparkles size={13} />} label="Featured" />
              <SortButton active={sort === "az"}       onClick={() => setSort("az")}       icon={<ArrowDownAZ size={13} />} label="A–Z" />
              <SortButton active={sort === "za"}       onClick={() => setSort("za")}       icon={<ArrowUpAZ size={13} />}   label="Z–A" />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
            {CATEGORIES.map((item) => {
              const active = category === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => { setCategory(item.value); setPage(1); }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
                    active
                      ? "bg-primary border-primary text-white shadow-[0_2px_8px_-2px_rgba(98,87,232,0.38)]"
                      : "border-border bg-card text-muted hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Organizations Grid */}
        <section>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary" size={26} />
                <p className="text-xs text-muted">Loading organizations…</p>
              </motion.div>
            ) : !sortedOrgs.length ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="saas-card flex flex-col items-center justify-center py-16 text-center px-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
                  <Building2 size={22} className="text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">No organizations found</h2>
                <p className="mt-1 text-xs text-muted">Try another category or search term.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {sortedOrgs.map((org, index) => (
                  <OrgCard key={org._id} org={org} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {total > 24 && !loading && (
            <div className="mt-8 flex justify-center items-center gap-3">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-background disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-xs font-medium text-muted">Page {page}</span>
              <button
                onClick={() => setPage((value) => value + 1)}
                disabled={orgs.length < 24}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-background disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </AppLayoutClient>
  );
}

function SortButton({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8.5 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all cursor-pointer ${
        active
          ? "border-primary/25 bg-primary-light text-primary"
          : "border-border bg-card text-muted hover:text-foreground hover:border-primary/25"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
