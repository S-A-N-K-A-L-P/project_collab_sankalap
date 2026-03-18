"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, User as UserIcon, Shield, Code2, MapPin, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    skills: "",
    role: "user",
  });

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setFormData({
        bio: u.bio || "",
        location: u.location || "",
        skills: u.skills?.join(", ") || "",
        role: u.role || "user",
      });
    }
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
        setTimeout(() => setSuccess(false), 3000);
        await update(); // Update next-auth session
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Command Center</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Configure your digital identity and system telemetry.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section 1: Identity */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="w-3 h-3" /> Identity Layer
            </h3>
            <p className="text-[10px] text-slate-400 font-medium italic">Public telemetry visible to the network.</p>
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Bio / Mission Statement</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Architecting the future of decentralized coordination..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Location / Node</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Monaco, HQ"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Assigned Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="user">USER</option>
                    <option value="pixel_member">PIXEL MEMBER</option>
                    <option value="project_lead">PROJECT LEAD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specs */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <Code2 className="w-3 h-3" /> Technical Specs
            </h3>
            <p className="text-[10px] text-slate-400 font-medium italic">Skills and stack configuration.</p>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Skills (Comma Separated)</label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="React, TypeScript, Solidity, Rust..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {success && (
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-black text-green-500 uppercase tracking-widest italic"
            >
              Telemetry Updated Successfully
            </motion.p>
          )}
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  );
}
