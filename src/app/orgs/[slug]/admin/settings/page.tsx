"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, Save, Check } from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ui/ImageUploader";

export default function OrgAdminSettingsPage() {
  const { org, loading: loadingOrg, error: orgError, isAdmin, refresh } = useOrg();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    tagline: "",
    charter: "",
    roadmap: "",
    website: "",
    email: "",
    logo: "",
    bannerImage: "",
    themeColor: "#6366f1",
    visibility: "public",
    socialLinks: {
      github: "",
      twitter: "",
      linkedin: "",
      discord: "",
    },
  });

  useEffect(() => {
    if (!loadingOrg) {
      if (!org) {
        router.push("/orgs");
        return;
      }
      if (!isAdmin) {
        router.push(`/orgs/${org.slug}`);
        return;
      }
      // Populate form
      setForm({
        name: org.name || "",
        description: org.description || "",
        tagline: org.tagline || "",
        charter: org.charter || "",
        roadmap: org.roadmap || "",
        website: org.website || "",
        email: org.email || "",
        logo: org.logo || org.avatar || "",
        bannerImage: org.bannerImage || org.banner || "",
        themeColor: org.themeColor || "#6366f1",
        visibility: org.visibility || "public",
        socialLinks: {
          github: org.socialLinks?.github || "",
          twitter: org.socialLinks?.twitter || "",
          linkedin: org.socialLinks?.linkedin || "",
          discord: org.socialLinks?.discord || "",
        },
      });
    }
  }, [loadingOrg, org, isAdmin]);

  const handleChange = (field: string, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSocialChange = (field: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: val },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${org?.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update settings");
      }

      setSuccess(true);
      await refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  if (orgError || !org || !isAdmin) return null;

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 transition-all";
  const labelCls = "block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top Header */}
      <div className="border-b border-white/8 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <a href={`/orgs/${org.slug}/admin`} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="font-bold text-white">Organization Settings</h1>
            <p className="text-xs text-white/40">Modify branding and core properties of {org.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/20 flex items-start gap-2">
              <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center gap-2 text-emerald-400">
              <Check size={16} />
              <p className="text-sm">Settings saved successfully!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Details */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Organization Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="Short tagline (max 120 chars)"
                  maxLength={120}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Mission Charter</label>
                <textarea
                  value={form.charter}
                  onChange={(e) => handleChange("charter", e.target.value)}
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Roadmap</label>
                <textarea
                  value={form.roadmap}
                  onChange={(e) => handleChange("roadmap", e.target.value)}
                  rows={3}
                  placeholder="Markdown roadmap phases..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* Right Column: Branding & Media */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Logo</label>
                <ImageUploader
                  folder="sankalp/orgs/logos"
                  value={form.logo}
                  onUpload={(url) => handleChange("logo", url)}
                  aspectRatio="1/1"
                  maxSizeLabel="2 MB max"
                />
              </div>

              <div>
                <label className={labelCls}>Banner Image</label>
                <ImageUploader
                  folder="sankalp/orgs/banners"
                  value={form.bannerImage}
                  onUpload={(url) => handleChange("bannerImage", url)}
                  aspectRatio="16/5"
                  maxSizeLabel="5 MB max"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="info@yourorg.com"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <label className={labelCls}>Social Handles</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.socialLinks.github}
                    onChange={(e) => handleSocialChange("github", e.target.value)}
                    placeholder="GitHub Org"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={form.socialLinks.twitter}
                    onChange={(e) => handleSocialChange("twitter", e.target.value)}
                    placeholder="Twitter Handle"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={form.socialLinks.discord}
                    onChange={(e) => handleSocialChange("discord", e.target.value)}
                    placeholder="Discord Invite / ID"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={form.socialLinks.linkedin}
                    onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                    placeholder="LinkedIn URL"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
