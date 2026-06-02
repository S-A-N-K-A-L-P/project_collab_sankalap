"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Check, Copy, ExternalLink, Plus, Trash2, Eye, EyeOff,
  Monitor, Smartphone, Box, Sparkles,
} from "lucide-react";
import PortfolioRenderer, { type PortfolioData } from "./PortfolioRenderer";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES, THEME_CATEGORIES } from "./themes/registry";
import {
  SECTION_ANIM_KINDS, SECTION_ANIMS, CARD_STYLES, CARD_ANIMS, CARD_ANIM_KINDS, AVAILABLE_TOKENS,
} from "./animations";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero", about: "About", skills: "Skills", projects: "Projects",
  experience: "Experience", contact: "Contact",
};
const LINK_ICONS = ["github", "linkedin", "twitter", "mail", "globe", "link"];

export default function PortfolioBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [cfg, setCfg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [available, setAvailable] = useState<any[]>([]);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [mode, setMode] = useState<"designer" | "publish">("designer");

  // handle
  const [handle, setHandle] = useState("");
  const [handleState, setHandleState] = useState<{ checking: boolean; ok?: boolean; msg?: string }>({ checking: false });

  // ── load ──
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

  // ── debounced autosave ──
  const saveTimer = useRef<any>(null);
  const queueSave = (next: any) => {
    setCfg(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), 700);
  };
  async function save(next: any) {
    setSaving(true);
    try {
      const { _id, userId, createdAt, updatedAt, views, ...payload } = next;
      const res = await fetch("/api/portfolio/me", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) setSavedAt(new Date());
    } finally { setSaving(false); }
  }

  const set = (patch: any) => queueSave({ ...cfg, ...patch });

  // ── handle availability ──
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
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handle }),
    });
    const d = await r.json();
    if (r.ok) { setUser({ ...user, handle: d.handle }); setHandleState({ checking: false, ok: true, msg: "Saved!" }); }
    else setHandleState({ checking: false, ok: false, msg: d.error });
  }

  // ── derived preview data ──
  const previewProjects = useMemo(() => {
    if (!cfg) return [];
    const ids: string[] = cfg.featuredProjectIds || [];
    if (ids.length) {
      const byId = new Map(available.map((p: any) => [p._id, p]));
      return ids.map((id) => byId.get(id)).filter(Boolean);
    }
    return available.filter((p: any) => p.status === "completed").slice(0, 6);
  }, [cfg, available]);

  const previewData: PortfolioData | null = cfg && {
    ...cfg, user, projects: previewProjects,
  };

  if (loading || !cfg) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const activeTheme = THEMES.find(t => t.id === cfg.themeId) || THEMES[0];
  const publicUrl = user?.handle ? `/portfolio/${user.handle}` : null;

  const toggleSection = (key: string) => {
    const sections = [...(cfg.sections || [])];
    const i = sections.findIndex((s: any) => s.key === key);
    if (i >= 0) sections[i] = { ...sections[i], enabled: !sections[i].enabled };
    else sections.push({ key, enabled: false, order: sections.length });
    set({ sections });
  };
  const sectionEnabled = (key: string) => {
    const s = (cfg.sections || []).find((x: any) => x.key === key);
    return s ? s.enabled : true;
  };

  const toggleFeatured = (id: string) => {
    const ids: string[] = cfg.featuredProjectIds || [];
    set({ featuredProjectIds: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] });
  };

  // ── Mode bar (Designer | Publish) ──
  const modeBar = (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
        {(["designer", "publish"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${mode === m ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
            {m === "designer" ? "🎨 Designer" : "🚀 Publish"}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted flex items-center gap-1.5">
        {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : savedAt ? <><Check className="w-3 h-3 text-emerald-500" /> Saved</> : null}
      </span>
    </div>
  );

  // ── PUBLISH mode ──
  if (mode === "publish") {
    const live = cfg.isPublished !== false;
    return (
      <div className="space-y-5">
        {modeBar}
        <div className="max-w-xl mx-auto space-y-5">
          <Card title="Status">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={live} onChange={e => set({ isPublished: e.target.checked })} className="w-4 h-4 rounded border-border text-primary" />
              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                {live ? <><Eye className="w-4 h-4 text-emerald-600" /> Live &amp; public</> : <><EyeOff className="w-4 h-4 text-muted" /> Private (only you)</>}
              </span>
            </label>
          </Card>

          <Card title="Your public link">
            {publicUrl ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate text-foreground">{typeof window !== "undefined" ? window.location.origin : ""}{publicUrl}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button onClick={() => navigator.clipboard.writeText(window.location.origin + publicUrl)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-background"><Copy className="w-3.5 h-3.5" /> Copy</button>
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold"><ExternalLink className="w-3.5 h-3.5" /> View live</a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + publicUrl)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm text-primary hover:bg-background">Share on LinkedIn</a>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Claim a handle in Designer mode to get your public link.</p>
            )}
          </Card>

          <Card title="Overview">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Theme" value={activeTheme.name} />
              <Stat label="Views" value={String(cfg.views ?? 0)} />
              <Stat label="3D" value={cfg.heavy3d ? "On" : "Off"} />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── DESIGNER mode (two-pane) ──
  return (
    <div className="space-y-4">
      {modeBar}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-5">
      {/* ════ LEFT: controls ════ */}
      <div className="space-y-5 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
        {/* heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Format &amp; Sections</h2>
          <span className="text-xs text-muted flex items-center gap-1.5">
            {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
              : savedAt ? <><Check className="w-3 h-3 text-emerald-500" /> Saved</> : null}
          </span>
        </div>

        {/* Handle */}
        <Card title="Public URL">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted">/portfolio/</span>
            <input
              value={handle}
              onChange={e => onHandleChange(e.target.value)}
              placeholder="your-handle"
              className="flex-1 px-2 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${handleState.ok === false ? "text-red-500" : handleState.ok ? "text-emerald-600" : "text-muted"}`}>
              {handleState.checking ? "Checking…" : handleState.msg || (user?.handle ? `Current: ${user.handle}` : "Pick a handle")}
            </span>
            <button
              onClick={claimHandle}
              disabled={handleState.checking || handleState.ok === false || !handle}
              className="text-xs font-semibold text-primary disabled:opacity-40 hover:underline"
            >Save handle</button>
          </div>
        </Card>

        {/* Theme — categorized, scrollable */}
        <Card title={`Theme (${THEMES.length})`}>
          <div className="max-h-[360px] overflow-y-auto scrollbar-thin pr-1 space-y-3">
            {THEME_CATEGORIES.map(catName => {
              const items = THEMES.filter(t => t.category === catName);
              if (!items.length) return null;
              return (
                <div key={catName}>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">{catName}</p>
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

        {/* Customize — overrides on top of the chosen theme */}
        <Card title="Customize">
          <Field label="Background effect">
            <select value={cfg.bgOverride || activeTheme.background} onChange={e => set({ bgOverride: e.target.value })} className={inp}>
              {ALL_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="3D scene (used when 3D render is on)">
            <select value={cfg.threeOverride || activeTheme.three} onChange={e => set({ threeOverride: e.target.value })} className={inp}>
              <option value="none">none</option>
              {ALL_THREE_SCENES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Accent">
              <input type="color" value={cfg.accent || activeTheme.palette.accent} onChange={e => set({ accent: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-background cursor-pointer" />
            </Field>
            <Field label="Accent 2">
              <input type="color" value={cfg.accent2 || activeTheme.palette.accent2} onChange={e => set({ accent2: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-background cursor-pointer" />
            </Field>
          </div>
          <Field label="Card style">
            <select value={cfg.card || activeTheme.card} onChange={e => set({ card: e.target.value })} className={inp}>
              <option value="glass">glass</option>
              <option value="solid">solid</option>
              <option value="outline">outline</option>
            </select>
          </Field>
          <button onClick={() => set({ bgOverride: "", threeOverride: "", accent: "", accent2: "", card: "" })}
            className="text-xs font-medium text-muted hover:text-foreground mt-1">Reset to theme defaults</button>
        </Card>

        {/* Animation */}
        <Card title="Animation">
          <Field label="Section entrance">
            <select value={cfg.sectionAnim || "rise"} onChange={e => set({ sectionAnim: e.target.value })} className={inp}>
              {SECTION_ANIM_KINDS.map(k => <option key={k} value={k}>{SECTION_ANIMS[k].label}</option>)}
            </select>
          </Field>
        </Card>

        {/* Project cards */}
        <Card title="Project Cards">
          <Field label="Card design">
            <div className="grid grid-cols-2 gap-1.5">
              {CARD_STYLES.map(c => (
                <button key={c.id} onClick={() => set({ projectCardStyle: c.id })}
                  className={`text-xs px-2 py-2 rounded-lg border text-left transition-colors ${ (cfg.projectCardStyle || "glass") === c.id ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted hover:bg-background"}`}>
                  {c.label}{c.is3d && <span className="text-[9px] text-primary ml-1">3D</span>}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Card entrance">
            <select value={cfg.projectCardAnim || "rise"} onChange={e => set({ projectCardAnim: e.target.value })} className={inp}>
              {CARD_ANIM_KINDS.map(k => <option key={k} value={k}>{CARD_ANIMS[k].label}</option>)}
            </select>
          </Field>
        </Card>

        {/* DB data + tokens */}
        <Card title="Data &amp; Tokens">
          <p className="text-xs text-muted leading-relaxed mb-2">
            Your <strong className="text-foreground">name, avatar, location, skills &amp; GitHub</strong> are pulled live from your profile (edit them in Settings). Use these tokens in any text field — they fill in from the database:
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
            {AVAILABLE_TOKENS.map(t => (
              <button key={t.token} onClick={() => navigator.clipboard.writeText(t.token)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-background text-left group">
                <code className="text-[11px] text-primary font-mono">{t.token}</code>
                <span className="text-[10px] text-muted truncate group-hover:text-foreground">{t.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-1">Click a token to copy it.</p>
        </Card>

        {/* 3D heavy render toggle */}
        <Card title="Rendering">
          {(() => {
            const can3d = activeTheme.supports3d || (!!cfg.threeOverride && cfg.threeOverride !== "none");
            return (
              <label className={`flex items-start gap-2.5 ${can3d ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                <input type="checkbox" disabled={!can3d}
                  checked={!!cfg.heavy3d && can3d}
                  onChange={e => set({ heavy3d: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5"><Box className="w-4 h-4" /> 3D heavy render (three.js)</span>
                  <p className="text-xs text-muted mt-0.5">
                    {can3d
                      ? "Loads a real-time three.js background. Heavier on low-end devices; the three.js code loads only when this is on."
                      : "Pick a 3D-capable theme or choose a 3D scene in Customize to enable."}
                  </p>
                </div>
              </label>
            );
          })()}
        </Card>

        {/* Content */}
        <Card title="Content">
          <Field label="Tagline">
            <input value={cfg.tagline || ""} onChange={e => set({ tagline: e.target.value })} placeholder="e.g. Full-stack · AI" className={inp} />
          </Field>
          <Field label="Headline">
            <input value={cfg.headline || ""} onChange={e => set({ headline: e.target.value })} placeholder="One line about you" className={inp} />
          </Field>
          <Field label="About">
            <textarea value={cfg.aboutLong || ""} onChange={e => set({ aboutLong: e.target.value })} rows={4} placeholder="Tell your story…" className={`${inp} resize-none`} />
          </Field>
        </Card>

        {/* Sections */}
        <Card title="Sections">
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(SECTION_LABELS).map(key => (
              <button key={key} onClick={() => toggleSection(key)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${sectionEnabled(key) ? "bg-primary text-white border-primary" : "bg-background text-muted border-border"}`}>
                {SECTION_LABELS[key]}
              </button>
            ))}
          </div>
        </Card>

        {/* Featured projects */}
        {available.length > 0 && (
          <Card title="Featured Projects">
            <p className="text-xs text-muted mb-2">Pick which to feature (none = your completed projects).</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {available.map((p: any) => {
                const on = (cfg.featuredProjectIds || []).includes(p._id);
                return (
                  <button key={p._id} onClick={() => toggleFeatured(p._id)}
                    className={`w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg border transition-colors ${on ? "border-primary bg-primary/5" : "border-border hover:bg-background"}`}>
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? "bg-primary border-primary" : "border-border"}`}>
                      {on && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="text-sm text-foreground truncate">{p.title}</span>
                    <span className="ml-auto text-[10px] text-muted capitalize">{p.status}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Links */}
        <Card title="Links">
          <div className="space-y-2">
            {(cfg.links || []).map((l: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <select value={l.icon} onChange={e => { const links = [...cfg.links]; links[i] = { ...l, icon: e.target.value }; set({ links }); }}
                  className="px-1.5 py-1.5 bg-background border border-border rounded-lg text-xs">
                  {LINK_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input value={l.url} onChange={e => { const links = [...cfg.links]; links[i] = { ...l, url: e.target.value }; set({ links }); }}
                  placeholder="https://…" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-lg text-xs" />
                <button onClick={() => set({ links: cfg.links.filter((_: any, j: number) => j !== i) })} className="p-1.5 text-muted hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={() => set({ links: [...(cfg.links || []), { label: "", url: "", icon: "link" }] })}
              className="text-xs font-medium text-primary flex items-center gap-1"><Plus className="w-3 h-3" /> Add link</button>
          </div>
        </Card>
      </div>

      {/* ════ RIGHT: live final-output preview ════ */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Live preview {cfg.heavy3d && activeTheme.supports3d && <span className="text-primary">· 3D on</span>}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded ${device === "desktop" ? "bg-primary text-white" : "text-muted hover:bg-background"}`}><Monitor className="w-3.5 h-3.5" /></button>
            <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded ${device === "mobile" ? "bg-primary text-white" : "text-muted hover:bg-background"}`}><Smartphone className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden shadow-md bg-card"
          style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
          <div className="h-full overflow-y-auto scrollbar-thin mx-auto transition-all"
            style={{ width: device === "mobile" ? 390 : "100%", maxWidth: "100%" }}>
            {previewData && (
              <PortfolioRenderer
                key={`${cfg.themeId}|${cfg.bgOverride}|${cfg.threeOverride}|${cfg.heavy3d}`}
                data={previewData}
                contained
              />
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
      <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{label}</p>
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
