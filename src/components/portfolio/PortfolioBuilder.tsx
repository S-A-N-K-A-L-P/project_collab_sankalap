"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Check, Copy, ExternalLink, Eye, EyeOff,
  Monitor, Smartphone, Box, Sparkles, Download, Upload, Wand2,
  Palette, Layers, Image as ImageIcon, FileJson, Rocket,
} from "lucide-react";
import PortfolioRenderer, { type PortfolioData } from "./PortfolioRenderer";
import SectionsEditor from "./SectionsEditor";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES, THEME_CATEGORIES } from "./themes/registry";
import {
  SECTION_ANIM_KINDS, SECTION_ANIMS, CARD_STYLES, CARD_ANIMS, CARD_ANIM_KINDS, AVAILABLE_TOKENS,
} from "./animations";
import { defaultTitleFor, defaultContentFor, sanitizeImportedSections, uid, type SectionType } from "./sections";

type Tab = "theme" | "background" | "sections" | "data" | "publish";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "theme",      label: "Theme",      icon: Palette },
  { id: "background", label: "Background", icon: ImageIcon },
  { id: "sections",   label: "Sections",   icon: Layers },
  { id: "data",       label: "Data",       icon: FileJson },
  { id: "publish",    label: "Publish",    icon: Rocket },
];

