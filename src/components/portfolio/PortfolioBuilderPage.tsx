"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Check, Monitor, Smartphone, ExternalLink, Eye, EyeOff,
  Palette, Layers, Image as ImageIcon, FileJson, Rocket, Wand2,
  Download, Upload, X, Copy, Sparkles, Box,
} from "lucide-react";
import PortfolioRenderer, { type PortfolioData } from "./PortfolioRenderer";
import SectionsEditor from "./SectionsEditor";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES, THEME_CATEGORIES } from "./themes/registry";
import {
  SECTION_ANIM_KINDS, SECTION_ANIMS, CARD_STYLES, CARD_ANIMS, CARD_ANIM_KINDS, AVAILABLE_TOKENS,
} from "./animations";
import { defaultTitleFor, defaultContentFor, sanitizeImportedSections, uid, type SectionType } from "./sections";

type Tab = "sections" | "style" | "background" | "data" | "publish";
type Device = "desktop" | "mobile";

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: "sections",   label: "Sections",   Icon: Layers },
  { id: "style",      label: "Style",      Icon: Palette },
  { id: "background", label: "BG",         Icon: ImageIcon },
  { id: "data",       label: "Data",       Icon: FileJson },
  { id: "publish",    label: "Publish",    Icon: Rocket },
];

