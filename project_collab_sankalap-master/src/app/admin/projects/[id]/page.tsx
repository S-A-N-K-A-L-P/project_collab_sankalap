"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/app/admin/components/AdminShell";
import StatusBadge from "@/app/admin/components/StatusBadge";
import {
  ArrowLeft, Loader2, Check, X, Plus, Trash2, UserPlus,
  Github, ShieldCheck, CalendarDays, AlertCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface Member { _id: string; name: string; email: string; avatar?: string; role: string; skills?: string[] }
interface Task {
  _id: string; title: string; description: string;
  assignedTo: string; assignedToName: string;
  status: "pending"|"in-progress"|"completed"|"delayed";
  priority: "low"|"medium"|"high"; progress: number; deadline: string;
}
interface Project {
  _id: string; title: string; description?: string;
  status: string; progress: number; githubRepo?: string;
  techStack: string[]; lead?: Member; members: Member[];
  orgId?: { name: string }; proposalId?: { _id: string; title: string };
  verifiedBy?: Member; createdAt: string;
}

// ── Small helpers ──────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  high:   "bg-red-500/10 text-red-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  low:    "bg-zinc-500/10 text-zinc-400",
};
const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-yellow-500/10 text-yellow-400",
  "in-progress":"bg-blue-500/10 text-blue-400",
  completed:   "bg-emerald-500/10 text-emerald-400",
  delayed:     "bg-red-500/10 text-red-400",
};
function Chip({ label, color }: { label: string; color: string }) {
  return <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${color}`}>{label}</span>;
}
function MemberAvatar({ m, size = "sm" }: { m: Member; size?: "sm"|"md" }) {
  const dim = size === "md" ? "w-9 h-9 text-[12px]" : "w-7 h-7 text-[10px]";
  return (
    <div className={`${dim} rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0 overflow-hidden`}>
      {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : m.name[0].toUpperCase()}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function AdminProjectDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const [project, setProject]   = useState<Project | null>(null);
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"overview"|"team"|"tasks">("overview");

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/projects/${id}`);
      const data = await res.json();
      setProject(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTasks = useCallback(async () => {
    const res  = await fetch(`/api/admin/projects/${id}/tasks`);
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }, [id]);

  useEffect(() => { loadProject(); }, [loadProject]);
  useEffect(() => { if (tab === "tasks") loadTasks(); }, [tab, loadTasks]);

  if (loading) return (
    <AdminShell>
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    </AdminShell>
  );
  if (!project) return (
    <AdminShell><div className="text-center py-16 text-muted">Project not found.</div></AdminShell>
  );

  return (
    <AdminShell>
      <div className="space-y-6 max-w-[1200px]">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/admin/projects"
            className="p-2 rounded-xl border border-border-subtle text-muted hover:text-foreground hover:border-border-strong transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[11px] font-mono text-muted uppercase tracking-widest">
            Projects / {project._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Header */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <StatusBadge value={project.status} size="md" />
                {project.orgId && <span className="text-[11px] text-muted font-mono">{project.orgId.name}</span>}
                {project.verifiedBy && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> verified by {project.verifiedBy.name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[28px] font-black text-accent leading-none">{project.progress}%</p>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest">Complete</p>
            </div>
          </div>
          {project.description && (
            <p className="text-[13px] text-muted mt-3 leading-relaxed">{project.description}</p>
          )}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.techStack.map((t) => (
                <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-accent/10 text-accent">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-subtle pb-0">
          {(["overview", "team", "tasks"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 -mb-px ${
                tab === t
                  ? "text-accent border-accent bg-accent/5"
                  : "text-muted border-transparent hover:text-foreground"
              }`}
            >
              {t}
              {t === "team"  && <span className="ml-1.5 text-[10px] font-mono">({project.members.length})</span>}
              {t === "tasks" && tasks.length > 0 && <span className="ml-1.5 text-[10px] font-mono">({tasks.length})</span>}
            </button>
          ))}
        </div>

        {/* ── Overview tab ─────────────────────────────────────────── */}
        {tab === "overview" && (
          <OverviewTab project={project} onRefresh={loadProject} />
        )}

        {/* ── Team tab ─────────────────────────────────────────────── */}
        {tab === "team" && (
          <TeamTab project={project} onRefresh={loadProject} />
        )}

        {/* ── Tasks tab ────────────────────────────────────────────── */}
        {tab === "tasks" && (
          <TasksTab projectId={id} members={project.members} tasks={tasks} onRefresh={loadTasks} />
        )}
      </div>
    </AdminShell>
  );
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════
function OverviewTab({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [status, setStatus]       = useState(project.status);
  const [progress, setProgress]   = useState(project.progress);
  const [github, setGithub]       = useState(project.githubRepo ?? "");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [verifying, setVerifying] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress, githubRepo: github }),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onRefresh(); }, 1200);
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    try {
      await fetch(`/api/admin/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verify: true }),
      });
      onRefresh();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Edit card */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-5">
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Project Settings</p>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-[12px] font-bold uppercase text-muted outline-none focus:border-accent/50 cursor-pointer"
          >
            {["planning","active","completed","archived"].map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Progress</label>
            <span className="text-[13px] font-black text-accent">{progress}%</span>
          </div>
          <input
            type="range" min={0} max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[#6366f1]"
          />
          <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* GitHub */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">GitHub Repo</label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent/50"
            />
          </div>
          {project.githubRepo && (
            <a href={project.githubRepo} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline font-mono">
              {project.githubRepo}
            </a>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            disabled={saving}
            onClick={save}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved</> : "Save Changes"}
          </button>
          {!project.verifiedBy && (
            <button
              disabled={verifying}
              onClick={verify}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Verify
            </button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Project Info</p>
        {project.lead && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
            <MemberAvatar m={project.lead} size="md" />
            <div>
              <p className="text-[12px] font-bold text-foreground">{project.lead.name}</p>
              <p className="text-[10px] text-muted font-mono">{project.lead.role} · Lead</p>
            </div>
          </div>
        )}
        {project.proposalId && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-background">
            <div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Source Proposal</p>
              <p className="text-[12px] font-bold text-foreground mt-0.5 line-clamp-1">{project.proposalId.title}</p>
            </div>
            <Link href={`/admin/proposals/${project.proposalId._id}`}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors whitespace-nowrap">
              View →
            </Link>
          </div>
        )}
        <div className="text-[11px] text-muted font-mono space-y-1.5 pt-1">
          <p>Created: {new Date(project.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
          <p>Members: {project.members.length}</p>
          {project.verifiedBy && <p className="text-emerald-400">Verified by: {project.verifiedBy.name}</p>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TEAM TAB
// ══════════════════════════════════════════════════════════════
function TeamTab({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [searchQ, setSearchQ]       = useState("");
  const [results, setResults]       = useState<any[]>([]);
  const [removing, setRemoving]     = useState<string | null>(null);
  const [adding, setAdding]         = useState<string | null>(null);

  const searchUsers = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const res  = await fetch(`/api/mobile/admin/users?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    const memberIds = new Set(project.members.map((m) => m._id));
    setResults((Array.isArray(data) ? data : []).filter((u: any) => !memberIds.has(u._id)).slice(0, 6));
  };

  const patchTeam = async (add?: string[], remove?: string[]) => {
    const body: Record<string, string[]> = {};
    if (add?.length)    body.add    = add;
    if (remove?.length) body.remove = remove;
    await fetch(`/api/admin/projects/${project._id}/team`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onRefresh();
  };

  const addMember = async (userId: string) => {
    setAdding(userId);
    try { await patchTeam([userId]); setResults([]); setSearchQ(""); }
    finally { setAdding(null); }
  };

  const removeMember = async (userId: string) => {
    setRemoving(userId);
    try { await patchTeam(undefined, [userId]); }
    finally { setRemoving(null); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
      {/* Member list */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">
            Team Members ({project.members.length})
          </p>
        </div>
        {project.members.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-muted">
            No members yet. Use the panel on the right to add members.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {project.members.map((m) => (
              <div key={m._id} className="px-5 py-4 flex items-center gap-3 group">
                <MemberAvatar m={m} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-foreground truncate">{m.name}</p>
                    {project.lead?._id === m._id && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent uppercase tracking-wider">Lead</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted font-mono truncate">{m.email}</p>
                  {m.skills && m.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.skills.slice(0, 4).map((s) => (
                        <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <StatusBadge value={m.role} />
                {project.lead?._id !== m._id && (
                  <button
                    disabled={removing === m._id}
                    onClick={() => removeMember(m._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all disabled:opacity-50"
                  >
                    {removing === m._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add member panel */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4 self-start">
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest flex items-center gap-2">
          <UserPlus className="w-3.5 h-3.5" /> Add Member
        </p>
        <div className="relative">
          <input
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); searchUsers(e.target.value); }}
            placeholder="Search by name or skill…"
            className="w-full px-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-subtle rounded-xl shadow-lg z-20 overflow-hidden">
              {results.map((u) => (
                <button
                  key={u._id}
                  disabled={adding === u._id}
                  onClick={() => addMember(u._id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-background transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-foreground truncate">{u.name}</p>
                      <p className="text-[10px] text-muted font-mono truncate">{u.role}</p>
                    </div>
                  </div>
                  {adding === u._id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin text-accent flex-shrink-0" />
                    : <Plus className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  }
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted font-mono">
          Searches all platform members. The lead is already in the team.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TASKS TAB
// ══════════════════════════════════════════════════════════════
const EMPTY_TASK: { title: string; description: string; assignedTo: string; assignedToName: string; priority: "low" | "medium" | "high"; deadline: string } = {
  title: "", description: "", assignedTo: "", assignedToName: "", priority: "medium", deadline: "",
};

function TasksTab({ projectId, members, tasks, onRefresh }: {
  projectId: string; members: Member[]; tasks: Task[]; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_TASK);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [err, setErr]           = useState("");

  const completed = tasks.filter((t) => t.status === "completed").length;

  const createTask = async () => {
    if (!form.title || !form.assignedTo || !form.deadline) {
      setErr("Title, assignee, and deadline are required."); return;
    }
    setSaving(true); setErr("");
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(EMPTY_TASK);
        setShowForm(false);
        onRefresh();
      } else {
        const d = await res.json();
        setErr(d.error ?? "Failed to create task");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setDeleting(taskId);
    try {
      await fetch(`/api/admin/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await fetch(`/api/admin/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-foreground">
          {completed}/{tasks.length} tasks complete
          {tasks.length > 0 && (
            <span className="text-muted font-normal ml-2">
              ({Math.round((completed / tasks.length) * 100)}%)
            </span>
          )}
        </p>
        <button
          onClick={() => { setShowForm((v) => !v); setErr(""); }}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "New Task"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-surface border border-accent/20 rounded-2xl p-5 space-y-4">
          <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">Create Task</p>
          {err && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-[12px] font-medium">{err}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Task Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Implement user authentication"
                className="w-full px-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground outline-none focus:border-accent/50"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional detail…"
                className="w-full px-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground outline-none focus:border-accent/50 resize-none"
              />
            </div>
            {/* Assign to */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Assign To *</label>
              <select
                value={form.assignedTo}
                onChange={(e) => {
                  const m = members.find((m) => m._id === e.target.value);
                  setForm((f) => ({ ...f, assignedTo: e.target.value, assignedToName: m?.name ?? "" }));
                }}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-[12px] font-bold text-muted outline-none focus:border-accent/50 cursor-pointer"
              >
                <option value="">Select team member…</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Priority</label>
              <div className="flex gap-2">
                {(["low","medium","high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      form.priority === p
                        ? PRIORITY_COLORS[p] + " ring-1 ring-current"
                        : "bg-background text-muted hover:bg-border-subtle"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Deadline *</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[13px] text-foreground outline-none focus:border-accent/50"
                />
              </div>
            </div>
          </div>
          <button
            disabled={saving}
            onClick={createTask}
            className="w-full py-3 rounded-xl bg-accent text-white text-[12px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Create & Assign Task"}
          </button>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="flex h-40 items-center justify-center bg-surface border border-border-subtle rounded-2xl">
          <p className="text-[13px] text-muted">No tasks yet. Create the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task._id}
              className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-wrap gap-4 items-start group">
              {/* Left: info */}
              <div className="flex-1 min-w-[180px] space-y-1.5">
                <p className="text-[13px] font-bold text-foreground leading-snug">{task.title}</p>
                {task.description && (
                  <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted font-mono">
                  <span className="font-bold text-foreground">{task.assignedToName || task.assignedTo}</span>
                  <span>·</span>
                  <CalendarDays className="w-3 h-3" />
                  <span>{new Date(task.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex-1 h-1 rounded-full bg-border-subtle overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted w-7 text-right">{task.progress}%</span>
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Chip label={task.priority} color={PRIORITY_COLORS[task.priority]} />
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task._id, { status: e.target.value as Task["status"] })}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold uppercase border-0 outline-none cursor-pointer ${STATUS_COLORS[task.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <input
                  type="number" min={0} max={100}
                  value={task.progress}
                  onChange={(e) => updateTask(task._id, { progress: Number(e.target.value) })}
                  className="w-20 py-1 px-2 bg-background border border-border-subtle rounded-lg text-[11px] font-mono text-center text-foreground outline-none focus:border-accent/50"
                />
                <button
                  disabled={deleting === task._id}
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all disabled:opacity-50"
                >
                  {deleting === task._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
