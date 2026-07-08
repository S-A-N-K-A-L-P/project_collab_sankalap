"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import {
  Loader2, Save, Check, AlertCircle, History, Lock,
  CreditCard, Building2, Gauge, Award, FileText, Wallet, Shield, ToggleLeft,
} from "lucide-react";

/* Section registry — mirrors docs/config.md §2 */
const SECTIONS = [
  { id: "plans",         label: "Plans & Pricing",  icon: CreditCard },
  { id: "organizations", label: "Organizations",    icon: Building2 },
  { id: "capacity",      label: "Capacity",         icon: Gauge },
  { id: "reputation",    label: "Reputation",       icon: Award },
  { id: "proposals",     label: "Proposals",        icon: FileText },
  { id: "payments",      label: "Payments",         icon: Wallet },
  { id: "moderation",    label: "Moderation",       icon: Shield },
  { id: "features",      label: "Feature Flags",    icon: ToggleLeft },
  { id: "audit",         label: "Audit Log",        icon: History },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface AuditEntry {
  _id: string;
  version: number;
  section: string;
  changedByName: string;
  createdAt: string;
  oldValue: any;
  newValue: any;
}

/* ── Field renderers ──────────────────────────────────────────────
   The config is a nested JSON object. We render:
   - boolean → toggle
   - number  → number input
   - string  → text input
   - object  → nested fieldset (one level of visual nesting)
   - array   → JSON textarea (bands / badge lists are edited as JSON)     */

function FieldEditor({
  path, value, onChange, disabled,
}: {
  path: string; value: any;
  onChange: (path: string, v: any) => void;
  disabled: boolean;
}) {
  const label = path.split(".").pop() || path;

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between gap-3 py-2">
        <span className="text-sm text-foreground">{label}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(path, !value)}
          className={`relative w-10 h-[22px] rounded-full transition-colors ${
            value ? "bg-primary" : "bg-muted-strong"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${
            value ? "left-[20px]" : "left-0.5"
          }`} />
        </button>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label className="flex items-center justify-between gap-3 py-2">
        <span className="text-sm text-foreground">{label}</span>
        <input
          type="number"
          value={value}
          step="any"
          disabled={disabled}
          onChange={(e) => onChange(path, e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-32 px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground text-right focus:outline-none focus:border-primary disabled:opacity-50"
        />
      </label>
    );
  }

  if (typeof value === "string") {
    return (
      <label className="flex items-center justify-between gap-3 py-2">
        <span className="text-sm text-foreground shrink-0">{label}</span>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(path, e.target.value)}
          className="flex-1 max-w-64 px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
        />
      </label>
    );
  }

  if (Array.isArray(value)) {
    return <ArrayEditor path={path} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (value !== null && typeof value === "object") {
    return (
      <fieldset className="my-3 p-4 rounded-xl border border-border bg-background/50">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</legend>
        {Object.entries(value).map(([k, v]) => (
          <FieldEditor key={k} path={`${path}.${k}`} value={v} onChange={onChange} disabled={disabled} />
        ))}
      </fieldset>
    );
  }

  return null; // null values are left untouched
}

function ArrayEditor({
  path, value, onChange, disabled,
}: {
  path: string; value: any[];
  onChange: (path: string, v: any) => void;
  disabled: boolean;
}) {
  const label = path.split(".").pop() || path;
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  // Re-sync when parent value changes identity (e.g. after refetch)
  useEffect(() => { setText(JSON.stringify(value, null, 2)); setParseError(null); }, [value]);

  return (
    <div className="my-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label} <span className="normal-case font-normal">(JSON array)</span></p>
      <textarea
        value={text}
        rows={Math.min(12, text.split("\n").length + 1)}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            if (!Array.isArray(parsed)) { setParseError("Must be a JSON array"); return; }
            setParseError(null);
            onChange(path, parsed);
          } catch {
            setParseError("Invalid JSON — changes not applied");
          }
        }}
        className="w-full p-3 rounded-lg bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
      />
      {parseError && <p className="text-xs text-error mt-1">{parseError}</p>}
    </div>
  );
}

