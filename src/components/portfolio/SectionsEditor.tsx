"use client";

import { useState } from "react";
import {
  ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff, GripVertical, X, Pencil, Check,
} from "lucide-react";
import {
  SECTION_TYPES, newSection, STARTER_TEMPLATES, sectionsFromTypes,
  type PortfolioSection, type SectionType,
} from "./sections";
import { TECH_LOGOS, logoFor } from "./techLogos";

const inp = "w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function SectionsEditor({
  sections,
  available,
  onChange,
}: {
  sections: PortfolioSection[];
  available: { _id: string; title: string; status?: string }[];
  onChange: (next: PortfolioSection[]) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<SectionType[]>([]);

  // drag & drop reorder state. `dragHandle` gates draggability so a drag can
  // only start from the grip (keeps text selection in the editor inputs sane).
  const [dragHandle, setDragHandle] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const list = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const commit = (next: PortfolioSection[]) =>
    onChange(next.map((s, i) => ({ ...s, order: i })));

  // Move `fromId` so it lands relative to the row it was dropped on.
  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = list.findIndex((s) => s.id === fromId);
    const to = list.findIndex((s) => s.id === toId);
    if (from < 0 || to < 0) return;
    const next = list.filter((s) => s.id !== fromId);
    const at = next.findIndex((s) => s.id === toId);
    next.splice(from < to ? at + 1 : at, 0, list[from]);
    commit(next);
  };
  const endDrag = () => { setDragId(null); setOverId(null); setDragHandle(false); };

  const update = (id: string, patch: Partial<PortfolioSection>) =>
    commit(list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const updateContent = (id: string, patch: any) =>
    commit(list.map((s) => (s.id === id ? { ...s, content: { ...s.content, ...patch } } : s)));

  const move = (id: string, dir: -1 | 1) => {
    const idx = list.findIndex((s) => s.id === id);
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[idx], next[j]] = [next[j], next[idx]];
    commit(next);
  };
  const remove = (id: string) => commit(list.filter((s) => s.id !== id));
  const addMany = (types: SectionType[]) => {
    if (!types.length) return;
    const start = list.length;
    const added = types.map((t, i) => newSection(t, start + i));
    commit([...list, ...added]);
    setAdding(false); setPicked([]);
    if (added.length === 1) setEditing(added[0].id);
  };
  const applyTemplate = (types: SectionType[]) => {
    if (!confirm("Replace all current sections with this template? Your section content will be reset.")) return;
    commit(sectionsFromTypes(types));
    setAdding(false); setPicked([]);
  };
  const togglePick = (t: SectionType) => setPicked((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  return (
    <div className="space-y-2.5">
      {list.map((s) => {
        const meta = SECTION_TYPES.find((t) => t.type === s.type);
        const open = editing === s.id;
        return (
          <div
            key={s.id}
            draggable={dragHandle}
            onDragStart={(e) => { setDragId(s.id); e.dataTransfer.effectAllowed = "move"; }}
            onDragEnd={endDrag}
            onDragOver={(e) => { if (dragId) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (overId !== s.id) setOverId(s.id); } }}
            onDragLeave={() => setOverId((o) => (o === s.id ? null : o))}
            onDrop={(e) => { e.preventDefault(); if (dragId) reorder(dragId, s.id); endDrag(); }}
            className={`rounded-xl border bg-background overflow-hidden transition-all ${
              dragId === s.id ? "opacity-40" : ""
            } ${
              overId === s.id && dragId && dragId !== s.id ? "border-primary ring-2 ring-primary/30"
              : open ? "border-primary/50 shadow-sm"
              : "border-border hover:border-border-strong hover:shadow-sm"
            }`}
          >
            {/* row */}
            <div className="flex items-center gap-2 px-2.5 py-2.5">
              <button
                type="button"
                onMouseDown={() => setDragHandle(true)}
                onMouseUp={() => setDragHandle(false)}
                onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); move(s.id, -1); } else if (e.key === "ArrowDown") { e.preventDefault(); move(s.id, 1); } }}
                aria-label="Drag to reorder (or use arrow keys)"
                title="Drag to reorder"
                className="shrink-0 flex items-center justify-center text-muted/50 hover:text-muted cursor-grab active:cursor-grabbing rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <GripVertical className="w-4 h-4" aria-hidden />
              </button>
              <span className="text-base leading-none shrink-0">{meta?.icon}</span>
              <button onClick={() => setEditing(open ? null : s.id)} className="flex-1 text-left min-w-0 flex items-baseline gap-1.5">
                <span className={`text-sm font-semibold truncate ${s.enabled ? "text-foreground" : "text-muted line-through"}`}>{s.title || meta?.label}</span>
                <span className="text-[11px] text-muted shrink-0">{meta?.label}</span>
              </button>
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => move(s.id, -1)} title="Move up" className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-card hover:text-foreground transition-colors"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(s.id, 1)} title="Move down" className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-card hover:text-foreground transition-colors"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => update(s.id, { enabled: !s.enabled })} className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-card hover:text-foreground transition-colors" title={s.enabled ? "Hide" : "Show"}>
                  {s.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(open ? null : s.id)} title="Edit" className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${open ? "text-primary bg-primary/10" : "text-muted hover:bg-card hover:text-foreground"}`}><Pencil className="w-4 h-4" /></button>
                {s.type !== "hero" && <button onClick={() => remove(s.id)} title="Delete" className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>

            {/* editor */}
            {open && (
              <div className="px-3 pb-3 pt-3 space-y-2 border-t border-border bg-card">
                {s.type !== "hero" && (
                  <L label="Section title"><input value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} className={inp} /></L>
                )}
                <SectionFields s={s} available={available} updateContent={updateContent} />
              </div>
            )}
          </div>
        );
      })}

      {/* add */}
      {adding ? (
        <div className="border border-border rounded-lg p-2.5 bg-background space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Add sections</span>
            <button onClick={() => { setAdding(false); setPicked([]); }} className="text-muted hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>

          {/* starter templates */}
          <div>
            <p className="text-[10px] font-medium text-muted mb-1">Start from a template (replaces all):</p>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_TEMPLATES.map((tpl) => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl.types)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-foreground">{tpl.label}</button>
              ))}
            </div>
          </div>

          {/* multi-select grid */}
          <div>
            <p className="text-[10px] font-medium text-muted mb-1">Or tick types to add:</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto scrollbar-thin">
              {SECTION_TYPES.filter((t) => !t.unique || !list.some((s) => s.type === t.type)).map((t) => {
                const on = picked.includes(t.type);
                return (
                  <button key={t.type} onClick={() => togglePick(t.type)}
                    className={`flex items-start gap-2 px-2 py-2 rounded-lg border text-left transition-colors ${on ? "border-primary bg-primary/10" : "border-border hover:border-border-strong"}`}>
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${on ? "bg-primary border-primary" : "border-border"}`}>{on && <Check className="w-2.5 h-2.5 text-white" />}</span>
                    <span><span className="block text-xs font-semibold text-foreground">{t.icon} {t.label}</span><span className="block text-[10px] text-muted">{t.desc}</span></span>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => addMany(picked)} disabled={!picked.length}
            className="w-full px-3 py-2 rounded-lg bg-primary disabled:opacity-40 text-white text-sm font-semibold">
            Add {picked.length || ""} selected
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border border-dashed border-border-strong text-sm font-semibold text-primary hover:bg-primary/5 hover:border-primary transition-colors">
          <Plus className="w-4 h-4" /> Add section(s)
        </button>
      )}
    </div>
  );
}

