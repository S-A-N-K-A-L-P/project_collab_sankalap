"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, AlertCircle, Check, X, ShieldAlert,
  UserCheck, ShieldCheck, UserX, Settings
} from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { useRouter } from "next/navigation";
import { ORG_ROLE_LABELS } from "@/lib/org-permissions";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

export default function OrgAdminMembersPage() {
  const { org, loading: loadingOrg, error: orgError, isAdmin } = useOrg();
  const router = useRouter();
  
  const [members, setMembers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingOrg) {
      if (!org) {
        router.push("/orgs");
        return;
      }
      if (!isAdmin) {
        router.push(`/orgs/${org.slug}`);
        return;
      }
      fetchMembers();
    }
  }, [loadingOrg, org, isAdmin]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const [resMembers, resPending] = await Promise.all([
        fetch(`/api/orgs/${org?.slug}/members?status=active`),
        fetch(`/api/orgs/${org?.slug}/members?status=pending`),
      ]);

      if (resMembers.ok && resPending.ok) {
        const dataMembers = await resMembers.json();
        const dataPending = await resPending.json();
        setMembers(dataMembers.members || []);
        setPending(dataPending.members || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberUserId: string) => {
    setActioning(memberUserId);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${org?.slug}/members/${memberUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to approve member");
      }
      await fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioning(null);
    }
  };

  const handleRoleChange = async (memberUserId: string, newRole: string) => {
    setActioning(memberUserId);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${org?.slug}/members/${memberUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change role");
      }
      await fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioning(null);
    }
  };

  const handleRemove = async (memberUserId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setActioning(memberUserId);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${org?.slug}/members/${memberUserId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove member");
      }
      await fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioning(null);
    }
  };

  if (loadingOrg || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0a0f] text-foreground dark:text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={28} />
      </div>
    );
  }

  if (orgError || !org || !isAdmin) return null;

  return (
    <AppLayoutClient>
      <div className="text-foreground dark:text-white max-w-5xl mx-auto w-full py-4 space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border dark:border-white/8">
          <a href={`/orgs/${org.slug}/admin`} className="text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="text-xl font-bold text-foreground dark:text-white">Manage Members</h1>
            <p className="text-xs text-muted-foreground dark:text-white/40">Approve requests and adjust roles for {org.name}</p>
          </div>
        </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-error-muted dark:bg-red-500/10 border border-error dark:border-red-400/20 flex items-start gap-2">
            <AlertCircle className="text-error dark:text-red-400 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-error-text dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Pending Requests Section */}
        {pending.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-warning-text dark:text-yellow-400 flex items-center gap-2">
              <ShieldAlert size={14} /> Pending Join Requests ({pending.length})
            </h3>
            <div className="rounded-xl border border-warning dark:border-yellow-500/20 bg-warning-muted/40 dark:bg-yellow-500/5 divide-y divide-border dark:divide-white/8 overflow-hidden">
              {pending.map((m) => {
                const u = m.userId || {};
                return (
                  <div key={m._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-tertiary dark:from-indigo-400 dark:to-purple-400 flex items-center justify-center font-bold text-white">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground dark:text-white text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-white/40">@{u.handle || "user"} · joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u._id)}
                        disabled={actioning === u._id}
                        className="p-1.5 rounded-lg bg-success hover:brightness-110 text-white transition-all"
                        title="Approve"
                      >
                        {actioning === u._id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={() => handleRemove(u._id)}
                        disabled={actioning === u._id}
                        className="p-1.5 rounded-lg bg-error-muted dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-error-text dark:text-red-300 transition-colors"
                        title="Reject"
                      >
                        {actioning === u._id ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Active Members Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground dark:text-white flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary dark:text-indigo-400" /> Active Members ({members.length})
          </h3>
          <div className="rounded-xl border border-border bg-card dark:bg-white/5 divide-y divide-border dark:divide-white/8 overflow-hidden">
            {members.map((m) => {
              const u = m.userId || {};
              const isOwner = m.role === "owner";
              return (
                <div key={m._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-tertiary dark:from-indigo-400 dark:to-purple-400 flex items-center justify-center font-bold text-white">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground dark:text-white text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-white/40">@{u.handle || "user"} · Member since {new Date(m.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Role Dropdown */}
                    {isOwner ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-muted dark:bg-yellow-500/10 text-warning-text dark:text-yellow-400 border border-warning dark:border-yellow-500/20">
                        Owner
                      </span>
                    ) : (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={actioning === u._id}
                        className="px-2 py-1.5 rounded-lg bg-card dark:bg-white/5 border border-border text-xs text-foreground dark:text-white focus:outline-none focus:border-primary dark:focus:border-indigo-400/60"
                      >
                        {Object.entries(ORG_ROLE_LABELS).map(([value, label]) => {
                          if (value === "owner") return null;
                          return <option key={value} value={value}>{label}</option>;
                        })}
                      </select>
                    )}

                    {/* Remove Member */}
                    {!isOwner && (
                      <button
                        onClick={() => handleRemove(u._id)}
                        disabled={actioning === u._id}
                        className="p-1.5 rounded-lg hover:bg-error-muted dark:hover:bg-red-500/20 text-muted-foreground dark:text-white/40 hover:text-error dark:hover:text-red-400 transition-colors"
                        title="Remove Member"
                      >
                        <UserX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      </div>
    </AppLayoutClient>
  );
}