export default function PortfolioBuilderPage() {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [savedAt, setSavedAt]         = useState<Date | null>(null);
  const [cfg, setCfg]                 = useState<any>(null);
  const [user, setUser]               = useState<any>(null);
  const [available, setAvailable]     = useState<any[]>([]);
  const [device, setDevice]           = useState<Device>("desktop");
  const [tab, setTab]                 = useState<Tab>("sections");
  const [showPreview, setShowPreview] = useState(false);
  const [handle, setHandle]           = useState("");
  const [handleState, setHandleState] = useState<{ checking: boolean; ok?: boolean; msg?: string }>({ checking: false });
  const [jsonText, setJsonText]       = useState("");
  const [dataMsg, setDataMsg]         = useState<string | null>(null);

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
    saveTimer.current = setTimeout(() => doSave(next), 600);
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
    setHandle(val);
    setHandleState({ checking: true });
    clearTimeout(handleTimer.current);
    handleTimer.current = setTimeout(async () => {
      const r = await fetch(`/api/portfolio/handle-available?handle=${encodeURIComponent(val)}`);
      const d = await r.json();
      setHandleState({ checking: false, ok: d.available, msg: d.reason });
    }, 500);
  };
  async function claimHandle() {
    const r = await fetch("/api/user/handle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });
    const d = await r.json();
    if (r.ok) { setUser({ ...user, handle: d.handle }); setHandleState({ checking: false, ok: true, msg: "Saved!" }); }
    else setHandleState({ checking: false, ok: false, msg: d.error });
  }

  const previewProjects = useMemo(() => {
    if (!cfg) return [];
    const projSection = (cfg.sections || []).find((s: any) => s.type === "projects");
    const ids: string[] = projSection?.content?.ids || [];
    if (ids.length) {
      const byId = new Map(available.map((p: any) => [p._id, p]));
      return ids.map((id) => byId.get(id)).filter(Boolean);
    }
    return available.filter((p: any) => p.status === "completed").slice(0, 6);
  }, [cfg, available]);

  const previewData: PortfolioData | null = cfg ? { ...cfg, user, projects: previewProjects } : null;
  const activeTheme = cfg ? (THEMES.find((t: any) => t.id === cfg.themeId) || THEMES[0]) : THEMES[0];
  const publicUrl   = user?.handle ? `/portfolio/${user.handle}` : null;
  const can3d       = activeTheme.supports3d || (!!cfg?.threeOverride && cfg?.threeOverride !== "none");

  const buildExport = () => ({
    version: 1,
    theme:      { id: cfg.themeId, accent: cfg.accent, accent2: cfg.accent2, card: cfg.card, sectionAnim: cfg.sectionAnim, projectCardStyle: cfg.projectCardStyle, projectCardAnim: cfg.projectCardAnim },
    background: { effect: cfg.bgOverride, scene: cfg.threeOverride, heavy3d: cfg.heavy3d },
    meta:       { handle: user?.handle, isPublished: cfg.isPublished, seo: cfg.seo },
    sections:   (cfg.sections || []).map((s: any) => ({ type: s.type, title: s.title, enabled: s.enabled, content: s.content })),
  });
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(buildExport(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `portfolio-${user?.handle || "me"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const applyImport = (raw: string) => {
    setDataMsg(null);
    try {
      const j = JSON.parse(raw);
      const sections = sanitizeImportedSections(j.sections);
      if (!sections) { setDataMsg("No valid 'sections' array found."); return; }
      const t = j.theme || {}, b = j.background || {}, m = j.meta || {};
      set({
        sections, themeId: t.id || cfg.themeId, accent: t.accent || "", accent2: t.accent2 || "", card: t.card || "",
        sectionAnim: t.sectionAnim || "rise", projectCardStyle: t.projectCardStyle || "glass", projectCardAnim: t.projectCardAnim || "rise",
        bgOverride: b.effect || "", threeOverride: b.scene || "", heavy3d: !!b.heavy3d, seo: m.seo || cfg.seo,
      });
      setDataMsg("Imported ✓");
    } catch { setDataMsg("Invalid JSON."); }
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => applyImport(String(r.result)); r.readAsText(f);
  };
  const autofill = () => {
    const completed = available.filter((p: any) => p.status === "completed");
    const sec = (type: SectionType, content: any, title?: string) => ({
      id: uid(), type, title: title || defaultTitleFor(type), enabled: true, order: 0,
      content: { ...defaultContentFor(type), ...content },
    });
    const sections = [
      sec("hero",     { headline: user?.bio || "", tagline: user?.techStackPreference || "" }),
      sec("about",    { body: user?.bio || "" }),
      sec("skills",   { items: (user?.skills || []).map((s: string) => ({ name: s })) }),
      sec("projects", { ids: completed.map((p: any) => p._id) }),
      ...(user?.github
        ? [sec("contact", { links: [{ icon: "github", label: "GitHub", url: `https://github.com/${user.github}` }] })]
        : [sec("contact", { links: [] })]),
    ].map((s, i) => ({ ...s, order: i }));
    set({ sections });
    setDataMsg("Auto-filled from your profile ✓");
  };

  if (loading || !cfg) {
    return (
      <div style={{ position: "fixed", inset: 0, top: 56, left: 64, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background, #fff)" }}>
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    /* Fixed overlay: covers content area below topnav + right of sidebar icon rail */
    <div
      style={{
        position: "fixed",
        top: 56, left: 64, right: 0, bottom: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--background, #fff)",
      }}
    >
      {/* ── TOP TOOLBAR ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background shrink-0">
        {/* Brand */}
        <div className="hidden sm:flex items-center gap-1.5 mr-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Portfolio</span>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-0.5 bg-card border border-border rounded-xl p-0.5 flex-1 min-w-0 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  on ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-background"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Device toggle – desktop only */}
        <div className="hidden md:flex items-center gap-0.5 bg-card border border-border rounded-xl p-0.5 shrink-0">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-lg transition-colors ${device === "desktop" ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-lg transition-colors ${device === "mobile" ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preview button – mobile only */}
        <button
          onClick={() => setShowPreview(true)}
          className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-card border border-border rounded-xl text-[11px] font-medium text-muted hover:text-foreground shrink-0"
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>

        {/* Save status */}
        <span className="text-[11px] text-muted flex items-center gap-1 shrink-0">
          {saving
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving</>
            : savedAt
            ? <><Check className="w-3 h-3 text-emerald-500" /> Saved</>
            : null}
        </span>

        {/* View live */}
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[11px] font-semibold shrink-0"
          >
            <ExternalLink className="w-3 h-3" /> Live
          </a>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="w-full md:w-[390px] lg:w-[430px] shrink-0 flex flex-col border-r border-border overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
            <EditorPanel
              tab={tab} cfg={cfg} set={set} user={user} available={available}
              activeTheme={activeTheme} can3d={can3d}
              handle={handle} handleState={handleState}
              onHandleChange={onHandleChange} claimHandle={claimHandle}
              publicUrl={publicUrl} jsonText={jsonText} setJsonText={setJsonText}
              dataMsg={dataMsg} applyImport={applyImport} onFile={onFile}
              exportJson={exportJson} autofill={autofill}
            />
          </div>
        </div>

        {/* Preview panel – visible md+ */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div
            className="w-full h-full overflow-y-auto scrollbar-thin mx-auto transition-all duration-200"
            style={{ maxWidth: device === "mobile" ? 420 : "100%" }}
          >
            {previewData && (
              <PortfolioRenderer
                key={`${cfg.themeId}|${cfg.bgOverride}|${cfg.threeOverride}|${cfg.heavy3d}|${(cfg.sections || []).length}`}
                data={previewData}
                contained
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile preview overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background" style={{ top: 56 }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">Preview</span>
            <button
              onClick={() => setShowPreview(false)}
              className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {previewData && (
              <PortfolioRenderer
                key={`mobile|${cfg.themeId}|${(cfg.sections || []).length}`}
                data={previewData}
                contained
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Editor panel: tab content ── */
function EditorPanel({
  tab, cfg, set, user, available, activeTheme, can3d,
  handle, handleState, onHandleChange, claimHandle, publicUrl,
  jsonText, setJsonText, dataMsg, applyImport, onFile, exportJson, autofill,
}: any) {
  switch (tab) {
    /* ─ SECTIONS ─ */
    case "sections":
      return (
        <>
          <Panel title="Sections & Content">
            <SectionsEditor
              sections={cfg.sections || []}
              available={available}
              onChange={(next: any) => set({ sections: next })}
            />
          </Panel>
          <Panel title="Profile tokens">
            <p className="text-xs text-muted mb-2.5">Click to copy — paste into any text field to pull live data.</p>
            <div className="grid grid-cols-2 gap-1">
              {AVAILABLE_TOKENS.map((t: any) => (
                <button
                  key={t.token}
                  onClick={() => navigator.clipboard.writeText(t.token)}
                  title={t.desc}
                  className="text-left px-2 py-1.5 rounded-lg hover:bg-background border border-transparent hover:border-border transition-colors"
                >
                  <code className="text-[10px] text-primary">{t.token}</code>
                </button>
              ))}
            </div>
          </Panel>
        </>
      );

    /* ─ STYLE ─ */
    case "style":
      return (
        <>
          <Panel title={`Themes · ${THEMES.length}`}>
            <div className="max-h-64 overflow-y-auto scrollbar-thin pr-1 space-y-3">
              {THEME_CATEGORIES.map((cat: string) => {
                const items = THEMES.filter((t: any) => t.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">{cat}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((t: any) => (
                        <button
                          key={t.id}
                          onClick={() => set({ themeId: t.id })}
                          className={`text-left rounded-xl p-2 border transition-all ${
                            cfg.themeId === t.id
                              ? "border-primary ring-2 ring-primary/25"
                              : "border-border hover:border-border-strong"
                          }`}
                        >
                          <div
                            className="h-8 rounded-lg mb-1.5"
                            style={{ background: `linear-gradient(135deg, ${t.palette.accent}, ${t.palette.accent2})` }}
                          />
                          <p className="text-[11px] font-semibold text-foreground truncate">{t.name}</p>
                          {t.supports3d && (
                            <span className="text-[9px] text-primary flex items-center gap-0.5 mt-0.5">
                              <Box className="w-2.5 h-2.5" /> 3D
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Colors">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted mb-1">Accent</label>
                <input
                  type="color"
                  value={cfg.accent || activeTheme.palette.accent}
                  onChange={(e: any) => set({ accent: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Accent 2</label>
                <input
                  type="color"
                  value={cfg.accent2 || activeTheme.palette.accent2}
                  onChange={(e: any) => set({ accent2: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background cursor-pointer"
                />
              </div>
            </div>
            <label className="block text-xs text-muted mb-1">Card style</label>
            <select value={cfg.card || activeTheme.card} onChange={(e: any) => set({ card: e.target.value })} className={inp}>
              <option value="glass">Glass (frosted)</option>
              <option value="solid">Solid</option>
              <option value="outline">Outline</option>
            </select>
            <button
              onClick={() => set({ accent: "", accent2: "", card: "" })}
              className="text-xs text-muted hover:text-foreground mt-2 block"
            >
              Reset to theme defaults
            </button>
          </Panel>

          <Panel title="Animation">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1">Section entrance</label>
                <select value={cfg.sectionAnim || "rise"} onChange={(e: any) => set({ sectionAnim: e.target.value })} className={inp}>
                  {SECTION_ANIM_KINDS.map((k: string) => (
                    <option key={k} value={k}>{(SECTION_ANIMS as any)[k].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Project card design</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CARD_STYLES.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => set({ projectCardStyle: c.id })}
                      className={`text-xs px-2.5 py-2 rounded-xl border text-left transition-colors ${
                        (cfg.projectCardStyle || "glass") === c.id
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted hover:bg-background"
                      }`}
                    >
                      {c.label}
                      {c.is3d && <span className="text-[9px] text-primary ml-1">3D</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Card entrance</label>
                <select value={cfg.projectCardAnim || "rise"} onChange={(e: any) => set({ projectCardAnim: e.target.value })} className={inp}>
                  {CARD_ANIM_KINDS.map((k: string) => (
                    <option key={k} value={k}>{(CARD_ANIMS as any)[k].label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Panel>
        </>
      );

    /* ─ BACKGROUND ─ */
    case "background":
      return (
        <>
          <Panel title="2D Effect">
            <p className="text-xs text-muted mb-2">Lightweight CSS/canvas — always loads instantly.</p>
            <select
              value={cfg.bgOverride || activeTheme.background}
              onChange={(e: any) => set({ bgOverride: e.target.value })}
              className={inp}
            >
              {ALL_BACKGROUNDS.map((b: string) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Panel>

          <Panel title="3D Scene">
            <select
              value={cfg.threeOverride || activeTheme.three}
              onChange={(e: any) => set({ threeOverride: e.target.value })}
              className={inp}
            >
              <option value="none">none</option>
              {ALL_THREE_SCENES.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className={`flex items-start gap-2.5 mt-3 ${can3d ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
              <input
                type="checkbox"
                disabled={!can3d}
                checked={!!cfg.heavy3d && can3d}
                onChange={(e: any) => set({ heavy3d: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary"
              />
              <div>
                <span className="text-sm font-medium text-foreground">Heavy 3D render</span>
                <p className="text-xs text-muted mt-0.5">
                  {can3d
                    ? "Loads a real-time three.js background."
                    : "Pick a 3D-capable theme or scene to unlock."}
                </p>
              </div>
            </label>
            <button
              onClick={() => set({ bgOverride: "", threeOverride: "", heavy3d: false })}
              className="text-xs text-muted hover:text-foreground mt-3 block"
            >
              Reset to theme default
            </button>
          </Panel>
        </>
      );

    /* ─ DATA ─ */
    case "data":
      return (
        <>
          <Panel title="Auto-fill">
            <p className="text-xs text-muted mb-3">
              Generate a complete portfolio instantly from your profile — name, skills, bio, completed projects.
            </p>
            <button
              onClick={autofill}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold w-full justify-center"
            >
              <Wand2 className="w-4 h-4" /> Auto-fill from profile
            </button>
            {dataMsg && <p className="text-xs text-emerald-600 mt-2">{dataMsg}</p>}
          </Panel>

          <Panel title="Import JSON">
            <textarea
              value={jsonText}
              onChange={(e: any) => setJsonText(e.target.value)}
              rows={5}
              placeholder={'{ "version": 1, "sections": [...] }'}
              className={`${inp} resize-none font-mono text-[11px]`}
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                onClick={() => applyImport(jsonText)}
                disabled={!jsonText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" /> Apply
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium cursor-pointer hover:bg-background">
                <Upload className="w-3.5 h-3.5" /> Upload .json
                <input type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
              </label>
            </div>
          </Panel>

          <Panel title="Export JSON">
            <p className="text-xs text-muted mb-3">Download your portfolio config to back up or share.</p>
            <button
              onClick={exportJson}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-background w-full justify-center"
            >
              <Download className="w-4 h-4" /> Export portfolio.json
            </button>
          </Panel>
        </>
      );

    /* ─ PUBLISH ─ */
    case "publish":
      return (
        <>
          <Panel title="Public URL">
            <p className="text-xs text-muted mb-2">
              Your portfolio lives at <code className="text-primary text-[11px]">/portfolio/[handle]</code>
            </p>
            <div className="flex items-center gap-1 rounded-xl border border-border overflow-hidden bg-card px-3 py-2">
              <span className="text-sm text-muted shrink-0">/portfolio/</span>
              <input
                value={handle}
                onChange={(e: any) => onHandleChange(e.target.value)}
                placeholder="your-handle"
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-0"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${handleState.ok === false ? "text-red-500" : handleState.ok ? "text-emerald-600" : "text-muted"}`}>
                {handleState.checking ? "Checking…" : handleState.msg || (user?.handle ? `Current: ${user.handle}` : "Choose a handle")}
              </span>
              <button
                onClick={claimHandle}
                disabled={handleState.checking || handleState.ok === false || !handle}
                className="text-xs font-semibold text-primary disabled:opacity-40 hover:underline"
              >
                Save
              </button>
            </div>
          </Panel>

          <Panel title="Visibility">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-background transition-colors">
              <input
                type="checkbox"
                checked={cfg.isPublished !== false}
                onChange={(e: any) => set({ isPublished: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary"
              />
              <div>
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {cfg.isPublished !== false
                    ? <><Eye className="w-4 h-4 text-emerald-500" /> Live &amp; public</>
                    : <><EyeOff className="w-4 h-4 text-muted" /> Private</>}
                </span>
                <p className="text-xs text-muted mt-0.5">
                  {cfg.isPublished !== false ? "Anyone with the link can see it." : "Only you can view it."}
                </p>
              </div>
            </label>
          </Panel>

          {publicUrl && (
            <Panel title="Share">
              <p className="text-xs text-muted break-all mb-3 px-3 py-2.5 bg-background border border-border rounded-xl">
                {typeof window !== "undefined" ? window.location.origin : ""}{publicUrl}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(
                    (typeof window !== "undefined" ? window.location.origin : "") + publicUrl
                  )}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-background"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy link
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </a>
              </div>
            </Panel>
          )}

          <Panel title="Stats">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Theme",    value: activeTheme.name },
                { label: "Views",    value: String(cfg.views ?? 0) },
                { label: "Sections", value: String((cfg.sections || []).filter((s: any) => s.enabled).length) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background border border-border rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-foreground truncate">{value}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      );

    default:
      return null;
  }
}

const inp = "w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {title && (
        <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
