"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import {
  Loader2, Check, Monitor, Smartphone, ExternalLink, Eye, EyeOff,
  UserCircle, Trophy, LayoutTemplate, ShoppingBag, Settings2,
  Palette, Image as ImageIcon, Layers, Database, Send,
  Wand2, Download, Upload, Copy, Crown, BookOpen,
  ChevronLeft, ChevronRight, RotateCcw, Sparkles, X,
} from "lucide-react";
import PortfolioRenderer, { type PortfolioData } from "./PortfolioRenderer";
import SectionsEditor from "./SectionsEditor";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES, THEME_CATEGORIES } from "./themes/registry";
import {
  SECTION_ANIM_KINDS, SECTION_ANIMS, CARD_STYLES, CARD_ANIMS,
  CARD_ANIM_KINDS, AVAILABLE_TOKENS,
} from "./animations";
import {
  defaultTitleFor, defaultContentFor, sanitizeImportedSections, uid, type SectionType,
} from "./sections";

/* ── Types ───────────────────────────────────────────── */
type Tab    = "theme" | "background" | "sections" | "data" | "publish";
type Device = "mobile" | "desktop";

const TABS: { id: Tab; label: string; desc: string; Icon: any }[] = [
  { id: "theme",      label: "Theme",      desc: "Customize colors & style",    Icon: Palette },
  { id: "background", label: "Background", desc: "Manage background settings",  Icon: ImageIcon },
  { id: "sections",   label: "Sections",   desc: "Organize portfolio sections", Icon: Layers },
  { id: "data",       label: "Data",       desc: "Manage your information",     Icon: Database },
  { id: "publish",    label: "Publish",    desc: "Publish & share portfolio",   Icon: Send },
];

const CARD_STYLE_OPTS = [
  { id: "solid",   label: "Solid"         },
  { id: "glass",   label: "Glassmorphism" },
  { id: "outline", label: "Outline"       },
  { id: "soft",    label: "Soft"          },
];

const RADIUS_OPTS = [
  { id: "none",   label: "None"   },
  { id: "small",  label: "Small"  },
  { id: "medium", label: "Medium" },
  { id: "large",  label: "Large"  },
];

