"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, User as UserIcon, Code2, MapPin, Loader2, Github, SunMoon, Settings as SettingsIcon } from "lucide-react";
import GitSettings from "@/components/settings/GitSettings";
import ThemeSelector from "@/components/theme/ThemeSelector";

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

  const Field = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground">{label}</label>
      {description && <p className="text-[11px] text-muted">{description}</p>}
      {children}
    </div>
  );

  const inputCls = "w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:bg-card focus:ring-3 focus:ring-primary/15 focus:border-primary transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="saas-card-featured p-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          Workspace Preferences
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your profile information, appearance, and developer integrations.</p>
      </div>

      {/* Appearance */}
      <div className="saas-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-background/40">
          <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
            <SunMoon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-none">Appearance</h2>
            <p className="text-[11px] text-muted mt-1">Choose how Madhyam AI looks across your devices.</p>
          </div>
        </div>
        <div className="p-5 space-y-2">
          <label className="block text-xs font-semibold text-foreground">Interface Theme</label>
          <ThemeSelector />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile section */}
        <div className="saas-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-background/40">
            <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-none">Profile Information</h2>
              <p className="text-[11px] text-muted mt-1">Displayed publicly on your contributor profile and proposals.</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <Field label="Bio" description="Share a brief summary of your background, focus areas, and interests.">
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell the community about yourself and your interests…"
                className={`${inputCls} min-h-[100px] resize-none leading-relaxed`}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Location">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Platform Role">
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="user">User</option>
                  <option value="sankalp_member">Madhyam Member</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Technical section */}
        <div className="saas-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-background/40">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/12 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-none">Skills &amp; Technical Profile</h2>
              <p className="text-[11px] text-muted mt-1">Used to match you with relevant proposals and development seasons.</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <Field label="Skills (comma-separated)">
              <input
                type="text"
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, TypeScript, Python, Docker…"
                className={inputCls}
              />
            </Field>
            <Field label="GitHub Profile URL">
              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="url"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Git integration */}
        <div className="saas-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-background/40">
            <h2 className="text-sm font-bold text-foreground leading-none">Git Integration</h2>
            <p className="text-[11px] text-muted mt-1">Connect your repository activity and commit metrics.</p>
          </div>
          <div className="p-5">
            {session?.user && <GitSettings userId={(session.user as any).id} />}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-4 pt-1">
          {success && (
            <span className="pill-success text-xs font-semibold px-3 py-1.5 rounded-full">
              ✓ Profile saved successfully
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all shadow-[0_2px_10px_-2px_rgba(98,87,232,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
