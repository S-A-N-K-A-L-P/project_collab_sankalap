"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Check, ExternalLink, Eye, EyeOff,
  Palette, Layers, Image as ImageIcon, Rocket,
  Save, AlertCircle
} from "lucide-react";
import type { IOrgPublic, IOrgMemberPopulated } from "@/types/org";
import SectionsEditor from "./SectionsEditor";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES } from "./themes/registry";
import {
  SECTION_ANIM_KINDS, SECTION_ANIMS, CARD_STYLES, CARD_ANIMS, CARD_ANIM_KINDS
} from "./animations";
import { defaultTitleFor, defaultContentFor, newSection, type SectionType, type PortfolioSection } from "./sections";
import OrgPortfolioRenderer from "./OrgPortfolioRenderer";

type Tab = "theme" | "background" | "sections" | "publish";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "theme",      label: "Theme",      icon: Palette },
  { id: "background", label: "Background", icon: ImageIcon },
  { id: "sections",   label: "Sections",   icon: Layers },
  { id: "publish",    label: "Publish",    icon: Rocket },
];

interface OrgPortfolioBuilderProps {
  slug: string;
}

export default function OrgPortfolioBuilder({ slug }: OrgPortfolioBuilderProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [org, setOrg] = useState<IOrgPublic | null>(null);
  const [members, setMembers] = useState<IOrgMemberPopulated[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [cfg, setCfg] = useState<any>({
    themeId: "aurora",
    accent: "",
    accent2: "",
    bgOverride: "",
    threeOverride: "",
    card: "",
    sectionAnim: "rise",
    projectCardStyle: "glass",
    projectCardAnim: "rise",
    sections: [],
    seo: { title: "", description: "" }
  });

  const [tab, setTab] = useState<Tab>("theme");

  const loadData = async () => {
    setLoading(true);
    try {
      const [resPublic, resPortfolio, resProjects] = await Promise.all([
        fetch(`/api/orgs/${slug}`),
        fetch(`/api/orgs/${slug}/portfolio`),
        fetch(`/api/orgs/${slug}/projects`),
      ]);

      if (resPublic.ok && resPortfolio.ok && resProjects.ok) {
        const dataPublic = await resPublic.json();
        const dataPortfolio = await resPortfolio.json();
        const dataProjects = await resProjects.json();

        setOrg(dataPublic.org);
        setMembers(dataPublic.members || []);
        setProjects(dataProjects.projects || []);

        if (dataPortfolio.portfolio) {
          setCfg(dataPortfolio.portfolio);
        } else {
          // Initialize default org sections
          const defaultSecs = ["hero", "mission", "team", "org_stats", "join_cta", "contact"]
            .map((t, idx) => ({
              id: `sec-${idx}-${t}`,
              type: t as SectionType,
              title: defaultTitleFor(t as SectionType),
              enabled: true,
              order: idx,
              content: defaultContentFor(t as SectionType),
            }));
          setCfg((prev: any) => ({ ...prev, sections: defaultSecs }));
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load builder data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [slug]);

  // Debounced autosave
  const saveTimer = useRef<any>(null);
  const queueSave = (next: any) => {
    setCfg(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), 800);
  };

  async function save(next: any) {
    setSaving(true);
    setError(null);
    try {
      const { _id, orgId, createdAt, updatedAt, views, __v, published, lastPublishedAt, ...payload } = next;
      const res = await fetch(`/api/orgs/${slug}/portfolio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSavedAt(new Date());
      else throw new Error("Failed to auto-save");
    } catch (err: any) {
      setError("Auto-save failed");
    } finally {
      setSaving(false);
    }
  }

  const set = (patch: any) => queueSave({ ...cfg, ...patch });

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${slug}/portfolio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cfg, publish: true }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      setSavedAt(new Date());
      // Refresh local org state to update portfolioEnabled flag
      if (org) setOrg({ ...org, portfolioEnabled: true });
    } catch (err: any) {
      setError(err.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  if (error && !org) {
    return (
      <div className="h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Error</h2>
          <p className="text-sm text-white/50">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Top Navbar */}
      <div className="h-14 border-b border-white/8 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <a href={`/orgs/${slug}/admin`} className="text-white/40 hover:text-white/80 transition-colors text-sm font-semibold">
            ← Console
          </a>
          <span className="text-white/20">|</span>
          <span className="text-sm font-semibold text-white/80">Page Designer: {org?.name}</span>
        </div>

        <div className="flex items-center gap-4">
          {saving ? (
            <span className="text-xs text-white/40 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
          ) : savedAt ? (
            <span className="text-xs text-white/40">Saved at {savedAt.toLocaleTimeString()}</span>
          ) : null}

          <a
            href={`/orgs/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold transition-all"
          >
            Preview Live <ExternalLink size={12} />
          </a>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
          >
            {publishing ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
            Publish
          </button>
        </div>
      </div>

      {/* Main Panel splitting Editor and Live Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Controls (400px width) */}
        <div className="w-[380px] shrink-0 border-r border-white/8 bg-black/20 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex p-1 bg-white/5 border-b border-white/5 gap-0.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                    tab === t.id
                      ? "bg-white/10 text-indigo-400"
                      : "text-white/40 hover:text-white/70 hover:bg-white/4"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Left panel scroll contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* TAB: Theme Select */}
            {tab === "theme" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Preset Themes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => set({ themeId: theme.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          cfg.themeId === theme.id
                            ? "border-indigo-500/80 bg-indigo-500/10 text-white"
                            : "border-white/8 bg-white/4 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-bold block">{theme.name}</span>
                        <div className="flex gap-1.5 mt-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.palette.accent }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.palette.accent2 }} />
                          <span className="w-3 h-3 rounded-full bg-slate-800" style={{ backgroundColor: theme.palette.bg }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Accent Overrides</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={cfg.accent || THEMES.find(t => t.id === cfg.themeId)?.palette.accent || "#6366f1"}
                      onChange={(e) => set({ accent: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      type="color"
                      value={cfg.accent2 || THEMES.find(t => t.id === cfg.themeId)?.palette.accent2 || "#a855f7"}
                      onChange={(e) => set({ accent2: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                    />
                    <button
                      onClick={() => set({ accent: "", accent2: "" })}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      Reset Overrides
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Background Design */}
            {tab === "background" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">2D Art Style</label>
                  <select
                    value={cfg.bgOverride || ""}
                    onChange={(e) => set({ bgOverride: e.target.value || "" })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                  >
                    <option value="" className="bg-gray-900">Default Theme Background</option>
                    {ALL_BACKGROUNDS.map(bg => (
                      <option key={bg} value={bg} className="bg-gray-900">{bg.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">3D Scene (Three.js)</label>
                  <select
                    value={cfg.threeOverride || ""}
                    onChange={(e) => set({ threeOverride: e.target.value || "" })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                  >
                    <option value="" className="bg-gray-900">Default Theme 3D Scene</option>
                    <option value="none" className="bg-gray-900">Disable 3D (Faster Rendering)</option>
                    {ALL_THREE_SCENES.map(scene => (
                      <option key={scene} value={scene} className="bg-gray-900">{scene.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Card Style</label>
                  <select
                    value={cfg.card || ""}
                    onChange={(e) => set({ card: e.target.value || "" })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                  >
                    <option value="" className="bg-gray-900">Theme Card Style</option>
                    <option value="glass" className="bg-gray-900">GLASS</option>
                    <option value="solid" className="bg-gray-900">SOLID</option>
                    <option value="outline" className="bg-gray-900">OUTLINE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Section Anim</label>
                  <select
                    value={cfg.sectionAnim || "rise"}
                    onChange={(e) => set({ sectionAnim: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                  >
                    {SECTION_ANIM_KINDS.map(anim => (
                      <option key={anim} value={anim} className="bg-gray-900">{anim.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB: Ordered Layout Sections */}
            {tab === "sections" && (
              <SectionsEditor
                sections={cfg.sections || []}
                available={projects}
                onChange={(next) => set({ sections: next })}
              />
            )}

            {/* TAB: SEO & Publishing Metadata */}
            {tab === "publish" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">SEO Meta Title</label>
                  <input
                    type="text"
                    value={cfg.seo?.title || ""}
                    onChange={(e) => set({ seo: { ...cfg.seo, title: e.target.value } })}
                    placeholder={org?.name}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">SEO Meta Description</label>
                  <textarea
                    value={cfg.seo?.description || ""}
                    onChange={(e) => set({ seo: { ...cfg.seo, description: e.target.value } })}
                    placeholder={org?.tagline || org?.description}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Reactive Realtime Preview Pane */}
        <div className="flex-1 bg-[#060608] relative overflow-hidden flex flex-col">
          {/* Subtle indicator */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] font-semibold text-white/60 uppercase tracking-wider pointer-events-none select-none">
            Interactive Editor Preview
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <OrgPortfolioRenderer
              org={org!}
              portfolio={cfg}
              members={members}
              projects={projects}
              contained={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
