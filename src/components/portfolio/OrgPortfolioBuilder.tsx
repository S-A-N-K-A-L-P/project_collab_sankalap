"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Palette,
  Layers,
  Image as ImageIcon,
  Rocket,
  Save,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import type { IOrgPublic, IOrgMemberPopulated } from "@/types/org";
import SectionsEditor from "./SectionsEditor";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES } from "./themes/registry";
import {
  SECTION_ANIM_KINDS,
  SECTION_ANIMS,
  CARD_STYLES,
  CARD_ANIMS,
  CARD_ANIM_KINDS,
} from "./animations";
import {
  defaultTitleFor,
  defaultContentFor,
  newSection,
  type SectionType,
  type PortfolioSection,
} from "./sections";
import OrgPortfolioRenderer from "./OrgPortfolioRenderer";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

type Tab = "theme" | "background" | "sections" | "publish";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "theme", label: "Theme", icon: Palette },
  { id: "background", label: "Background", icon: ImageIcon },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "publish", label: "Publish", icon: Rocket },
];

interface OrgPortfolioBuilderProps {
  slug: string;
}

export default function OrgPortfolioBuilder({
  slug,
}: OrgPortfolioBuilderProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [org, setOrg] = useState<IOrgPublic | null>(null);
  const [members, setMembers] = useState<IOrgMemberPopulated[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [cfg, setCfg] = useState<any>({
    mode: "immersive",
    enterpriseTemplate: "corporate",
    navigationStyle: "horizontal",
    enterprisePageMode: "single_page",
    enterprisePages: [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "work", label: "Work" },
      { id: "contact", label: "Contact" },
    ],
    enterpriseBrand: { surface: "#f8f7f3", text: "#172033", accent: "#244a73" },
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
    seo: { title: "", description: "" },
  });

  const [tab, setTab] = useState<Tab>("theme");
  const [previewSize, setPreviewSize] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

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
          const defaultSecs = [
            "hero",
            "mission",
            "team",
            "org_stats",
            "join_cta",
            "contact",
          ].map((t, idx) => ({
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

  useEffect(() => {
    loadData();
  }, [slug]);

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
      const {
        _id,
        orgId,
        createdAt,
        updatedAt,
        views,
        __v,
        published,
        lastPublishedAt,
        ...payload
      } = next;
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
    <AppLayoutClient wide hideRightPanel>
      <div className="flex min-h-[720px] flex-col overflow-hidden rounded-xl border border-white/8 bg-[#0a0a0f] text-white h-[calc(100vh-88px)]">
        {/* Top Navbar */}
        <div className="h-14 border-b border-white/8 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <a
              href={`/orgs/${slug}/admin`}
              className="text-white/40 hover:text-white/80 transition-colors text-sm font-semibold"
            >
              ← Console
            </a>
            <span className="text-white/20">|</span>
            <span className="text-sm font-semibold text-white/80">
              Page Designer: {org?.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {saving ? (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : savedAt ? (
              <span className="text-xs text-white/40">
                Saved at {savedAt.toLocaleTimeString()}
              </span>
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
              {publishing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Rocket size={12} />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Main Panel splitting Editor and Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side Controls (400px width) */}
          <div
            className={`${cfg.mode === "enterprise" ? "w-[430px]" : "w-[380px]"} shrink-0 border-r border-white/8 bg-black/20 flex flex-col overflow-hidden transition-[width]`}
          >
            {/* Tab bar */}
            <div className="flex p-1 bg-white/5 border-b border-white/5 gap-0.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex ${cfg.mode === "enterprise" ? "flex-row justify-center" : "flex-col"} items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-semibold transition-all ${
                      tab === t.id
                        ? "bg-white/10 text-indigo-400"
                        : "text-white/40 hover:text-white/70 hover:bg-white/4"
                    }`}
                  >
                    <Icon size={14} />
                    {cfg.mode === "enterprise"
                      ? (
                          {
                            theme: "Website",
                            background: "Brand",
                            sections: "Pages",
                            publish: "Publish",
                          } as Record<Tab, string>
                        )[t.id]
                      : t.label}
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
                  <ModeControls cfg={cfg} set={set} />
                  {cfg.mode !== "enterprise" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                          Preset Themes
                        </label>
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
                              <span className="text-xs font-bold block">
                                {theme.name}
                              </span>
                              <div className="flex gap-1.5 mt-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: theme.palette.accent,
                                  }}
                                />
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: theme.palette.accent2,
                                  }}
                                />
                                <span
                                  className="w-3 h-3 rounded-full bg-slate-800"
                                  style={{ backgroundColor: theme.palette.bg }}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                          Accent Overrides
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={
                              cfg.accent ||
                              THEMES.find((t) => t.id === cfg.themeId)?.palette
                                .accent ||
                              "#6366f1"
                            }
                            onChange={(e) => set({ accent: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                          />
                          <input
                            type="color"
                            value={
                              cfg.accent2 ||
                              THEMES.find((t) => t.id === cfg.themeId)?.palette
                                .accent2 ||
                              "#a855f7"
                            }
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
                    </>
                  )}
                </div>
              )}

              {/* TAB: Background Design */}
              {tab === "background" && cfg.mode !== "enterprise" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      2D Art Style
                    </label>
                    <select
                      value={cfg.bgOverride || ""}
                      onChange={(e) =>
                        set({ bgOverride: e.target.value || "" })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                    >
                      <option value="" className="bg-gray-900">
                        Default Theme Background
                      </option>
                      {ALL_BACKGROUNDS.map((bg) => (
                        <option key={bg} value={bg} className="bg-gray-900">
                          {bg.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      3D Scene (Three.js)
                    </label>
                    <select
                      value={cfg.threeOverride || ""}
                      onChange={(e) =>
                        set({ threeOverride: e.target.value || "" })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                    >
                      <option value="" className="bg-gray-900">
                        Default Theme 3D Scene
                      </option>
                      <option value="none" className="bg-gray-900">
                        Disable 3D (Faster Rendering)
                      </option>
                      {ALL_THREE_SCENES.map((scene) => (
                        <option
                          key={scene}
                          value={scene}
                          className="bg-gray-900"
                        >
                          {scene.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      Card Style
                    </label>
                    <select
                      value={cfg.card || ""}
                      onChange={(e) => set({ card: e.target.value || "" })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                    >
                      <option value="" className="bg-gray-900">
                        Theme Card Style
                      </option>
                      <option value="glass" className="bg-gray-900">
                        GLASS
                      </option>
                      <option value="solid" className="bg-gray-900">
                        SOLID
                      </option>
                      <option value="outline" className="bg-gray-900">
                        OUTLINE
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      Section Anim
                    </label>
                    <select
                      value={cfg.sectionAnim || "rise"}
                      onChange={(e) => set({ sectionAnim: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                    >
                      {SECTION_ANIM_KINDS.map((anim) => (
                        <option key={anim} value={anim} className="bg-gray-900">
                          {anim.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {tab === "background" && cfg.mode === "enterprise" && (
                <EnterpriseBrandControls cfg={cfg} set={set} />
              )}

              {/* TAB: Ordered Layout Sections */}
              {tab === "sections" && (
                <>
                  <EnterprisePagesControls cfg={cfg} set={set} />
                  <SectionsEditor
                    sections={cfg.sections || []}
                    available={projects}
                    orgMode
                    enterpriseMode={cfg.mode === "enterprise"}
                    onChange={(next) => set({ sections: next })}
                  />
                </>
              )}

              {/* TAB: SEO & Publishing Metadata */}
              {tab === "publish" && (
                <div className="space-y-4">
                  {cfg.mode === "enterprise" && (
                    <EnterpriseFooterControls cfg={cfg} set={set} />
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={cfg.seo?.title || ""}
                      onChange={(e) =>
                        set({ seo: { ...cfg.seo, title: e.target.value } })
                      }
                      placeholder={org?.name}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      SEO Meta Description
                    </label>
                    <textarea
                      value={cfg.seo?.description || ""}
                      onChange={(e) =>
                        set({
                          seo: { ...cfg.seo, description: e.target.value },
                        })
                      }
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
            <div className="absolute right-4 top-4 z-20 flex rounded-lg border border-white/10 bg-black/70 p-1">
              {[
                ["desktop", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ].map(([size, Icon]: any) => (
                <button
                  key={size}
                  onClick={() => setPreviewSize(size)}
                  title={`${size} preview`}
                  className={`rounded-md p-1.5 ${previewSize === size ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pt-14">
              <div
                className="mx-auto min-h-full overflow-hidden bg-white shadow-2xl transition-[max-width] duration-300"
                style={{
                  maxWidth:
                    previewSize === "mobile"
                      ? 390
                      : previewSize === "tablet"
                        ? 820
                        : "100%",
                }}
              >
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
      </div>
    </AppLayoutClient>
  );
}

function ModeControls({ cfg, set }: any) {
  const enableEnterprise = () => set({
    mode: "enterprise",
    enterpriseTemplate: cfg.enterpriseTemplate || "corporate",
    navigationStyle: cfg.navigationStyle || "horizontal",
    enterprisePageMode: cfg.enterprisePageMode || "single_page",
    enterprisePages: cfg.enterprisePages?.length ? cfg.enterprisePages : [
      { id: "home", label: "Home" }, { id: "about", label: "About" },
      { id: "work", label: "Work" }, { id: "contact", label: "Contact" },
    ],
  });
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
          Website mode
        </label>
        <div className="grid gap-2">
          <button
            onClick={enableEnterprise}
            className={`rounded-xl border p-4 text-left ${cfg.mode === "enterprise" ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-white/4"}`}
          >
            <div className="text-sm font-semibold">Enterprise website</div>
            <div className="mt-1 text-xs leading-5 text-white/45">
              Traditional company layout, restrained branding and clear
              navigation.
            </div>
          </button>
          <button
            onClick={() => set({ mode: "immersive" })}
            className={`rounded-xl border p-4 text-left ${cfg.mode !== "enterprise" ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-white/4"}`}
          >
            <div className="text-sm font-semibold">Immersive portfolio</div>
            <div className="mt-1 text-xs leading-5 text-white/45">
              Expressive themes, motion and visual backgrounds.
            </div>
          </button>
        </div>
      </div>
      {cfg.mode === "enterprise" && (
        <>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
              Enterprise template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["corporate", "Corporate Classic", "Clean sans-serif"],
                ["editorial", "Editorial Studio", "Cream and image-led"],
              ].map(([id, title, desc]) => (
                <button
                  key={id}
                  onClick={() => set({ enterpriseTemplate: id })}
                  className={`rounded-xl border p-3 text-left ${cfg.enterpriseTemplate === id ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-white/4"}`}
                >
                  <div className="text-xs font-semibold">{title}</div>
                  <div className="mt-1 text-[10px] text-white/40">{desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
              Navigation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["horizontal", "Top navigation"],
                ["vertical", "Side navigation"],
              ].map(([id, title]) => (
                <button
                  key={id}
                  onClick={() => set({ navigationStyle: id })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${cfg.navigationStyle === id ? "border-indigo-400 bg-indigo-500/10" : "border-white/10"}`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EnterpriseBrandControls({ cfg, set }: any) {
  const brand = cfg.enterpriseBrand || {
    surface: "#f8f7f3",
    text: "#172033",
    accent: "#244a73",
  };
  const update = (key: string, value: string) =>
    set({ enterpriseBrand: { ...brand, [key]: value } });
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Enterprise brand
        </div>
        <p className="mt-2 text-xs leading-5 text-white/45">
          Use restrained colours with strong contrast. Enterprise mode
          intentionally disables particles and 3D scenes.
        </p>
      </div>
      {[
        ["surface", "Page surface"],
        ["text", "Text colour"],
        ["accent", "Brand accent"],
      ].map(([key, label]) => (
        <label
          key={key}
          className="flex items-center justify-between rounded-lg border border-white/10 p-3 text-xs"
        >
          <span>{label}</span>
          <input
            type="color"
            value={brand[key]}
            onChange={(event) => update(key, event.target.value)}
            className="h-9 w-12 rounded border border-white/10 bg-transparent"
          />
        </label>
      ))}
    </div>
  );
}

function EnterpriseFooterControls({ cfg, set }: any) {
  const footer = cfg.enterpriseFooter || {
    summary: "",
    copyright: "",
    showSocialLinks: true,
  };
  const update = (key: string, value: any) =>
    set({ enterpriseFooter: { ...footer, [key]: value } });
  return (
    <div className="space-y-3 rounded-xl border border-white/10 p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
        Website footer
      </div>
      <label className="block text-xs text-white/55">
        Short company summary
        <textarea
          value={footer.summary}
          onChange={(event) => update("summary", event.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block text-xs text-white/55">
        Copyright text
        <input
          value={footer.copyright}
          onChange={(event) => update("copyright", event.target.value)}
          placeholder="Company name. All rights reserved."
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="flex items-center justify-between text-xs text-white/60">
        <span>Show social links</span>
        <input
          type="checkbox"
          checked={footer.showSocialLinks !== false}
          onChange={(event) => update("showSocialLinks", event.target.checked)}
        />
      </label>
    </div>
  );
}

function EnterprisePagesControls({ cfg, set }: any) {
  if (cfg.mode !== "enterprise") return null;
  const pages = cfg.enterprisePages || [];
  const sections = cfg.sections || [];
  const updatePage = (index: number, label: string) =>
    set({
      enterprisePages: pages.map((page: any, current: number) =>
        current === index ? { ...page, label } : page,
      ),
    });
  const addPage = () => {
    if (pages.length >= 4) return;
    const id = `page-${Date.now().toString(36)}`;
    set({ enterprisePages: [...pages, { id, label: "New page" }] });
  };
  const removePage = (id: string) => {
    if (pages.length <= 1) return;
    const fallback = pages.find((page: any) => page.id !== id)?.id;
    set({
      enterprisePages: pages.filter((page: any) => page.id !== id),
      sections: sections.map((section: any) =>
        section.pageId === id ? { ...section, pageId: fallback } : section,
      ),
    });
  };
  const assign = (sectionId: string, pageId: string) =>
    set({
      sections: sections.map((section: any) =>
        section.id === sectionId ? { ...section, pageId } : section,
      ),
    });
  return (
    <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-white/4 p-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Page structure
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            ["single_page", "Scrolling page"],
            ["multi_page", "Separate pages"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => set({ enterprisePageMode: id })}
              className={`rounded-lg border px-3 py-2 text-xs ${cfg.enterprisePageMode === id ? "border-indigo-400 bg-indigo-500/10" : "border-white/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {cfg.enterprisePageMode === "multi_page" && (
        <>
          <div className="space-y-2">
            {pages.map((page: any, index: number) => (
              <div key={page.id} className="flex gap-2">
                <input
                  value={page.label}
                  onChange={(event) => updatePage(index, event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                />
                <button
                  onClick={() => removePage(page.id)}
                  disabled={pages.length <= 1}
                  className="px-2 text-xs text-white/35 disabled:opacity-20"
                >
                  Remove
                </button>
              </div>
            ))}
            {pages.length < 4 && (
              <button
                onClick={addPage}
                className="text-xs font-semibold text-indigo-300"
              >
                + Add page
              </button>
            )}
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-white/35">
              Place sections
            </div>
            <div className="space-y-2">
              {sections
                .filter((section: any) => section.type !== "hero")
                .map((section: any) => (
                  <label
                    key={section.id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="truncate text-white/60">
                      {section.title}
                    </span>
                    <select
                      value={section.pageId || pages[0]?.id || ""}
                      onChange={(event) =>
                        assign(section.id, event.target.value)
                      }
                      className="rounded border border-white/10 bg-[#111116] px-2 py-1.5 text-xs"
                    >
                      {pages.map((page: any) => (
                        <option key={page.id} value={page.id}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