/* ── Root ────────────────────────────────────────────── */
export default function PortfolioBuilderPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [savedAt, setSavedAt]       = useState<Date | null>(null);
  const [cfg, setCfg]               = useState<any>(null);
  const [user, setUser]             = useState<any>(null);
  const [available, setAvailable]   = useState<any[]>([]);
  const [tab, setTab]               = useState<Tab>("theme");
  const [device, setDevice]         = useState<Device>("mobile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [handle, setHandle]         = useState("");
  const [handleState, setHandleState] = useState<{ checking: boolean; ok?: boolean; msg?: string }>({ checking: false });
  const [jsonText, setJsonText]     = useState("");
  const [dataMsg, setDataMsg]       = useState<string | null>(null);
  const [radius, setRadius]         = useState("medium");

  useEffect(() => {
    fetch("/api/portfolio/me")
      .then(r => r.json())
      .then(d => {
        setCfg(d.portfolio);
        setUser(d.user);
        setAvailable(d.availableProjects || []);
        setHandle(d.user?.handle || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveTimer = useRef<any>(null);
  const queueSave = (next: any) => {
    setCfg(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(next), 800);
  };
  async function doSave(next: any) {
    setSaving(true);
    try {
      const { _id, userId, createdAt, updatedAt, views, __v, ...payload } = next;
      const res = await fetch("/api/portfolio/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSavedAt(new Date());
    } finally { setSaving(false); }
  }
  const set = (patch: any) => queueSave({ ...cfg, ...patch });

  const handleTimer = useRef<any>(null);
  const onHandleChange = (val: string) => {
    setHandle(val); setHandleState({ checking: true });
    clearTimeout(handleTimer.current);
    handleTimer.current = setTimeout(async () => {
      const r = await fetch(`/api/portfolio/handle-available?handle=${encodeURIComponent(val)}`);
      const d = await r.json();
      setHandleState({ checking: false, ok: d.available, msg: d.reason });
    }, 500);
  };
  async function claimHandle() {
    const r = await fetch("/api/user/handle", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handle }) });
    const d = await r.json();
    if (r.ok) { setUser({ ...user, handle: d.handle }); setHandleState({ checking: false, ok: true, msg: "Saved!" }); }
    else setHandleState({ checking: false, ok: false, msg: d.error });
  }

  const previewProjects = useMemo(() => {
    if (!cfg) return [];
    const sec = (cfg.sections || []).find((s: any) => s.type === "projects");
    const ids: string[] = sec?.content?.ids || [];
    if (ids.length) { const m = new Map(available.map((p: any) => [p._id, p])); return ids.map(id => m.get(id)).filter(Boolean); }
    return available.filter((p: any) => p.status === "completed").slice(0, 6);
  }, [cfg, available]);

  const previewData: PortfolioData | null = cfg ? { ...cfg, user, projects: previewProjects } : null;
  const activeTheme = cfg ? (THEMES.find((t: any) => t.id === cfg.themeId) || THEMES[0]) : THEMES[0];
  const publicUrl = user?.handle ? `/portfolio/${user.handle}` : null;
  const can3d = activeTheme.supports3d || (!!cfg?.threeOverride && cfg?.threeOverride !== "none");

  const initials = (sessionUser?.name || user?.name || "?")
    .split(" ").map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const profileHref = sessionUser?.id ? `/profile/${sessionUser.id}` : "/profile";

  /* data tab helpers */
  const buildExport = () => ({
    version: 1,
    theme: { id: cfg.themeId, accent: cfg.accent, accent2: cfg.accent2, card: cfg.card, sectionAnim: cfg.sectionAnim, projectCardStyle: cfg.projectCardStyle, projectCardAnim: cfg.projectCardAnim },
    background: { effect: cfg.bgOverride, scene: cfg.threeOverride, heavy3d: cfg.heavy3d },
    meta: { handle: user?.handle, isPublished: cfg.isPublished, seo: cfg.seo },
    sections: (cfg.sections || []).map((s: any) => ({ type: s.type, title: s.title, enabled: s.enabled, content: s.content })),
  });
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(buildExport(), null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `portfolio-${user?.handle || "me"}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const applyImport = (raw: string) => {
    setDataMsg(null);
    try {
      const j = JSON.parse(raw);
      const sections = sanitizeImportedSections(j.sections);
      if (!sections) { setDataMsg("No valid 'sections' array found."); return; }
      const t = j.theme || {}, b = j.background || {}, m = j.meta || {};
      set({ sections, themeId: t.id || cfg.themeId, accent: t.accent || "", accent2: t.accent2 || "", card: t.card || "", sectionAnim: t.sectionAnim || "rise", projectCardStyle: t.projectCardStyle || "glass", projectCardAnim: t.projectCardAnim || "rise", bgOverride: b.effect || "", threeOverride: b.scene || "", heavy3d: !!b.heavy3d, seo: m.seo || cfg.seo });
      setDataMsg("Imported ✓");
    } catch { setDataMsg("Invalid JSON."); }
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => applyImport(String(r.result)); r.readAsText(f);
  };
  const autofill = () => {
    const completed = available.filter((p: any) => p.status === "completed");
    const sec = (type: SectionType, content: any) => ({ id: uid(), type, title: defaultTitleFor(type), enabled: true, order: 0, content: { ...defaultContentFor(type), ...content } });
    const sections = [
      sec("hero", { headline: user?.bio || "", tagline: user?.techStackPreference || "" }),
      sec("about", { body: user?.bio || "" }),
      sec("skills", { items: (user?.skills || []).map((s: string) => ({ name: s })) }),
      sec("projects", { ids: completed.map((p: any) => p._id) }),
      sec("contact", { links: user?.github ? [{ icon: "github", label: "GitHub", url: `https://github.com/${user.github}` }] : [] }),
    ].map((s, i) => ({ ...s, order: i }));
    set({ sections });
    setDataMsg("Auto-filled from your profile ✓");
  };

  if (loading || !cfg) return (
    <div style={{ position: "fixed", top: 56, left: 64, right: 0, bottom: 0, zIndex: 20 }}
      className="flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  /* ── display accent hex ── */
  const accent  = cfg.accent  || activeTheme.palette.accent;
  const accent2 = cfg.accent2 || activeTheme.palette.accent2;
  const cardStyle = cfg.card  || activeTheme.card || "glass";
  const previewThemes = showAllThemes ? THEMES : THEMES.slice(0, 6);

  return (
    <div style={{ position: "fixed", top: 56, left: 64, right: 0, bottom: 0, zIndex: 20 }}
      className="flex flex-col bg-background overflow-hidden">

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 h-[52px] border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-foreground tracking-tight">Portfolio</h1>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted flex items-center gap-1.5">
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Saving…</>
              : savedAt
              ? <><div className="w-2 h-2 rounded-full bg-emerald-500" /> Auto-saved {formatAgo(savedAt)}</>
              : null}
          </span>
          {/* Mobile preview toggle */}
          <button onClick={() => setShowMobilePreview(true)}
            className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-card transition-colors">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-card transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Preview in new tab
            </a>
          )}
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── INNER SIDEBAR ────────────────────────────────── */}
        <div className={`${sidebarOpen ? "w-[220px]" : "w-[60px]"} shrink-0 border-r border-border bg-card flex flex-col transition-all duration-200 overflow-hidden`}>

          {/* User info */}
          {sidebarOpen ? (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user?.name || sessionUser?.name || "Builder"}</p>
                  <p className="text-[11px] text-muted truncate">Builder on S.A.N.K.A.L.P.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 border-b border-border flex justify-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {[
              { label: "Profile",      Icon: UserCircle,     href: profileHref,     active: false },
              { label: "Achievements", Icon: Trophy,         href: "/my-completed", active: false },
              { label: "Portfolio",    Icon: LayoutTemplate, href: "/my-portfolio", active: true  },
              { label: "Store",        Icon: ShoppingBag,    href: "/marketplace",  active: false },
              { label: "Settings",     Icon: Settings2,      href: "/settings",     active: false },
            ].map(({ label, Icon, href, active }) => (
              <NextLink key={label} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-foreground hover:bg-background"
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </NextLink>
            ))}
          </nav>

          {/* Upgrade card */}
          {sidebarOpen && (
            <div className="p-3 space-y-3 border-t border-border">
              <div className="bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-[11px] font-bold text-foreground">Upgrade to Pro</span>
                </div>
                <p className="text-[10px] text-muted leading-relaxed mb-2">Unlock premium themes, custom domain and more.</p>
                <button className="w-full py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-colors">
                  Upgrade Now →
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" /> Need Help?
                </p>
                <p className="text-[10px] text-muted">Check our docs to learn more.</p>
                <button className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
                  <ExternalLink className="w-3 h-3" /> View Docs
                </button>
              </div>
            </div>
          )}

          {/* Collapse button */}
          <button onClick={() => setSidebarOpen(o => !o)}
            className="flex items-center justify-center gap-2 px-3 py-3 border-t border-border text-xs text-muted hover:text-foreground hover:bg-background transition-colors">
            {sidebarOpen
              ? <><ChevronLeft className="w-4 h-4" /> <span>Collapse</span></>
              : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* ── TAB LIST ─────────────────────────────────────── */}
        <div className="w-[210px] shrink-0 border-r border-border bg-background flex flex-col overflow-y-auto">
          <div className="p-2 space-y-0.5 flex-1">
            {TABS.map(({ id, label, desc, Icon }) => {
              const on = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    on ? "bg-primary/10 text-primary" : "text-foreground hover:bg-card"
                  }`}>
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${on ? "text-primary" : "text-muted"}`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${on ? "text-primary" : "text-foreground"}`}>{label}</p>
                    <p className="text-[10px] text-muted leading-snug mt-0.5">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 max-w-2xl">

            {/* THEME TAB */}
            {tab === "theme" && (
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Theme</h2>
                  <p className="text-sm text-muted">Choose a theme and customize it to match your style.</p>
                </div>

                {/* Theme presets */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Theme Presets</h3>
                    <button onClick={() => setShowAllThemes(v => !v)}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                      {showAllThemes ? "Show less" : "View all themes"} →
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {previewThemes.map((t: any) => (
                      <button key={t.id} onClick={() => set({ themeId: t.id })}
                        className={`text-left rounded-2xl overflow-hidden border-2 transition-all ${
                          cfg.themeId === t.id ? "border-primary ring-2 ring-primary/25" : "border-transparent hover:border-border"
                        }`}>
                        {/* Gradient preview */}
                        <div className="h-[80px] relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${t.palette.bg} 0%, ${t.palette.accent} 50%, ${t.palette.accent2} 100%)` }}>
                          {cfg.themeId === t.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="bg-card px-3 py-2 border-t border-border">
                          <p className="text-xs font-semibold text-foreground">{t.name}</p>
                          <p className="text-[10px] text-muted mt-0.5 capitalize">{t.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customize Theme */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Customize Theme</h3>
                  <div className="space-y-5">

                    {/* Color pickers */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-0.5">Primary Color</p>
                        <p className="text-[10px] text-muted mb-2">Main brand color of your portfolio</p>
                        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl bg-card">
                          <span className="text-sm text-foreground font-mono flex-1">{accent}</span>
                          <label className="cursor-pointer">
                            <div className="w-7 h-7 rounded-lg border border-border/50 overflow-hidden">
                              <input type="color" value={accent} onChange={(e: any) => set({ accent: e.target.value })}
                                className="w-10 h-10 -translate-x-0.5 -translate-y-0.5 cursor-pointer border-none bg-transparent" />
                            </div>
                          </label>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-0.5">Secondary Color</p>
                        <p className="text-[10px] text-muted mb-2">Accent color for highlights</p>
                        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl bg-card">
                          <span className="text-sm text-foreground font-mono flex-1">{accent2}</span>
                          <label className="cursor-pointer">
                            <div className="w-7 h-7 rounded-lg border border-border/50 overflow-hidden">
                              <input type="color" value={accent2} onChange={(e: any) => set({ accent2: e.target.value })}
                                className="w-10 h-10 -translate-x-0.5 -translate-y-0.5 cursor-pointer border-none bg-transparent" />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Card Style */}
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-0.5">Card Style</p>
                      <p className="text-[10px] text-muted mb-2">Choose how cards and sections look</p>
                      <div className="flex items-center gap-2">
                        {CARD_STYLE_OPTS.map(({ id, label }) => {
                          const on = cardStyle === id || (id === "soft" && cardStyle === "glass" && false);
                          const active = cardStyle === id;
                          return (
                            <button key={id} onClick={() => set({ card: id === "soft" ? "glass" : id })}
                              title={label}
                              className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs transition-all ${
                                active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted hover:border-foreground hover:text-foreground"
                              }`}>
                              <CardStyleIcon id={id} />
                              <span className="text-[10px]">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-0.5">Border Radius</p>
                      <p className="text-[10px] text-muted mb-2">Adjust the roundness of corners</p>
                      <div className="flex items-center gap-2">
                        {RADIUS_OPTS.map(({ id, label }) => (
                          <button key={id} onClick={() => setRadius(id)}
                            className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs transition-all ${
                              radius === id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted hover:border-foreground hover:text-foreground"
                            }`}>
                            <RadiusIcon id={id} />
                            <span className="text-[10px]">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    <button onClick={() => { set({ accent: "", accent2: "", card: "" }); setRadius("medium"); }}
                      className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
                      <RotateCcw className="w-4 h-4" /> Reset to Default
                      <span className="text-[10px] text-muted">Reset all theme settings</span>
                    </button>
                  </div>
                </div>

                {/* Animation */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Animation</h3>
                  <div className="space-y-3">
                    <Row label="Section entrance">
                      <select value={cfg.sectionAnim || "rise"} onChange={(e: any) => set({ sectionAnim: e.target.value })} className={sel}>
                        {SECTION_ANIM_KINDS.map((k: string) => <option key={k} value={k}>{(SECTION_ANIMS as any)[k].label}</option>)}
                      </select>
                    </Row>
                    <Row label="Project card entrance">
                      <select value={cfg.projectCardAnim || "rise"} onChange={(e: any) => set({ projectCardAnim: e.target.value })} className={sel}>
                        {CARD_ANIM_KINDS.map((k: string) => <option key={k} value={k}>{(CARD_ANIMS as any)[k].label}</option>)}
                      </select>
                    </Row>
                  </div>
                </div>
              </div>
            )}

            {/* BACKGROUND TAB */}
            {tab === "background" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Background</h2>
                  <p className="text-sm text-muted">Manage background settings for your portfolio.</p>
                </div>
                <Section title="2D Effect" desc="Lightweight CSS/canvas — loads instantly on every device.">
                  <select value={cfg.bgOverride || activeTheme.background} onChange={(e: any) => set({ bgOverride: e.target.value })} className={sel}>
                    {ALL_BACKGROUNDS.map((b: string) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Section>
                <Section title="3D Scene" desc="Three.js scene loaded only when enabled.">
                  <select value={cfg.threeOverride || activeTheme.three} onChange={(e: any) => set({ threeOverride: e.target.value })} className={sel}>
                    <option value="none">none</option>
                    {ALL_THREE_SCENES.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label className={`flex items-start gap-3 mt-3 ${can3d ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                    <input type="checkbox" disabled={!can3d} checked={!!cfg.heavy3d && can3d}
                      onChange={(e: any) => set({ heavy3d: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-border text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Heavy 3D render (three.js)</p>
                      <p className="text-xs text-muted mt-0.5">{can3d ? "Loads real-time three.js background." : "Choose a 3D theme or scene to unlock."}</p>
                    </div>
                  </label>
                </Section>
                <button onClick={() => set({ bgOverride: "", threeOverride: "", heavy3d: false })}
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
                  <RotateCcw className="w-4 h-4" /> Reset to theme default
                </button>
              </div>
            )}

            {/* SECTIONS TAB */}
            {tab === "sections" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Sections</h2>
                  <p className="text-sm text-muted">Organize and customize the content sections of your portfolio.</p>
                </div>
                <SectionsEditor sections={cfg.sections || []} available={available} onChange={(next: any) => set({ sections: next })} />
                <Section title="Profile tokens" desc="Click any token to copy — paste into text fields to pull live data.">
                  <div className="grid grid-cols-2 gap-1">
                    {AVAILABLE_TOKENS.map((t: any) => (
                      <button key={t.token} onClick={() => navigator.clipboard.writeText(t.token)} title={t.desc}
                        className="text-left px-2.5 py-2 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors">
                        <code className="text-[10px] text-primary">{t.token}</code>
                      </button>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* DATA TAB */}
            {tab === "data" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Data</h2>
                  <p className="text-sm text-muted">Manage portfolio data — auto-fill, import, or export.</p>
                </div>
                <Section title="Auto-fill" desc="Generate a complete portfolio from your profile in one click.">
                  <button onClick={autofill}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold">
                    <Wand2 className="w-4 h-4" /> Auto-fill from profile
                  </button>
                  {dataMsg && <p className="text-xs text-emerald-600 mt-2">{dataMsg}</p>}
                </Section>
                <Section title="Import JSON" desc="Paste or upload a portfolio JSON file.">
                  <textarea value={jsonText} onChange={(e: any) => setJsonText(e.target.value)} rows={4}
                    placeholder={'{ "version": 1, "sections": [...] }'}
                    className={`${inp} resize-none font-mono text-[11px]`} />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => applyImport(jsonText)} disabled={!jsonText.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary disabled:opacity-40 text-white rounded-lg text-xs font-semibold">
                      <Upload className="w-3.5 h-3.5" /> Apply
                    </button>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium cursor-pointer hover:bg-card">
                      <Upload className="w-3.5 h-3.5" /> Upload .json
                      <input type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
                    </label>
                  </div>
                </Section>
                <Section title="Export JSON" desc="Download your portfolio config to back up or share.">
                  <button onClick={exportJson}
                    className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-card">
                    <Download className="w-4 h-4" /> Export portfolio.json
                  </button>
                </Section>
              </div>
            )}

            {/* PUBLISH TAB */}
            {tab === "publish" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Publish</h2>
                  <p className="text-sm text-muted">Publish your portfolio and share it with the world.</p>
                </div>
                <Section title="Public URL" desc={`Your portfolio lives at /portfolio/[handle]`}>
                  <div className="flex items-center gap-1 rounded-xl border border-border overflow-hidden bg-card px-3 py-2">
                    <span className="text-sm text-muted shrink-0">/portfolio/</span>
                    <input value={handle} onChange={(e: any) => onHandleChange(e.target.value)}
                      placeholder="your-handle"
                      className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-0" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${handleState.ok === false ? "text-red-500" : handleState.ok ? "text-emerald-600" : "text-muted"}`}>
                      {handleState.checking ? "Checking…" : handleState.msg || (user?.handle ? `Current: ${user.handle}` : "Choose a handle")}
                    </span>
                    <button onClick={claimHandle} disabled={handleState.checking || handleState.ok === false || !handle}
                      className="text-xs font-semibold text-primary disabled:opacity-40 hover:underline">Save</button>
                  </div>
                </Section>
                <Section title="Visibility" desc="">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-card transition-colors">
                    <input type="checkbox" checked={cfg.isPublished !== false} onChange={(e: any) => set({ isPublished: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {cfg.isPublished !== false
                          ? <><Eye className="w-4 h-4 text-emerald-500" /> Live &amp; public</>
                          : <><EyeOff className="w-4 h-4 text-muted" /> Private</>}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{cfg.isPublished !== false ? "Anyone with the link can view it." : "Only you can see it."}</p>
                    </div>
                  </label>
                </Section>
                {publicUrl && (
                  <Section title="Share" desc="">
                    <p className="text-sm text-muted break-all px-3 py-2.5 bg-card border border-border rounded-xl mb-3">
                      {typeof window !== "undefined" ? window.location.origin : ""}{publicUrl}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => navigator.clipboard.writeText((typeof window !== "undefined" ? window.location.origin : "") + publicUrl)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-card">
                        <Copy className="w-3.5 h-3.5" /> Copy link
                      </button>
                      <a href={publicUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
                        <ExternalLink className="w-3.5 h-3.5" /> Open live
                      </a>
                    </div>
                  </Section>
                )}
                <Section title="Stats" desc="">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Theme",    value: activeTheme.name },
                      { label: "Views",    value: String(cfg.views ?? 0) },
                      { label: "Sections", value: String((cfg.sections || []).filter((s: any) => s.enabled).length) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-foreground">{value}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>

        {/* ── PREVIEW PANEL ────────────────────────────────── */}
        <div className="hidden xl:flex w-[360px] shrink-0 border-l border-border flex-col bg-card">
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">Live Preview</span>
            <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-0.5">
              <button onClick={() => setDevice("mobile")}
                className={`p-1.5 rounded-lg transition-colors ${device === "mobile" ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                <Smartphone className="w-4 h-4" />
              </button>
              <button onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-lg transition-colors ${device === "desktop" ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-hidden flex items-start justify-center pt-4 pb-4 px-3">
            {device === "mobile" ? (
              /* Phone frame */
              <div className="relative shrink-0"
                style={{ width: 295, height: 620, borderRadius: "2.5rem", border: "6px solid #1a1a2e", background: "#0f0f1a", boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5)" }}>
                {/* Notch */}
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 24, background: "#1a1a2e", borderRadius: "0 0 16px 16px", zIndex: 10 }} />
                {/* Screen */}
                <div style={{ position: "absolute", inset: 2, borderRadius: "2.2rem", overflow: "hidden" }}>
                  {previewData && (
                    <div style={{ transform: "scale(0.62)", transformOrigin: "top left", width: "161%", height: "161%", overflowY: "auto" }}>
                      <PortfolioRenderer
                        key={`${cfg.themeId}|${cfg.bgOverride}|${cfg.threeOverride}|${cfg.heavy3d}|${(cfg.sections || []).length}`}
                        data={previewData} contained
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Desktop preview */
              <div className="w-full h-full overflow-y-auto rounded-xl border border-border overflow-hidden">
                {previewData && (
                  <PortfolioRenderer
                    key={`desktop|${cfg.themeId}|${cfg.bgOverride}|${(cfg.sections || []).length}`}
                    data={previewData} contained
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE PREVIEW OVERLAY ───────────────────────── */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background" style={{ top: 56 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">Preview</span>
            <button onClick={() => setShowMobilePreview(false)} className="p-2 rounded-lg hover:bg-card text-muted hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {previewData && <PortfolioRenderer data={previewData} contained />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */
function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>}
      {desc  && <p className="text-[11px] text-muted mb-3">{desc}</p>}
      {children}
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
function CardStyleIcon({ id }: { id: string }) {
  const s = "w-8 h-8 rounded-lg border-2";
  if (id === "solid")   return <div className={`${s} border-current bg-current opacity-80`} />;
  if (id === "glass")   return <div className={`${s} border-current bg-current/20 backdrop-blur-sm`} />;
  if (id === "outline") return <div className={`${s} border-current bg-transparent`} />;
  return <div className={`${s} border-current bg-current/10 rounded-xl`} />;
}
function RadiusIcon({ id }: { id: string }) {
  const r = id === "none" ? "0" : id === "small" ? "4px" : id === "medium" ? "10px" : "20px";
  return <div className="w-8 h-8 border-2 border-current" style={{ borderRadius: r }} />;
}
function formatAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const inp = "w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";
const sel = `${inp} cursor-pointer`;
