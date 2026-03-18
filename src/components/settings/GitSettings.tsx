"use client";

import { useState, useEffect } from "react";
import { 
  GitBranch, Plus, Trash2, RefreshCw, 
  ExternalLink, Zap, CheckCircle2, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GitSettings({ userId }: { userId: string }) {
  const [repos, setRepos] = useState<any[]>([]);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchRepos = async () => {
    try {
      const res = await fetch(`/api/git/user?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [userId]);

  const handleLinkRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl) return;
    setLoading(true);

    try {
      const res = await fetch("/api/git/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: newRepoUrl }),
      });

      if (res.ok) {
        setNewRepoUrl("");
        await fetchRepos();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (repoId: string) => {
    try {
      const res = await fetch("/api/git/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId }),
      });
      if (res.ok) {
        // Optimistic update
        setRepos(repos.map(r => r._id === repoId ? { ...r, syncStatus: "syncing" } : r));
        // Refresh after some time
        setTimeout(fetchRepos, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-[10px] font-bold text-[#6366f1] uppercase tracking-[0.15em] flex items-center gap-2 font-mono">
          <GitBranch className="w-3.5 h-3.5" /> Git Protocol Layer
        </h3>
        <p className="text-[11px] text-[#9ca3af] font-medium leading-relaxed">Synchronize your personal repository telemetry into the collective layer.</p>
      </div>

      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Add Repo Form */}
        <form onSubmit={handleLinkRepo} className="flex gap-3">
          <input 
            type="text" 
            value={newRepoUrl}
            onChange={(e) => setNewRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="flex-1 px-4 py-3 bg-[#0b0b0c] border border-[#1f1f23] rounded-xl text-[13px] font-medium outline-none focus:border-[#6366f1]/50 transition-all text-[#e5e7eb] placeholder:text-[#1f1f23]"
          />
          <button 
            type="submit"
            disabled={loading || !newRepoUrl}
            className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Link Node
          </button>
        </form>

        {/* Repo List */}
        <div className="space-y-3">
          {fetching ? (
            <div className="py-8 text-center"><RefreshCw className="w-6 h-6 animate-spin text-[#1f1f23] mx-auto" /></div>
          ) : repos.length === 0 ? (
            <div className="py-8 text-center text-[11px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest italic border-2 border-dashed border-[#1f1f23] rounded-2xl">
              No tactical nodes synchronized.
            </div>
          ) : (
            repos.map((repo) => (
              <div key={repo._id} className="p-4 bg-[#0b0b0c] border border-[#1f1f23] rounded-xl flex items-center justify-between group hover:border-[#2a2a2f] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-[#1f1f23]">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#e5e7eb] tracking-tight">{repo.repoName}</span>
                    <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase">{repo.owner} / {repo.defaultBranch}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                      repo.syncStatus === 'verified' ? 'text-emerald-500' : 
                      repo.syncStatus === 'syncing' ? 'text-[#6366f1]' : 
                      'text-[#1f1f23]'
                    }`}>
                      {repo.syncStatus === 'syncing' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                      {repo.syncStatus === 'verified' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {repo.syncStatus}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-[#1f1f23] uppercase">Signal Strength: 100%</span>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleScan(repo._id)}
                      className="p-2 rounded-lg bg-[#121214] border border-[#1f1f23] text-[#1f1f23] hover:text-[#6366f1] hover:border-[#6366f1]/30 transition-all"
                      title="Trigger Scan"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-lg bg-[#121214] border border-[#1f1f23] text-[#1f1f23] hover:text-red-500 hover:border-red-500/30 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
