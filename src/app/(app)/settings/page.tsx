"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, User as UserIcon, Shield, Code2, MapPin, Loader2, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import GitSettings from "@/components/settings/GitSettings";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    skills: "",
    role: "user",
    github: "",
  });

  const fetchProfile = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          bio: data.bio || "",
          location: data.location || "",
          skills: data.skills?.join(", ") || "",
          role: data.role || "user",
          github: data.github || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(true), 100); // Trigger re-render pulse
        setTimeout(() => setSuccess(false), 3000);
        await fetchProfile();
        await update();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-surface p-8 rounded-2xl border border-border-subtle shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Control Center</h1>
        <p className="text-muted text-[13px] font-medium mt-2 leading-relaxed">Configure your node telemetry and identity within the collective network.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
          {/* Section 1: Identity */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.15em] flex items-center gap-2 font-mono">
              <UserIcon className="w-3.5 h-3.5" /> Identity Layer
            </h3>
            <p className="text-[11px] text-muted font-medium leading-relaxed">Public telemetry visible to other nodes.</p>
          </div>

          <div className="md:col-span-2 bg-surface border border-border-subtle rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Bio / Mission Statement</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Architecting the future of decentralized coordination..."
                className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 transition-all min-h-[120px] text-foreground placeholder:text-muted"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Location / Node</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Monaco, HQ"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 transition-all text-foreground placeholder:text-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Protocol Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-black uppercase outline-none focus:border-accent/50 transition-all appearance-none text-foreground cursor-pointer"
                  >
                    <option value="user">USER / NODE</option>
                    <option value="pixel_member">PIXEL MEMBER / CORE</option>
                    <option value="project_lead">PROJECT LEAD / ARCHITECT</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specs */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.15em] flex items-center gap-2 font-mono">
              <Code2 className="w-3.5 h-3.5" /> Technical Specs
            </h3>
            <p className="text-[11px] text-muted font-medium leading-relaxed">Skills and technical stack configuration.</p>
          </div>

          <div className="md:col-span-2 bg-surface border border-border-subtle rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Skills (Comma Separated)</label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, TypeScript, Solidity, Rust..."
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 transition-all text-foreground placeholder:text-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">GitHub Profile Link</label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/your-username"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border-subtle rounded-xl text-[13px] font-medium outline-none focus:border-accent/50 transition-all text-foreground placeholder:text-muted"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="h-px bg-border-subtle w-full my-4" />
          </div>

          <div className="md:col-span-3">
            {session?.user && <GitSettings userId={(session.user as any).id} />}
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-4">
          {success && (
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono"
            >
              Telemetry Updated
            </motion.p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-accent hover:bg-[#4f46e5] text-white rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-3 shadow-lg shadow-[0_0_18px_var(--accent-glow)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  );
}
