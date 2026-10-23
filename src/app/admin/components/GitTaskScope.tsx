"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, FileCode2, GitBranch, Loader2, Lock, Search, ShieldCheck, X, Check } from "lucide-react";

// ── Shared types ───────────────────────────────────────────────
export type LockMode = "advisory" | "strict" | "exclusive";

export interface TaskScope {
  baseBranch: string;
  targetBranch: string;
  fileLockMode: LockMode;
  assignedFiles: string[];
  allowedGlobs: string[];
  readOnlyFiles: string[];
}

export const EMPTY_SCOPE: TaskScope = {
  baseBranch: "main", targetBranch: "", fileLockMode: "strict",
  assignedFiles: [], allowedGlobs: [], readOnlyFiles: [],
};

export interface Collision {
  filePath: string;
  reason: "same-file" | "in-their-scope" | "in-your-scope";
  taskId: string;
  taskTitle: string;
  assignedTo: string;
  assignedToName: string;
  fileLockMode: string;
  blocking: boolean;
}

export interface VerificationGate {
  buildPassed?: boolean; testsPassed?: boolean; sastPassed?: boolean; contractsPassed?: boolean;
  buildStatus?: string; testsStatus?: string; sastStatus?: string; contractsStatus?: string;
  verifiedAt?: string;
}

const labelCls = "text-[10px] font-mono font-bold text-muted uppercase tracking-widest";
const inputCls = "w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-[12px] text-foreground outline-none focus:border-accent/50";

const toLines = (v: string[]) => v.join("\n");
const fromLines = (s: string) => Array.from(new Set(s.split(/\r?\n|,/).map((x) => x.replace(/\\/g, "/").trim()).filter(Boolean)));

