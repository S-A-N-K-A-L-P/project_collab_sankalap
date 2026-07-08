"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Building2, Filter, Loader2, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import OrgCard from "@/components/org/OrgCard";
import type { IOrgPublic } from "@/types/org";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

const CATEGORIES = [
  { value: "",            label: "All" },
  { value: "community",   label: "Community" },
  { value: "academic",    label: "Academic" },
  { value: "company",     label: "Company" },
  { value: "open_source", label: "Open Source" },
];

export default function OrgsDirectoryPage() {
  const { data: session } = useSession();
  const [orgs,     setOrgs]     = useState<IOrgPublic[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search)   params.set("search",   search);
      if (category) params.set("category", category);

      const res  = await fetch(`/api/orgs?${params}`);
      const data = await res.json();
      setOrgs(data.orgs || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(debouncedSearch); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [debouncedSearch]);

  return (
    <AppLayoutClient>
      <div className="text-foreground dark:text-white">
        {/* Page header — gradient banner */}
        <div className="relative overflow-hidden border-b border-border dark:border-white/8 sticky top-0 z-10 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-tertiary/10 dark:from-indigo-500/15 dark:via-purple-500/5 dark:to-teal-500/10" />
          <div className="absolute inset-0 bg-background/70 dark:bg-black/30 backdrop-blur-md" />
          <div className="relative flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between px-4 sm:px-6 py-5">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-tertiary dark:from-indigo-400 dark:to-purple-400 shadow-md">
                  <Globe size={18} className="text-white" />
                </span>
                Organizations
              </h1>
              <p className="text-xs text-muted-foreground dark:text-white/40 mt-1 ml-11">{total} active organizations</p>
            </div>
            {session && (
              <a
                href="/orgs/launch"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover dark:from-indigo-500 dark:to-purple-500 text-primary-foreground dark:text-white font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(79,70,229,0.35)] dark:shadow-[0_4px_24px_rgba(99,102,241,0.4)]"
              >
                <Plus size={14} /> Launch Org
              </a>
            )}
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/30" />
            <input
              type="text"
              placeholder="Search organizations…"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card dark:bg-white/5 border border-border dark:border-white/10 text-sm text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-white/30 shadow-sm focus:outline-none focus:border-primary dark:focus:border-indigo-400/60 focus:ring-2 focus:ring-primary/15 dark:focus:ring-indigo-400/15 transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-muted-foreground dark:text-white/30 flex-shrink-0" />
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  category === c.value
                    ? "bg-gradient-to-r from-primary to-primary-hover dark:from-indigo-500 dark:to-purple-500 border-transparent text-primary-foreground dark:text-white shadow-sm"
                    : "bg-card dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80 hover:border-primary/40 dark:hover:border-white/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={28} />
            </motion.div>
          ) : orgs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-dashed border-border dark:border-white/10 bg-gradient-to-b from-muted-bg dark:from-white/[0.02] to-transparent"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-tertiary/10 dark:from-indigo-500/10 dark:to-purple-500/10">
                <Building2 size={28} className="text-primary/50 dark:text-white/30" />
              </div>
              <p className="text-muted-foreground dark:text-white/40 text-sm">No organizations found</p>
              {session && (
                <a href="/orgs/launch" className="text-primary dark:text-indigo-400 text-sm font-medium hover:underline">
                  Be the first to launch one →
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {orgs.map((org, i) => (
                <OrgCard key={org._id} org={org} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {total > 24 && !loading && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm bg-card dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white hover:border-primary/40 dark:hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground dark:text-white/40">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={orgs.length < 24}
              className="px-4 py-2 rounded-lg text-sm bg-card dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white hover:border-primary/40 dark:hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
      </div>
    </AppLayoutClient>
  );
}
