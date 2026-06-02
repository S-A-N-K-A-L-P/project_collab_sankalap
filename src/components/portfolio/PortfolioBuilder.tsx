"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Check, Copy, ExternalLink, Plus, Trash2, Eye, EyeOff,
  Monitor, Smartphone, Box, Sparkles,
} from "lucide-react";
import PortfolioRenderer, { type PortfolioData } from "./PortfolioRenderer";
import { THEMES } from "./themes/registry";

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-5">
      {/* ════ LEFT: controls ════ */}
      <div className="space-y-5 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
        {/* save status */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Portfolio Builder</h2>
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

        {/* Visibility */}
        <Card title="Visibility">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={cfg.isPublished !== false} onChange={e => set({ isPublished: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground flex items-center gap-1.5">
              {cfg.isPublished !== false ? <><Eye className="w-4 h-4 text-emerald-600" /> Live (public)</> : <><EyeOff className="w-4 h-4 text-muted" /> Private</>}
            </span>
          </label>
          {publicUrl && cfg.isPublished !== false && (
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => navigator.clipboard.writeText(window.location.origin + publicUrl)}
                className="text-xs flex items-center gap-1 px-2 py-1 border border-border rounded-lg hover:bg-background"><Copy className="w-3 h-3" /> Copy link</button>
              <a href={publicUrl} target="_blank" rel="noreferrer"
                className="text-xs flex items-center gap-1 px-2 py-1 border border-border rounded-lg hover:bg-background"><ExternalLink className="w-3 h-3" /> Open</a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent((typeof window!=="undefined"?window.location.origin:"")+publicUrl)}`} target="_blank" rel="noreferrer"
                className="text-xs flex items-center gap-1 px-2 py-1 border border-border rounded-lg hover:bg-background text-primary">Share</a>
            </div>
          )}
        </Card>

        {/* Theme */}
        <Card title="Theme">
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => set({ themeId: t.id })}
                className={`text-left rounded-lg p-2.5 border transition-all ${cfg.themeId === t.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-border-strong"}`}>
                <div className="h-10 rounded-md mb-1.5 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.palette.accent}, ${t.palette.accent2})` }} />
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                {t.supports3d && <span className="text-[9px] text-primary flex items-center gap-0.5 mt-0.5"><Box className="w-2.5 h-2.5" /> 3D</span>}
              </button>
            ))}
          </div>
        </Card>

        {/* 3D heavy render toggle */}
        <Card title="Rendering">
          <label className={`flex items-start gap-2.5 ${activeTheme.supports3d ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
            <input type="checkbox" disabled={!activeTheme.supports3d}
              checked={!!cfg.heavy3d && activeTheme.supports3d}
              onChange={e => set({ heavy3d: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded border-border text-primary" />
            <div>
              <span className="text-sm font-medium text-foreground flex items-center gap-1.5"><Box className="w-4 h-4" /> 3D heavy render (three.js)</span>
              <p className="text-xs text-muted mt-0.5">
                {activeTheme.supports3d
                  ? "Loads a real-time three.js background. Heavier on low-end devices; the three.js code loads only when this is on."
                  : "This theme has no 3D variant. Pick a theme marked 3D to enable."}
              </p>
            </div>
          </label>
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
          <Field label="Accent color (optional)">
            <input type="text" value={cfg.accent || ""} onChange={e => set({ accent: e.target.value })} placeholder={activeTheme.palette.accent} className={inp} />
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
            {previewData && <PortfolioRenderer key={cfg.themeId + cfg.heavy3d} data={previewData} />}
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