// ── Project file tree (uploaded by Syncro Desktop) ─────────────
export function useProjectTree(projectId: string) {
  const [tree, setTree] = useState<{ fileTree: string[]; branches: string[]; defaultBranch: string; lastSyncAt: string | null } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    fetch(`/api/mobile/git/tree?projectId=${projectId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!alive) return;
        if (!r.ok) setError(d.error || "Could not load the file tree");
        else setTree({ fileTree: d.fileTree || [], branches: d.branches || ["main"], defaultBranch: d.defaultBranch || "main", lastSyncAt: d.lastSyncAt });
      })
      .catch((e) => alive && setError(String(e)));
    return () => { alive = false; };
  }, [projectId]);
  return { tree, error };
}

// ── Collision list ─────────────────────────────────────────────
const REASON_TEXT: Record<Collision["reason"], string> = {
  "same-file": "same file",
  "in-their-scope": "inside their glob scope",
  "in-your-scope": "their file is inside your glob",
};

export function CollisionList({ collisions }: { collisions: Collision[] }) {
  if (collisions.length === 0) return null;
  const blocking = collisions.filter((c) => c.blocking).length;
  return (
    <div className={`rounded-xl border p-3 space-y-2 ${blocking ? "border-red-500/30 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
      <p className={`text-[11px] font-bold flex items-center gap-2 ${blocking ? "text-red-400" : "text-yellow-400"}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        {blocking
          ? `${blocking} file(s) are already claimed by another member's active task`
          : `${collisions.length} overlap(s), advisory only — assignment is allowed`}
      </p>
      <div className="max-h-40 overflow-y-auto divide-y divide-border-subtle">
        {collisions.map((c, i) => (
          <div key={i} className="py-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
            <span className="font-mono text-foreground">{c.filePath}</span>
            <span className="text-muted">{REASON_TEXT[c.reason]}</span>
            <span className="text-muted">· {c.assignedToName} — “{c.taskTitle}”</span>
            <span className={`ml-auto text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${c.blocking ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
              {c.fileLockMode}{c.blocking ? " · blocks" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── File picker over the uploaded tree ─────────────────────────
function FilePicker({ files, onAdd }: { files: string[]; onAdd: (f: string) => void }) {
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return files.filter((f) => f.toLowerCase().includes(needle)).slice(0, 12);
  }, [q, files]);
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={files.length ? `Search ${files.length} tracked files…` : "No file tree uploaded yet"}
        disabled={!files.length} className={inputCls + " pl-8"} />
      {matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-subtle rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto">
          {matches.map((f) => (
            <button key={f} type="button" onClick={() => { onAdd(f); setQ(""); }}
              className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-foreground hover:bg-background">{f}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Scope fields (used in create form and editor) ──────────────
export function TaskScopeFields({ projectId, scope, onChange, assignedTo, excludeTaskId }: {
  projectId: string;
  scope: TaskScope;
  onChange: (s: TaskScope) => void;
  /** When set, collisions are checked live against other members' tasks. */
  assignedTo?: string;
  excludeTaskId?: string;
}) {
  const { tree, error } = useProjectTree(projectId);
  const [filesText, setFilesText] = useState(toLines(scope.assignedFiles));
  const [globsText, setGlobsText] = useState(toLines(scope.allowedGlobs));
  const [roText, setRoText] = useState(toLines(scope.readOnlyFiles));
  const [collisions, setCollisions] = useState<Collision[]>([]);
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (patch: Partial<TaskScope>) => onChange({ ...scope, ...patch });

  // Live collision check (dry run) whenever files, globs, lock mode or assignee change.
  useEffect(() => {
    if (!assignedTo || (scope.assignedFiles.length === 0 && scope.allowedGlobs.length === 0)) { setCollisions([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/admin/projects/${projectId}/tasks`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dryRun: true, assignedTo, assignedFiles: scope.assignedFiles, allowedGlobs: scope.allowedGlobs, fileLockMode: scope.fileLockMode }),
        });
        const d = await res.json();
        setCollisions((d.collisions || []).filter((c: Collision) => c.taskId !== excludeTaskId));
      } finally { setChecking(false); }
    }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [projectId, assignedTo, excludeTaskId, scope.assignedFiles, scope.allowedGlobs, scope.fileLockMode]);

  const addFile = (f: string) => {
    const next = Array.from(new Set([...scope.assignedFiles, f]));
    setFilesText(toLines(next)); set({ assignedFiles: next });
  };

  const branches = tree?.branches?.length ? tree.branches : ["main"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className={labelCls}><GitBranch className="w-3 h-3 inline mr-1" />Base branch</label>
          <select value={scope.baseBranch} onChange={(e) => set({ baseBranch: e.target.value })} className={inputCls}>
            {Array.from(new Set([scope.baseBranch, ...branches])).map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>Target branch</label>
          <input value={scope.targetBranch} onChange={(e) => set({ targetBranch: e.target.value })}
            placeholder="auto: task/<member>-<title>" className={inputCls + " font-mono"} />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}><Lock className="w-3 h-3 inline mr-1" />Lock mode</label>
          <select value={scope.fileLockMode} onChange={(e) => set({ fileLockMode: e.target.value as LockMode })} className={inputCls}>
            <option value="strict">Strict — overlaps block, out-of-scope commits blocked</option>
            <option value="exclusive">Exclusive — same as strict</option>
            <option value="advisory">Advisory — overlaps and out-of-scope only warn</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}><FileCode2 className="w-3 h-3 inline mr-1" />Assigned files (one per line)</label>
        <FilePicker files={tree?.fileTree || []} onAdd={addFile} />
        <textarea rows={3} value={filesText} onChange={(e) => setFilesText(e.target.value)}
          onBlur={() => set({ assignedFiles: fromLines(filesText) })}
          placeholder="src/app/api/payments/route.ts" className={inputCls + " font-mono resize-y"} />
        <p className="text-[10px] text-muted font-mono">
          {error ? `File tree unavailable: ${error}`
            : !tree ? "Loading file tree…"
            : tree.fileTree.length ? `${tree.fileTree.length} files from Syncro Desktop${tree.lastSyncAt ? `, synced ${new Date(tree.lastSyncAt).toLocaleString()}` : ""}`
            : "No file tree yet — a lead syncs it from Syncro Desktop (AI Tasks → Sync repo files). You can still type paths."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelCls}>Allowed globs (folders the member may change)</label>
          <textarea rows={2} value={globsText} onChange={(e) => setGlobsText(e.target.value)}
            onBlur={() => set({ allowedGlobs: fromLines(globsText) })}
            placeholder="src/app/api/payments/**" className={inputCls + " font-mono resize-y"} />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>Read-only reference files</label>
          <textarea rows={2} value={roText} onChange={(e) => setRoText(e.target.value)}
            onBlur={() => set({ readOnlyFiles: fromLines(roText) })}
            placeholder="src/models/User.ts" className={inputCls + " font-mono resize-y"} />
        </div>
      </div>

      {assignedTo && (
        <div className="space-y-2">
          {checking && <p className="text-[10px] font-mono text-muted flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Checking locks…</p>}
          {!checking && collisions.length === 0 && (scope.assignedFiles.length > 0 || scope.allowedGlobs.length > 0) && (
            <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5"><Check className="w-3 h-3" /> No overlap with other members&apos; active tasks</p>
          )}
          <CollisionList collisions={collisions} />
        </div>
      )}
    </div>
  );
}