/* ── Per-type field editors ──────────────────────────────────────────── */
function SectionFields({ s, available, updateContent }: { s: PortfolioSection; available: any[]; updateContent: (id: string, patch: any) => void }) {
  const c = s.content || {};
  const set = (patch: any) => updateContent(s.id, patch);

  switch (s.type) {
    case "hero":
      return (<>
        <L label="Headline (supports {{tokens}})"><input value={c.headline || ""} onChange={(e) => set({ headline: e.target.value })} placeholder="e.g. I build {{skills}}" className={inp} /></L>
        <L label="Tagline"><input value={c.tagline || ""} onChange={(e) => set({ tagline: e.target.value })} placeholder="Full-stack · AI" className={inp} /></L>
        <p className="text-[10px] text-muted">Name, avatar &amp; location come from your profile.</p>
      </>);

    case "about":
      return <L label="Text (supports {{tokens}})"><textarea value={c.body || ""} onChange={(e) => set({ body: e.target.value })} rows={4} placeholder="Write here…" className={`${inp} resize-none`} /></L>;

    case "custom":
      return (<>
        <L label="Text (supports {{tokens}})"><textarea value={c.body || ""} onChange={(e) => set({ body: e.target.value })} rows={4} placeholder="Write here…" className={`${inp} resize-none`} /></L>
        <L label="Image URL (optional)"><input value={c.image || ""} onChange={(e) => set({ image: e.target.value })} placeholder="https://…" className={inp} /></L>
      </>);

    case "skills":
      return <SkillsEditor items={c.items || []} onChange={(items) => set({ items })} />;

    case "quote":
      return (<>
        <L label="Quote"><textarea value={c.text || ""} onChange={(e) => set({ text: e.target.value })} rows={2} className={`${inp} resize-none`} /></L>
        <L label="Author"><input value={c.author || ""} onChange={(e) => set({ author: e.target.value })} className={inp} /></L>
      </>);

    case "projects":
      return (<div className="space-y-3">
        <div>
          <p className="text-[10px] font-medium text-muted mb-1">From your platform projects:</p>
          <div className="max-h-36 overflow-y-auto scrollbar-thin space-y-1">
            {available.length === 0 && <p className="text-xs text-muted">No platform projects yet — add manual ones below.</p>}
            {available.map((p) => {
              const on = (c.ids || []).includes(p._id);
              return (
                <button key={p._id} onClick={() => set({ ids: on ? (c.ids || []).filter((x: string) => x !== p._id) : [...(c.ids || []), p._id] })}
                  className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg border text-sm ${on ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted hover:bg-background"}`}>
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${on ? "bg-primary border-primary" : "border-border"}`}>{on && <span className="text-white text-[8px]">✓</span>}</span>
                  <span className="truncate">{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-medium text-muted mb-1">Manual projects (any project, even off-platform):</p>
          <ListEditor items={c.manual || []} onChange={(manual) => set({ manual })} fields={[
            { key: "title", label: "Title" }, { key: "description", label: "Description", area: true },
            { key: "image", label: "Cover image URL" }, { key: "live", label: "Live URL" },
            { key: "repo", label: "Repo URL" }, { key: "tags", label: "Tags (comma-separated)" },
          ]} empty={{ title: "", description: "", image: "", live: "", repo: "", tags: "" }} addLabel="Add manual project" />
        </div>
      </div>);

    case "certifications":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "name", label: "Certificate name" }, { key: "issuer", label: "Issuer" },
        { key: "date", label: "Date" }, { key: "url", label: "Credential URL" }, { key: "image", label: "Badge image URL" },
      ]} empty={{ name: "", issuer: "", date: "", url: "", image: "" }} addLabel="Add certification" />;

    case "affiliated_orgs":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "name", label: "Organization" }, { key: "role", label: "Your role" },
        { key: "period", label: "Period" }, { key: "url", label: "URL" }, { key: "logo", label: "Logo URL" },
      ]} empty={{ name: "", role: "", period: "", url: "", logo: "" }} addLabel="Add organization" />;

    case "links":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "icon", label: "Icon", select: ["github", "linkedin", "twitter", "mail", "globe", "link"] },
        { key: "label", label: "Label" }, { key: "url", label: "URL" },
      ]} empty={{ icon: "link", label: "", url: "" }} addLabel="Add link" />;

    case "timeline":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "date", label: "Date" }, { key: "title", label: "Title" }, { key: "description", label: "Description", area: true },
      ]} empty={{ date: "", title: "", description: "" }} addLabel="Add milestone" />;

    case "testimonials":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "quote", label: "Quote", area: true }, { key: "person", label: "Person" },
        { key: "role", label: "Role" }, { key: "avatar", label: "Avatar URL" },
      ]} empty={{ quote: "", person: "", role: "", avatar: "" }} addLabel="Add testimonial" />;

    case "experience":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "role", label: "Role" }, { key: "org", label: "Organisation" },
        { key: "start", label: "Start" }, { key: "end", label: "End" }, { key: "summary", label: "Summary", area: true },
      ]} empty={{ role: "", org: "", start: "", end: "", summary: "" }} addLabel="Add role" />;

    case "education":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "degree", label: "Degree" }, { key: "school", label: "School" },
        { key: "start", label: "Start" }, { key: "end", label: "End" },
      ]} empty={{ degree: "", school: "", start: "", end: "" }} addLabel="Add education" />;

    case "gallery":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "url", label: "Image URL" }, { key: "caption", label: "Caption" },
      ]} empty={{ url: "", caption: "" }} addLabel="Add image" />;

    case "stats":
      return <ListEditor items={c.items || []} onChange={(items) => set({ items })} fields={[
        { key: "value", label: "Value (supports {{tokens}})" }, { key: "label", label: "Label" },
      ]} empty={{ value: "", label: "" }} addLabel="Add stat" />;

    case "contact":
      return <ListEditor items={c.links || []} onChange={(links) => set({ links })} fields={[
        { key: "icon", label: "Icon", select: ["github", "linkedin", "twitter", "mail", "globe", "link"] },
        { key: "label", label: "Label" }, { key: "url", label: "URL" },
      ]} empty={{ icon: "link", label: "", url: "" }} addLabel="Add link" />;

    default:
      return null;
  }
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[11px] font-medium text-muted mb-1">{label}</label>{children}</div>;
}

/* Skills editor: chips (with logos) + tech-logo picker + optional proficiency */
type Skill = { name: string; level?: number };
function SkillsEditor({ items, onChange }: { items: any[]; onChange: (v: any[]) => void }) {
  const norm: Skill[] = (items || []).map((s) => (typeof s === "string" ? { name: s } : { name: s.name, level: s.level }));
  const [val, setVal] = useState("");
  const [showLevels, setShowLevels] = useState(norm.some((s) => typeof s.level === "number" && (s.level as number) > 0));

  const nameOf = (s: Skill) => s.name;
  const has = (name: string) => norm.some((s) => s.name.toLowerCase() === name.toLowerCase());
  const add = (name: string) => { const v = name.trim(); if (v && !has(v)) onChange([...norm, { name: v, level: showLevels ? 50 : 0 }]); };
  const remove = (i: number) => onChange(norm.filter((_, j) => j !== i));
  const setLevel = (i: number, level: number) => onChange(norm.map((s, j) => (j === i ? { ...s, level } : s)));

  return (
    <div className="space-y-2">
      {/* proficiency toggle */}
      <label className="flex items-center gap-2 text-[11px] text-muted cursor-pointer">
        <input type="checkbox" checked={showLevels} onChange={(e) => setShowLevels(e.target.checked)} className="w-3.5 h-3.5 rounded border-border text-primary" />
        Show proficiency bars
      </label>

      {/* current skills */}
      {showLevels ? (
        <div className="space-y-1.5">
          {norm.map((s, i) => {
            const logo = logoFor(s.name);
            return (
              <div key={i} className="flex items-center gap-2">
                {logo && <img src={logo} alt="" className="w-4 h-4 object-contain rounded-sm bg-white/70 p-0.5 shrink-0" />}
                <span className="text-xs text-foreground w-24 truncate shrink-0">{s.name}</span>
                <input type="range" min={0} max={100} value={s.level ?? 50} onChange={(e) => setLevel(i, Number(e.target.value))} className="flex-1 accent-primary" />
                <span className="text-[10px] text-muted w-8 text-right">{s.level ?? 50}%</span>
                <button onClick={() => remove(i)} className="text-muted hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {norm.map((s, i) => {
            const logo = logoFor(s.name);
            return (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary pl-1.5 pr-2 py-1 rounded-full">
                {logo && <img src={logo} alt="" className="w-4 h-4 object-contain rounded-sm bg-white/70 p-0.5" />}
                {s.name}
                <button onClick={() => remove(i)}><X className="w-3 h-3" /></button>
              </span>
            );
          })}
          {norm.length === 0 && <span className="text-[10px] text-muted">Empty = use skills from your profile.</span>}
        </div>
      )}

      {/* manual add */}
      <input value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(val); setVal(""); } }}
        placeholder="Type a skill + Enter" className={inp} />

      {/* tech logo picker */}
      <div>
        <p className="text-[10px] font-medium text-muted mb-1">Or click a tech logo to add:</p>
        <div className="grid grid-cols-5 gap-1.5 max-h-44 overflow-y-auto scrollbar-thin">
          {TECH_LOGOS.map((t) => {
            const on = has(t.name);
            return (
              <button key={t.name} title={t.name}
                onClick={() => on ? onChange(norm.filter((s) => s.name.toLowerCase() !== t.name.toLowerCase())) : add(t.name)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${on ? "border-primary bg-primary/10" : "border-border hover:border-border-strong hover:bg-background"}`}>
                <img src={t.file} alt={t.name} className="w-7 h-7 object-contain" />
                <span className="text-[8px] text-muted truncate w-full text-center leading-none">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* repeating list editor */
function ListEditor({ items, onChange, fields, empty, addLabel }: {
  items: any[]; onChange: (v: any[]) => void;
  fields: { key: string; label: string; area?: boolean; select?: string[] }[];
  empty: any; addLabel: string;
}) {
  const upd = (i: number, k: string, v: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="border border-border rounded-lg p-2 space-y-1.5 relative bg-card">
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 text-muted hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          {fields.map((f) => (
            <div key={f.key} className="pr-6">
              <label className="block text-[10px] text-muted mb-0.5">{f.label}</label>
              {f.select
                ? <select value={it[f.key] || f.select[0]} onChange={(e) => upd(i, f.key, e.target.value)} className={inp}>{f.select.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                : f.area
                  ? <textarea value={it[f.key] || ""} onChange={(e) => upd(i, f.key, e.target.value)} rows={2} className={`${inp} resize-none`} />
                  : <input value={it[f.key] || ""} onChange={(e) => upd(i, f.key, e.target.value)} className={inp} />}
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => onChange([...items, { ...empty }])} className="text-xs font-medium text-primary flex items-center gap-1"><Plus className="w-3 h-3" /> {addLabel}</button>
    </div>
  );
}
