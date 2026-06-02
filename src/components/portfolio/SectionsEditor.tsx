"use client";

import { useState } from "react";
import {
  ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff, GripVertical, X, Pencil,
} from "lucide-react";
import {
  SECTION_TYPES, newSection, type PortfolioSection, type SectionType,
} from "./sections";

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

  const list = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const commit = (next: PortfolioSection[]) =>
    onChange(next.map((s, i) => ({ ...s, order: i })));

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
  const add = (type: SectionType) => {
    setAdding(false);
    const s = newSection(type, list.length);
    commit([...list, s]);
    setEditing(s.id);
  };

  return (
    <div className="space-y-2">
      {list.map((s) => {
        const meta = SECTION_TYPES.find((t) => t.type === s.type);
        const open = editing === s.id;
        return (
          <div key={s.id} className="border border-border rounded-lg bg-background overflow-hidden">
            {/* row */}
            <div className="flex items-center gap-1.5 px-2 py-2">
              <GripVertical className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-sm">{meta?.icon}</span>
              <button onClick={() => setEditing(open ? null : s.id)} className="flex-1 text-left min-w-0">
                <span className={`text-sm font-medium truncate ${s.enabled ? "text-foreground" : "text-muted line-through"}`}>{s.title || meta?.label}</span>
                <span className="text-[10px] text-muted ml-1.5">{meta?.label}</span>
              </button>
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => move(s.id, -1)} className="p-1 text-muted hover:text-foreground"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(s.id, 1)} className="p-1 text-muted hover:text-foreground"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => update(s.id, { enabled: !s.enabled })} className="p-1 text-muted hover:text-foreground" title={s.enabled ? "Hide" : "Show"}>
                  {s.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setEditing(open ? null : s.id)} className={`p-1 ${open ? "text-primary" : "text-muted hover:text-foreground"}`}><Pencil className="w-3.5 h-3.5" /></button>
                {s.type !== "hero" && <button onClick={() => remove(s.id)} className="p-1 text-muted hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>

            {/* editor */}
            {open && (
              <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border">
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
        <div className="border border-border rounded-lg p-2 bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Add a section</span>
            <button onClick={() => setAdding(false)} className="text-muted hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SECTION_TYPES.filter((t) => !t.unique || !list.some((s) => s.type === t.type)).map((t) => (
              <button key={t.type} onClick={() => add(t.type)}
                className="flex items-start gap-2 px-2 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-left">
                <span>{t.icon}</span>
                <span><span className="block text-xs font-semibold text-foreground">{t.label}</span><span className="block text-[10px] text-muted">{t.desc}</span></span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-border text-sm font-medium text-primary hover:bg-primary/5">
          <Plus className="w-4 h-4" /> Add section
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
    case "custom":
      return <L label="Text (supports {{tokens}})"><textarea value={c.body || ""} onChange={(e) => set({ body: e.target.value })} rows={4} placeholder="Write here…" className={`${inp} resize-none`} /></L>;

    case "skills":
      return <ChipsEditor items={c.items || []} onChange={(items) => set({ items })} placeholder="Add a skill + Enter" hint="Leave empty to use skills from your profile." />;

    case "quote":
      return (<>
        <L label="Quote"><textarea value={c.text || ""} onChange={(e) => set({ text: e.target.value })} rows={2} className={`${inp} resize-none`} /></L>
        <L label="Author"><input value={c.author || ""} onChange={(e) => set({ author: e.target.value })} className={inp} /></L>
      </>);

    case "projects":
      return (<div className="space-y-1.5">
        <p className="text-[10px] text-muted">Pick projects to feature (none = your completed projects).</p>
        <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1">
          {available.length === 0 && <p className="text-xs text-muted">No projects yet.</p>}
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
      </div>);

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

/* chips (skills) */
function ChipsEditor({ items, onChange, placeholder, hint }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [val, setVal] = useState("");
  const addChip = () => { const v = val.trim(); if (v && !items.includes(v)) onChange([...items, v]); setVal(""); };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {it}<button onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(); } }}
        placeholder={placeholder} className={inp} />
      {hint && <p className="text-[10px] text-muted mt-1">{hint}</p>}
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