export default function PortfolioBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [cfg, setCfg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [available, setAvailable] = useState<any[]>([]);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<Tab>("sections");

  const [handle, setHandle] = useState("");
  const [handleState, setHandleState] = useState<{ checking: boolean; ok?: boolean; msg?: string }>({ checking: false });

  // data tab
  const [jsonText, setJsonText] = useState("");
  const [dataMsg, setDataMsg] = useState<string | null>(null);

  // ── load ──
  const loadMe = (then?: (d: any) => void) =>
    fetch("/api/portfolio/me").then(r => r.json()).then(d => {
      setCfg(d.portfolio); setUser(d.user); setAvailable(d.availableProjects || []);
      setHandle(d.user?.handle || ""); then?.(d);
    });
  useEffect(() => { loadMe().finally(() => setLoading(false)); }, []);

  // ── debounced autosave ──
  const saveTimer = useRef<any>(null);
  const queueSave = (next: any) => {
    setCfg(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), 600);
  };
  async function save(next: any) {
    setSaving(true);
    try {
      const { _id, userId, createdAt, updatedAt, views, __v, ...payload } = next;
      const res = await fetch("/api/portfolio/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) setSavedAt(new Date());
    } finally { setSaving(false); }
  }
  const set = (patch: any) => queueSave({ ...cfg, ...patch });

  // ── handle ──
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

  // ── preview projects (from projects section ids → fallback completed) ──
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

  const previewData: PortfolioData | null = cfg && { ...cfg, user, projects: previewProjects };

  // ── Data tab: export / import / autofill ──
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
      set({
        sections,
        themeId: t.id || cfg.themeId, accent: t.accent || "", accent2: t.accent2 || "", card: t.card || "",
        sectionAnim: t.sectionAnim || "rise", projectCardStyle: t.projectCardStyle || "glass", projectCardAnim: t.projectCardAnim || "rise",
        bgOverride: b.effect || "", threeOverride: b.scene || "", heavy3d: !!b.heavy3d,
        seo: m.seo || cfg.seo,
      });
      setDataMsg("Imported ✓ (applied & saving)");
    } catch { setDataMsg("Invalid JSON."); }
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => applyImport(String(r.result)); r.readAsText(f);
  };
  const autofill = () => {
    const completed = available.filter((p: any) => p.status === "completed");
    const sec = (type: SectionType, content: any, title?: string) => ({ id: uid(), type, title: title || defaultTitleFor(type), enabled: true, order: 0, content: { ...defaultContentFor(type), ...content } });
    const sections = [
      sec("hero", { headline: user?.bio || "", tagline: user?.techStackPreference || "" }),
      sec("about", { body: user?.bio || "" }),
      sec("skills", { items: (user?.skills || []).map((s: string) => ({ name: s })) }),
      sec("projects", { ids: completed.map((p: any) => p._id) }),
      ...(user?.github ? [sec("contact", { links: [{ icon: "github", label: "GitHub", url: `https://github.com/${user.github}` }] })] : [sec("contact", { links: [] })]),
    ].map((s, i) => ({ ...s, order: i }));
    set({ sections });
    setDataMsg("Auto-filled from your profile ✓");
  };

  if (loading || !cfg) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const activeTheme = THEMES.find(t => t.id === cfg.themeId) || THEMES[0];
  const publicUrl = user?.handle ? `/portfolio/${user.handle}` : null;
  const can3d = activeTheme.supports3d || (!!cfg.threeOverride && cfg.threeOverride !== "none");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(330px,440px)_1fr] gap-5">
      {/* ════ LEFT: tabbed controls ════ */}
      <div className="space-y-3 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
        {/* tab bar */}
        <div className="flex items-center justify-between gap-2 sticky top-0 bg-background/80 backdrop-blur z-10 py-1">
          <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg p-1 overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon; const on = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${on ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted flex items-center gap-1 shrink-0">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : savedAt ? <Check className="w-3 h-3 text-emerald-500" /> : null}
          </span>
        </div>

        {/* ── THEME tab ── */}
        {tab === "theme" && (<>
          <Card title={`Theme (${THEMES.length})`}>
            <div className="max-h-[340px] overflow-y-auto scrollbar-thin pr-1 space-y-3">
              {THEME_CATEGORIES.map(cat => {
                const items = THEMES.filter(t => t.category === cat); if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">{cat}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map(t => (
                        <button key={t.id} onClick={() => set({ themeId: t.id })}
                          className={`text-left rounded-lg p-2 border transition-all ${cfg.themeId === t.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-border-strong"}`}>
                          <div className="h-9 rounded-md mb-1.5" style={{ background: `linear-gradient(135deg, ${t.palette.accent}, ${t.palette.accent2})` }} />
                          <p className="text-[11px] font-semibold text-foreground truncate">{t.name}</p>
                          {t.supports3d && <span className="text-[9px] text-primary flex items-center gap-0.5"><Box className="w-2.5 h-2.5" /> 3D</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Colors & Card">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Accent"><input type="color" value={cfg.accent || activeTheme.palette.accent} onChange={e => set({ accent: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-background cursor-pointer" /></Field>
              <Field label="Accent 2"><input type="color" value={cfg.accent2 || activeTheme.palette.accent2} onChange={e => set({ accent2: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-background cursor-pointer" /></Field>
            </div>
            <Field label="Card style">
              <select value={cfg.card || activeTheme.card} onChange={e => set({ card: e.target.value })} className={inp}>
                <option value="glass">glass</option><option value="solid">solid</option><option value="outline">outline</option>
              </select>
            </Field>
            <button onClick={() => set({ accent: "", accent2: "", card: "" })} className="text-xs font-medium text-muted hover:text-foreground">Reset colors</button>
          </Card>

          <Card title="Animation">
            <Field label="Section entrance">
              <select value={cfg.sectionAnim || "rise"} onChange={e => set({ sectionAnim: e.target.value })} className={inp}>
                {SECTION_ANIM_KINDS.map(k => <option key={k} value={k}>{SECTION_ANIMS[k].label}</option>)}
              </select>
            </Field>
            <Field label="Project card design">
              <div className="grid grid-cols-2 gap-1.5">
                {CARD_STYLES.map(c => (
                  <button key={c.id} onClick={() => set({ projectCardStyle: c.id })}
                    className={`text-xs px-2 py-2 rounded-lg border text-left ${(cfg.projectCardStyle || "glass") === c.id ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted hover:bg-background"}`}>
                    {c.label}{c.is3d && <span className="text-[9px] text-primary ml-1">3D</span>}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Project card entrance">
              <select value={cfg.projectCardAnim || "rise"} onChange={e => set({ projectCardAnim: e.target.value })} className={inp}>
                {CARD_ANIM_KINDS.map(k => <option key={k} value={k}>{CARD_ANIMS[k].label}</option>)}
              </select>
            </Field>
          </Card>
        </>)}

        {/* ── BACKGROUND tab ── */}
        {tab === "background" && (<>
          <Card title="2D Background effect">
            <select value={cfg.bgOverride || activeTheme.background} onChange={e => set({ bgOverride: e.target.value })} className={inp}>
              {ALL_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <p className="text-[10px] text-muted mt-1">Lightweight (CSS/canvas) — always loads, no 3D dependency.</p>
          </Card>
          <Card title="3D scene">
            <select value={cfg.threeOverride || activeTheme.three} onChange={e => set({ threeOverride: e.target.value })} className={inp}>
              <option value="none">none</option>
              {ALL_THREE_SCENES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className={`flex items-start gap-2.5 mt-3 ${can3d ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
              <input type="checkbox" disabled={!can3d} checked={!!cfg.heavy3d && can3d} onChange={e => set({ heavy3d: e.target.checked })} className="mt-0.5 w-4 h-4 rounded border-border text-primary" />
              <div>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5"><Box className="w-4 h-4" /> 3D heavy render (three.js)</span>
                <p className="text-xs text-muted mt-0.5">{can3d ? "Loads a real-time three.js background only when on." : "Choose a 3D-capable theme or a 3D scene above to enable."}</p>
              </div>
            </label>
          </Card>
          <Card title="Reset"><button onClick={() => set({ bgOverride: "", threeOverride: "", heavy3d: false })} className="text-xs font-medium text-muted hover:text-foreground">Reset background to theme default</button></Card>
        </>)}

        {/* ── SECTIONS tab ── */}
        {tab === "sections" && (<>
          <Card title="Sections & Content">
            <SectionsEditor sections={cfg.sections || []} available={available} onChange={(next) => set({ sections: next })} />
          </Card>
          <Card title="Data tokens">
            <p className="text-xs text-muted mb-2">Use these in any text field — they fill from your profile/DB:</p>
            <div className="grid grid-cols-2 gap-1">
              {AVAILABLE_TOKENS.map(t => (
                <button key={t.token} onClick={() => navigator.clipboard.writeText(t.token)} title={t.desc}
                  className="text-left px-2 py-1 rounded hover:bg-background"><code className="text-[10px] text-primary">{t.token}</code></button>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── DATA tab ── */}
        {tab === "data" && (<>
          <Card title="Auto-fill">
            <p className="text-xs text-muted mb-2">Generate a full portfolio from your profile (name, skills, completed projects, GitHub).</p>
            <button onClick={autofill} className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold"><Wand2 className="w-4 h-4" /> Auto-fill from profile</button>
          </Card>
          <Card title="Import JSON">
            <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={6} placeholder='Paste portfolio JSON: { "version":1, "sections":[…] }' className={`${inp} resize-none font-mono text-[11px]`} />
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button onClick={() => applyImport(jsonText)} disabled={!jsonText.trim()} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary disabled:opacity-40 text-white rounded-lg text-xs font-semibold"><Upload className="w-3.5 h-3.5" /> Apply</button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium cursor-pointer hover:bg-background">
                <Upload className="w-3.5 h-3.5" /> Upload .json
                <input type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
              </label>
            </div>
            {dataMsg && <p className="text-[11px] text-emerald-600 mt-2">{dataMsg}</p>}
          </Card>
          <Card title="Export JSON">
            <p className="text-xs text-muted mb-2">Download your portfolio as JSON (re-import anytime).</p>
            <button onClick={exportJson} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background"><Download className="w-4 h-4" /> Export portfolio.json</button>
          </Card>
        </>)}

        {/* ── PUBLISH tab ── */}
        {tab === "publish" && (<>
          <Card title="Public URL">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted">/portfolio/</span>
              <input value={handle} onChange={e => onHandleChange(e.target.value)} placeholder="your-handle" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${handleState.ok === false ? "text-red-500" : handleState.ok ? "text-emerald-600" : "text-muted"}`}>
                {handleState.checking ? "Checking…" : handleState.msg || (user?.handle ? `Current: ${user.handle}` : "Pick a handle")}
              </span>
              <button onClick={claimHandle} disabled={handleState.checking || handleState.ok === false || !handle} className="text-xs font-semibold text-primary disabled:opacity-40 hover:underline">Save handle</button>
            </div>
          </Card>
          <Card title="Status">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={cfg.isPublished !== false} onChange={e => set({ isPublished: e.target.checked })} className="w-4 h-4 rounded border-border text-primary" />
              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                {cfg.isPublished !== false ? <><Eye className="w-4 h-4 text-emerald-600" /> Live &amp; public</> : <><EyeOff className="w-4 h-4 text-muted" /> Private</>}
              </span>
            </label>
          </Card>
          <Card title="Share">
            {publicUrl ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate text-foreground">{typeof window !== "undefined" ? window.location.origin : ""}{publicUrl}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button onClick={() => navigator.clipboard.writeText(window.location.origin + publicUrl)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-background"><Copy className="w-3.5 h-3.5" /> Copy</button>
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold"><ExternalLink className="w-3.5 h-3.5" /> View live</a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent((typeof window !== "undefined" ? window.location.origin : "") + publicUrl)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm text-primary hover:bg-background">LinkedIn</a>
                </div>
              </>
            ) : <p className="text-sm text-muted">Claim a handle above to get your public link.</p>}
          </Card>
          <Card title="Overview">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Theme" value={activeTheme.name} />
              <Stat label="Views" value={String(cfg.views ?? 0)} />
              <Stat label="Sections" value={String((cfg.sections || []).filter((s: any) => s.enabled).length)} />
            </div>
          </Card>
        </>)}
      </div>

      {/* ════ RIGHT: live preview ════ */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Live preview {cfg.heavy3d && can3d && <span className="text-primary">· 3D on</span>}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded ${device === "desktop" ? "bg-primary text-white" : "text-muted hover:bg-background"}`}><Monitor className="w-3.5 h-3.5" /></button>
            <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded ${device === "mobile" ? "bg-primary text-white" : "text-muted hover:bg-background"}`}><Smartphone className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden shadow-md bg-card" style={{ height: "calc(100vh - 190px)", minHeight: 500 }}>
          <div className="h-full overflow-y-auto scrollbar-thin mx-auto transition-all" style={{ width: device === "mobile" ? 390 : "100%", maxWidth: "100%" }}>
            {previewData && (
              <PortfolioRenderer
                key={`${cfg.themeId}|${cfg.bgOverride}|${cfg.threeOverride}|${cfg.heavy3d}|${(cfg.sections || []).length}`}
                data={previewData} contained
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-3 last:mb-0"><label className="block text-xs font-medium text-muted mb-1">{label}</label>{children}</div>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
      <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