// ── Gate chips (from Syncro Desktop "Verify & Complete") ───────
function gateState(status?: string, passed?: boolean): { text: string; cls: string } {
  if (status) {
    if (status.startsWith("passed")) return { text: status, cls: "bg-emerald-500/10 text-emerald-400" };
    if (status.startsWith("failed")) return { text: status, cls: "bg-red-500/10 text-red-400" };
    return { text: status, cls: "bg-zinc-500/10 text-zinc-400" };
  }
  // Older records only have booleans: true is a pass, false can't be told apart from "never run".
  return passed ? { text: "passed", cls: "bg-emerald-500/10 text-emerald-400" } : { text: "not verified", cls: "bg-zinc-500/10 text-zinc-400" };
}

export function GateChips({ gate }: { gate?: VerificationGate }) {
  const items: [string, string | undefined, boolean | undefined][] = [
    ["Build", gate?.buildStatus, gate?.buildPassed],
    ["Tests", gate?.testsStatus, gate?.testsPassed],
    ["SAST", gate?.sastStatus, gate?.sastPassed],
    ["Contracts", gate?.contractsStatus, gate?.contractsPassed],
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ShieldCheck className="w-3 h-3 text-muted" />
      {items.map(([name, status, passed]) => {
        const s = gateState(status, passed);
        return <span key={name} title={s.text} className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${s.cls}`}>{name}: {s.text.split(":")[0]}</span>;
      })}
      {gate?.verifiedAt && <span className="text-[9px] font-mono text-muted">· {new Date(gate.verifiedAt).toLocaleString()}</span>}
    </div>
  );
}

// ── Inline scope editor for an existing task ───────────────────
export function TaskScopeEditor({ projectId, task, onSaved, onCancel }: {
  projectId: string;
  task: { _id: string; assignedTo: string } & Partial<TaskScope>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [scope, setScope] = useState<TaskScope>({
    baseBranch: task.baseBranch || "main",
    targetBranch: task.targetBranch || "",
    fileLockMode: (task.fileLockMode as LockMode) || "strict",
    assignedFiles: task.assignedFiles || [],
    allowedGlobs: task.allowedGlobs || [],
    readOnlyFiles: task.readOnlyFiles || [],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [blocked, setBlocked] = useState<Collision[]>([]);

  const save = async (force = false) => {
    setSaving(true); setErr(""); setBlocked([]);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks/${task._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scope, forceAssign: force }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.status === 409) { setBlocked(d.collisions || []); setErr(d.error || "Lock conflict"); return; }
      if (!res.ok) { setErr(d.error || "Save failed"); return; }
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div className="w-full mt-2 p-4 rounded-xl border border-accent/20 bg-background space-y-3">
      <TaskScopeFields projectId={projectId} scope={scope} onChange={setScope} assignedTo={task.assignedTo} excludeTaskId={task._id} />
      {err && <p className="text-[11px] text-red-400 font-medium">{err}</p>}
      {blocked.length > 0 && <CollisionList collisions={blocked} />}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-muted hover:text-foreground">Cancel</button>
        {blocked.some((c) => c.blocking) && (
          <button disabled={saving} onClick={() => save(true)} className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
            Force assign anyway
          </button>
        )}
        <button disabled={saving} onClick={() => save(false)} className="px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-accent text-white hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save scope
        </button>
      </div>
    </div>
  );
}

// ── Roster editor: project role, owned paths, task limit ───────
const PROJECT_ROLES = ["lead", "architect", "backend", "frontend", "mobile", "sre", "qa", "contributor"];

interface RosterMember {
  userId: string; name: string; email: string; isLead: boolean;
  projectRole: string; ownedPaths: string[]; maxActiveTasks: number;
  activeTaskCount: number; completedTaskCount: number; lockedFiles: string[];
}

export function RosterEditor({ projectId, refreshKey }: { projectId: string; refreshKey?: number }) {
  const [members, setMembers] = useState<RosterMember[] | null>(null);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { projectRole: string; ownedPaths: string; maxActiveTasks: number }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(`/api/mobile/projects/${projectId}/team`);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error || "Could not load roster"); return; }
    const list: RosterMember[] = d.members || [];
    setMembers(list);
    setDrafts(Object.fromEntries(list.map((m) => [m.userId, { projectRole: m.projectRole, ownedPaths: m.ownedPaths.join("\n"), maxActiveTasks: m.maxActiveTasks }])));
  }, [projectId]);
  useEffect(() => { load(); }, [load, refreshKey]);

  const save = async (m: RosterMember) => {
    const d = drafts[m.userId];
    setSaving(m.userId); setError("");
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/team`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberUpdates: [{ userId: m.userId, projectRole: m.isLead ? undefined : d.projectRole, ownedPaths: fromLines(d.ownedPaths), maxActiveTasks: Number(d.maxActiveTasks) }] }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setError(body.error || "Save failed"); return; }
      setSavedId(m.userId); setTimeout(() => setSavedId(null), 1500);
      await load();
    } finally { setSaving(null); }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <p className={labelCls}>Roles &amp; file ownership</p>
        <p className="text-[11px] text-muted mt-1">Owned paths are suggested as allowed globs when you assign this member a task. Syncro Desktop shows the same roster.</p>
      </div>
      {error && <p className="px-5 pt-3 text-[11px] text-red-400">{error}</p>}
      {!members ? (
        <div className="px-5 py-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-accent" /></div>
      ) : members.length === 0 ? (
        <p className="px-5 py-8 text-[12px] text-muted text-center">No members yet.</p>
      ) : (
        <div className="divide-y divide-border-subtle">
          {members.map((m) => {
            const d = drafts[m.userId] || { projectRole: m.projectRole, ownedPaths: "", maxActiveTasks: 5 };
            const set = (patch: Partial<typeof d>) => setDrafts((all) => ({ ...all, [m.userId]: { ...d, ...patch } }));
            return (
              <div key={m.userId} className="px-5 py-4 grid grid-cols-1 lg:grid-cols-[200px_150px_1fr_90px_auto] gap-3 items-start">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{m.name}{m.isLead && <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent uppercase">Lead</span>}</p>
                  <p className="text-[10px] text-muted font-mono">{m.activeTaskCount} active · {m.completedTaskCount} done · {m.lockedFiles.length} locked files</p>
                </div>
                <select value={m.isLead ? "lead" : d.projectRole} disabled={m.isLead} onChange={(e) => set({ projectRole: e.target.value })} className={inputCls}>
                  {PROJECT_ROLES.filter((r) => m.isLead || r !== "lead").map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea rows={2} value={d.ownedPaths} onChange={(e) => set({ ownedPaths: e.target.value })} placeholder="src/app/api/payments/**" className={inputCls + " font-mono resize-y"} />
                <input type="number" min={1} max={50} value={d.maxActiveTasks} onChange={(e) => set({ maxActiveTasks: Number(e.target.value) })} title="Max active tasks" className={inputCls} />
                <button disabled={saving === m.userId} onClick={() => save(m)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${savedId === m.userId ? "bg-emerald-500/20 text-emerald-400" : "bg-accent/10 text-accent hover:bg-accent/20"} disabled:opacity-50`}>
                  {saving === m.userId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedId === m.userId ? <Check className="w-3.5 h-3.5" /> : null}
                  {savedId === m.userId ? "Saved" : "Save"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ScopeSummary({ task }: { task: Partial<TaskScope> & { pullRequestUrl?: string; latestCommitSha?: string } }) {
  const files = task.assignedFiles?.length || 0;
  const globs = task.allowedGlobs?.length || 0;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted">
      {task.targetBranch && <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{task.baseBranch || "main"} ← {task.targetBranch}</span>}
      <span>{files} file{files === 1 ? "" : "s"}{globs ? ` + ${globs} glob${globs === 1 ? "" : "s"}` : ""}</span>
      {task.fileLockMode && <span className="uppercase">{task.fileLockMode}</span>}
      {task.latestCommitSha && <span>@{task.latestCommitSha.slice(0, 7)}</span>}
      {task.pullRequestUrl && <a href={task.pullRequestUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">PR ↗</a>}
      {files === 0 && globs === 0 && <span className="flex items-center gap-1 text-yellow-400"><X className="w-3 h-3" />no file scope</span>}
    </div>
  );
}
