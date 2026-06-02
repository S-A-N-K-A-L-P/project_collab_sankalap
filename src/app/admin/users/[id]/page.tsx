"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/app/admin/components/AdminShell";
import StatusBadge from "@/app/admin/components/StatusBadge";
import {
  ArrowLeft, Loader2, Check, Mail, MapPin, GraduationCap,
  Github, Star, Users, FolderKanban, ListChecks,
  CheckCircle2, Clock, AlertTriangle
} from "lucide-react";

const ROLES = ["user", "sankalp_member", "sankalp_associate", "master_admin"] as const;
type Role = (typeof ROLES)[number];

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  bio?: string;
  github?: string;
  location?: string;
  universityName?: string;
  enrollmentNumber?: string;
  techStackPreference?: string;
  skills: string[];
  reputation: number;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface ProjectRef {
  _id: string;
  title: string;
  status: string;
  progress: number;
  lead: { _id: string; name: string; avatar?: string };
  members: string[];
}

interface TaskRef {
  _id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  deadline: string;
  projectId: string;
  projectTitle?: string;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  delayed: number;
}

function Avatar({ user }: { user: UserDetail }) {
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-2xl font-black overflow-hidden border border-border-subtle">
      {user.avatar
        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct   = Math.max(0, Math.min(100, value));
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 60 ? "bg-accent" : pct >= 30 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-muted w-7 text-right">{pct}%</span>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser]             = useState<UserDetail | null>(null);
  const [projects, setProjects]     = useState<ProjectRef[]>([]);
  const [tasks, setTasks]           = useState<TaskRef[]>([]);
  const [taskStats, setTaskStats]   = useState<TaskStats | null>(null);
  const [loading, setLoading]       = useState(true);

  const [pendingRole, setPendingRole] = useState<Role | "">("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      setUser(data.user);
      setProjects(data.projects ?? []);
      setTasks(data.tasks ?? []);
      setTaskStats(data.taskStats ?? null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleRoleSave = async () => {
    if (!pendingRole || pendingRole === user?.role) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role: pendingRole }),
      });
      if (res.ok) {
        setUser((prev) => prev ? { ...prev, role: pendingRole as Role } : prev);
        setPendingRole("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <p className="text-[13px] text-muted">User not found.</p>
        </div>
      </AdminShell>
    );
  }

  const effectiveRole = pendingRole || user.role;

  return (
    <AdminShell>
      <div className="space-y-6">

        {/* Back */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-[12px] font-bold font-mono uppercase tracking-wider text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Users
        </Link>

        {/* Profile header */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar user={user} />

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-[22px] font-black text-foreground tracking-tight">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <StatusBadge value={user.role} />
                  <span className="text-[11px] font-mono text-muted">{user.email}</span>
                </div>
              </div>

              {user.bio && (
                <p className="text-[13px] text-muted leading-relaxed max-w-[600px]">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-[11px] font-mono text-muted">
                {user.universityName && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> {user.universityName}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {user.location}
                  </span>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-accent transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> {user.github}
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  {user.reputation} rep
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {user.followers?.length ?? 0} followers
                </span>
              </div>
            </div>

            {/* Role change panel */}
            <div className="bg-background border border-border-subtle rounded-xl p-4 space-y-3 min-w-[220px]">
              <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Change Role</p>
              <select
                value={effectiveRole}
                onChange={(e) => setPendingRole(e.target.value as Role)}
                className="w-full py-2 px-3 bg-surface border border-border-subtle rounded-lg text-[11px] font-bold uppercase text-muted outline-none focus:border-accent/50 cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g, " ").toUpperCase()}</option>
                ))}
              </select>
              <button
                disabled={saving || !pendingRole || pendingRole === user.role}
                onClick={handleRoleSave}
                className={`w-full py-2 px-4 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved ? (
                  <><Check className="w-3.5 h-3.5" /> Saved</>
                ) : (
                  "Save Role"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Skills */}
        {(user.skills?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(user.skills ?? []).map((s) => (
                <span key={s} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Task stats */}
        {taskStats && taskStats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Tasks",  value: taskStats.total,      icon: ListChecks,  color: "text-accent",       bg: "bg-accent/10"        },
              { label: "In Progress",  value: taskStats.inProgress,  icon: Clock,       color: "text-amber-400",   bg: "bg-amber-500/10"     },
              { label: "Completed",    value: taskStats.completed,   icon: CheckCircle2,color: "text-emerald-400", bg: "bg-emerald-500/10"   },
              { label: "Delayed",      value: taskStats.delayed,     icon: AlertTriangle,color:"text-red-400",     bg: "bg-red-500/10"       },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`p-4 rounded-2xl border border-border-subtle ${bg} flex items-center gap-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
                <div>
                  <p className={`text-[20px] font-black ${color}`}>{value}</p>
                  <p className="text-[9px] font-mono text-muted uppercase tracking-wider">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-accent" />
              <p className="text-[12px] font-mono font-bold text-muted uppercase tracking-widest">
                Projects ({projects.length})
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {projects.map((proj) => (
                <Link
                  key={proj._id}
                  href={`/admin/projects/${proj._id}`}
                  className="group bg-surface border border-border-subtle rounded-xl p-4 hover:border-accent/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                      {proj.title}
                    </p>
                    <StatusBadge value={proj.status} />
                  </div>
                  <ProgressBar value={proj.progress} />
                  <p className="text-[10px] font-mono text-muted">
                    {proj.members.length} member{proj.members.length !== 1 ? "s" : ""}
                    {proj.lead?._id === user._id && " · Lead"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-accent" />
              <p className="text-[12px] font-mono font-bold text-muted uppercase tracking-widest">
                Assigned Tasks ({tasks.length})
              </p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle">
                    {["Task", "Project", "Priority", "Status", "Progress", "Deadline"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-mono font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {tasks.map((task) => {
                    const deadline = new Date(task.deadline);
                    const isOverdue = deadline < new Date() && task.status !== "completed";
                    return (
                      <tr key={task._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-[12px] font-bold text-foreground">{task.title}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/projects/${task.projectId}`}
                            className="text-[11px] font-mono text-accent hover:underline truncate max-w-[120px] block"
                          >
                            {task.projectTitle ?? task.projectId.slice(-6)}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge value={task.priority} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge value={task.status} />
                        </td>
                        <td className="px-5 py-3.5 min-w-[100px]">
                          <ProgressBar value={task.progress} />
                        </td>
                        <td className={`px-5 py-3.5 text-[11px] font-mono whitespace-nowrap ${isOverdue ? "text-red-400" : "text-muted"}`}>
                          {deadline.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          {isOverdue && " ⚠"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center bg-surface border border-border-subtle rounded-2xl">
            <p className="text-[13px] text-muted">No projects or tasks assigned to this user yet.</p>
          </div>
        )}

        {/* Meta info footer */}
        <div className="flex flex-wrap gap-6 text-[10px] font-mono text-muted px-1">
          <span>Joined: {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          {user.enrollmentNumber && <span>Enrollment: {user.enrollmentNumber}</span>}
          {user.techStackPreference && <span>Stack preference: {user.techStackPreference}</span>}
          <span>ID: {user._id}</span>
        </div>
      </div>
    </AdminShell>
  );
}
