"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, User as UserIcon, Code2, MapPin, Loader2, Github } from "lucide-react";
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

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card border-l-4 border-l-primary border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted mt-1">Update your profile information and preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-background/40">
            <UserIcon className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Profile Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <Field label="Bio">
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell the community about yourself and your interests…"
                className={`${inputCls} min-h-[100px] resize-none`}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Location">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Role">
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="user">User</option>
                  <option value="sankalp_member">Sankalp Member</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Technical section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-background/40">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-foreground">Skills &amp; Technical Profile</h2>
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
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-border bg-background/40">
            <h2 className="text-sm font-semibold text-foreground">Git Integration</h2>
          </div>
          <div className="p-5">
            {session?.user && <GitSettings userId={(session.user as any).id} />}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {success && (
            <span className="text-sm font-medium text-emerald-600">
              ✓ Profile saved successfully
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
      {session?.user && <GitSettings userId={(session.user as any).id} />}
    </div>
  );
}