/* Immutable deep-set: "a.b.c" → new object */
function setDeep(obj: any, path: string[], v: any): any {
  if (path.length === 0) return v;
  const [head, ...rest] = path;
  return { ...obj, [head]: setDeep(obj?.[head] ?? {}, rest, v) };
}

export default function AdminConfigPage() {
  const [config, setConfig]   = useState<Record<string, any> | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [active, setActive]   = useState<SectionId>("plans");
  const [draft, setDraft]     = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [audit, setAudit]     = useState<AuditEntry[]>([]);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load config");
      }
      const data = await res.json();
      setConfig(data.config);
      setCanEdit(!!data.canEdit);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/config/audit");
      if (res.ok) {
        const data = await res.json();
        setAudit(data.entries || []);
      }
    } catch { /* audit list is best-effort */ }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);
  useEffect(() => { if (active === "audit") fetchAudit(); }, [active, fetchAudit]);

  // Reset the working draft whenever section or freshly-loaded config changes
  useEffect(() => {
    if (config && active !== "audit") {
      setDraft(JSON.parse(JSON.stringify(config[active] ?? {})));
      setSaved(false);
      setError(null);
    }
  }, [config, active]);

  const dirty = useMemo(() => {
    if (!config || !draft || active === "audit") return false;
    return JSON.stringify(config[active]) !== JSON.stringify(draft);
  }, [config, draft, active]);

  const handleFieldChange = (path: string, v: any) => {
    setDraft((prev) => setDeep(prev, path.split("."), v));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!draft || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/config/${active}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      setConfig(data.config);
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Platform Configuration</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Runtime knobs from <code className="font-mono">docs/config.md</code> — changes apply without redeploy
              {config?.version ? ` · v${config.version}` : ""}
            </p>
          </div>
          {!canEdit && !loading && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning-muted text-warning-text text-xs font-semibold">
              <Lock size={12} /> Read-only — master_admin required to edit
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-muted border border-error text-sm text-error-text flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : config && (
          <div className="flex gap-5 items-start">
            {/* Section tabs */}
            <nav className="w-52 shrink-0 space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    active === id
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted-bg hover:text-foreground"
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </nav>

            {/* Editor panel */}
            <div className="flex-1 min-w-0 rounded-2xl border border-border bg-card p-6">
              {active === "audit" ? (
                <div className="space-y-3">
                  <h2 className="font-bold text-foreground text-base mb-4">Change History</h2>
                  {audit.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No config changes recorded yet.</p>
                  ) : (
                    audit.map((e) => (
                      <details key={e._id} className="p-3 rounded-xl border border-border bg-background/50">
                        <summary className="cursor-pointer text-sm flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">v{e.version}</span>
                          <span className="font-semibold text-foreground">{e.section}</span>
                          <span className="text-muted-foreground text-xs">
                            {e.changedByName || "unknown"} · {new Date(e.createdAt).toLocaleString()}
                          </span>
                        </summary>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Before</p>
                            <pre className="p-2 rounded-lg bg-background border border-border text-[11px] font-mono overflow-x-auto max-h-48">{JSON.stringify(e.oldValue, null, 2)}</pre>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">After</p>
                            <pre className="p-2 rounded-lg bg-background border border-border text-[11px] font-mono overflow-x-auto max-h-48">{JSON.stringify(e.newValue, null, 2)}</pre>
                          </div>
                        </div>
                      </details>
                    ))
                  )}
                </div>
              ) : draft && (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <h2 className="font-bold text-foreground text-base">
                      {SECTIONS.find((s) => s.id === active)?.label}
                    </h2>
                    <div className="flex items-center gap-2">
                      {saved && !dirty && (
                        <span className="flex items-center gap-1 text-xs text-success font-semibold">
                          <Check size={13} /> Saved
                        </span>
                      )}
                      {canEdit && (
                        <button
                          onClick={handleSave}
                          disabled={!dirty || saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-primary-foreground text-xs font-bold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {saving ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
                          {saving ? "Saving…" : "Save Section"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-border/50">
                    {Object.entries(draft).map(([k, v]) => (
                      <FieldEditor key={k} path={k} value={v} onChange={handleFieldChange} disabled={!canEdit} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
