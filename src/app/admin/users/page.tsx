"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { Search, ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";

const ROLES = ["user", "sankalp_member", "sankalp_associate", "master_admin"] as const;
type Role = (typeof ROLES)[number];

interface UserRow {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  universityName?: string;
  skills: string[];
  reputation: number;
  createdAt: string;
}

function Avatar({ user }: { user: UserRow }) {
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-[11px] font-bold flex-shrink-0 overflow-hidden">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      ) : initials}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [saving, setSaving]     = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Record<string, Role>>({});
  const [saved, setSaved]       = useState<string | null>(null);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (q)          params.set("q", q);
    if (roleFilter) params.set("role", roleFilter);
    try {
      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleRoleChange = async (userId: string) => {
    const role = pendingRole[userId];
    if (!role) return;
    setSaving(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
        setSaved(userId);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
              placeholder="Search name, email, university…"
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-3 bg-surface border border-border-subtle rounded-xl text-[12px] font-bold uppercase text-muted outline-none focus:border-accent/50 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, " ").toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={() => fetchUsers(1)}
            className="py-2.5 px-4 bg-accent text-white rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all"
          >
            Search
          </button>
          <span className="text-[11px] text-muted font-mono ml-auto">
            {total} member{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Member", "University", "Skills", "Rep", "Joined", "Role", "Action"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-mono font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-muted">
                      No members found
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="hover:bg-background/50 transition-colors">
                    {/* Member */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <Avatar user={user} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-foreground truncate">{user.name}</p>
                          <p className="text-[11px] text-muted font-mono truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* University */}
                    <td className="px-5 py-4">
                      <span className="text-[12px] text-muted truncate max-w-[140px] block">
                        {user.universityName ?? "—"}
                      </span>
                    </td>
                    {/* Skills */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {user.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent">{s}</span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface text-muted">+{user.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    {/* Reputation */}
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-bold text-foreground">{user.reputation}</span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-[11px] text-muted font-mono">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    {/* Current role */}
                    <td className="px-5 py-4">
                      <StatusBadge value={user.role} />
                    </td>
                    {/* Role change */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={pendingRole[user._id] ?? user.role}
                          onChange={(e) =>
                            setPendingRole((prev) => ({ ...prev, [user._id]: e.target.value as Role }))
                          }
                          className="py-1.5 px-2 bg-background border border-border-subtle rounded-lg text-[11px] font-bold uppercase text-muted outline-none cursor-pointer min-w-[140px]"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r.replace(/_/g, " ").toUpperCase()}</option>
                          ))}
                        </select>
                        <button
                          disabled={saving === user._id || (pendingRole[user._id] ?? user.role) === user.role}
                          onClick={() => handleRoleChange(user._id)}
                          className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                            saved === user._id
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed"
                          }`}
                        >
                          {saving === user._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : saved === user._id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-muted font-mono">
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchUsers(page - 1)}
                  className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pages}
                  onClick={() => fetchUsers(page + 1)}
                  className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
