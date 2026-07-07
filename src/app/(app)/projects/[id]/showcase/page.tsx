"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import {
  Loader2, ArrowLeft, Save, Eye, EyeOff, ExternalLink,
  Plus, CheckCircle2,
} from "lucide-react";

export default function ProjectShowcaseEditorPage() {
  const { id }    = useParams();
  const projectId = id as string;

  const [project, setProject]   = useState<any | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [savedAt, setSavedAt]   = useState<Date | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const [isPublic, setIsPublic]           = useState(true);
  const [forSale, setForSale]             = useState(false);
  const [licenseType, setLicenseType]     = useState("one-time");
  const [priceINR, setPriceINR]           = useState(0);
  const [contactEmail, setContactEmail]   = useState("");
  const [coverImage, setCoverImage]       = useState("");
  const [liveUrl, setLiveUrl]             = useState("");
  const [demoVideoUrl, setDemoVideoUrl]   = useState("");

  // New release form
  const [newVersion, setNewVersion]   = useState("");
  const [newNotes, setNewNotes]       = useState("");
  const [releasing, setReleasing]     = useState(false);

  useEffect(() => {
    fetch(`/api/projects?id=${projectId}`)
      .then(async r => r.ok ? r.json() : null)
      .then(p => {
        if (!p) { setError("Project not found"); return; }
        setProject(p);
        setIsPublic(p.showcase?.isPublic ?? true);
        setForSale(p.marketplace?.forSale ?? false);
        setLicenseType(p.marketplace?.licenseType || "one-time");
        setPriceINR(p.marketplace?.priceINR || 0);
        setContactEmail(p.marketplace?.contactEmail || "");
        setCoverImage(p.coverImage || "");
        setLiveUrl(p.liveUrl || "");
        setDemoVideoUrl(p.demoVideoUrl || "");
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  async function saveSettings() {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/showcase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showcase:    { isPublic },
          marketplace: { forSale, licenseType, priceINR, contactEmail },
          coverImage, liveUrl, demoVideoUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProject(json.project);
      setSavedAt(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  async function pushRelease() {
    if (!newVersion.trim() || !/^v?\d+\.\d+\.\d+/.test(newVersion)) {
      setError("Version must be semver (e.g. v1.1.0)");
      return;
    }
    setReleasing(true); setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/showcase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newRelease: { version: newVersion, notes: newNotes },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProject(json.project);
      setNewVersion(""); setNewNotes("");
      setSavedAt(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally { setReleasing(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-foreground">{error || "Project not found"}</p>
      </div>
    );
  }

  if (project.status !== "completed") {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-sm font-semibold text-foreground">This project is not yet complete</p>
        <p className="text-xs text-muted mt-1">Mark it complete from the project page to set up its showcase.</p>
        <NextLink href={`/projects/${projectId}`} className="inline-block mt-4 text-sm text-primary hover:underline">
          ← Back to project
        </NextLink>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <NextLink href={`/projects/${projectId}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Project
        </NextLink>
        <NextLink href={`/showcase/${projectId}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ExternalLink className="w-3.5 h-3.5" /> View public page
        </NextLink>
      </div>

      <div className="bg-card border-l-4 border-l-primary border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Showcase Settings</h1>
        <p className="text-sm text-muted mt-1">Manage how <strong>{project.title}</strong> appears in the public Showcase &amp; Marketplace.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Visibility */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-foreground">Visibility</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-border text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              {isPublic ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted" />}
              Listed in public Showcase
            </p>
            <p className="text-xs text-muted mt-0.5">Anyone can find this project at /showcase/{projectId.slice(-6)}…</p>
          </div>
        </label>
      </section>

      {/* Display assets */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-foreground">Display</h2>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Cover image URL</label>
          <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Live URL</label>
          <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://..." className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Demo video URL</label>
          <input type="url" value={demoVideoUrl} onChange={e => setDemoVideoUrl(e.target.value)} placeholder="https://loom.com/..." className={inputCls} />
        </div>
      </section>

      {/* Marketplace */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-foreground">Marketplace listing</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={forSale} onChange={e => setForSale(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-border text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-foreground">Available for sale / licensing</p>
            <p className="text-xs text-muted mt-0.5">{project.marketplace?.inquiriesCount || 0} inquiries so far</p>
          </div>
        </label>
        {forSale && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">License type</label>
              <select value={licenseType} onChange={e => setLicenseType(e.target.value)} className={inputCls}>
                <option value="one-time">One-time</option>
                <option value="subscription">Subscription</option>
                <option value="open-source">Open-source / donation</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Price (INR)</label>
              <input type="number" value={priceINR} onChange={e => setPriceINR(Number(e.target.value) || 0)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted mb-1">Contact email</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}
      </section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {savedAt && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved at {savedAt.toLocaleTimeString()}
          </span>
        )}
        <button onClick={saveSettings} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </button>
      </div>

      {/* New release */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Push a new release</h2>
          <p className="text-xs text-muted mt-1">Current version: <strong>{project.version || "—"}</strong></p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">New version</label>
          <input type="text" value={newVersion} onChange={e => setNewVersion(e.target.value)} placeholder="v1.1.0" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Release notes</label>
          <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={4} className={`${inputCls} resize-none`} placeholder="What changed?" />
        </div>
        <div className="flex justify-end">
          <button onClick={pushRelease} disabled={releasing || !newVersion}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold">
            {releasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publish release
          </button>
        </div>

        {/* Existing releases */}
        {project.releases && project.releases.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted mb-2">Release history</p>
            <ol className="space-y-1.5 text-sm">
              {project.releases.slice().reverse().map((r: any, i: number) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="font-bold text-foreground">{r.version}</span>
                  <span className="text-xs text-muted">
                    {new Date(r.releasedAt).toLocaleDateString("en-GB", { day:"numeric",month:"short",year:"numeric" })}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
