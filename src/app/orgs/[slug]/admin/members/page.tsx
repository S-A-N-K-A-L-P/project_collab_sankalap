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
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  if (orgError || !org || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top Header */}
      <div className="border-b border-white/8 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <a href={`/orgs/${org.slug}/admin`} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="font-bold text-white">Manage Members</h1>
            <p className="text-xs text-white/40">Approve requests and adjust roles for {org.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/20 flex items-start gap-2">
            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Pending Requests Section */}
        {pending.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
              <ShieldAlert size={14} /> Pending Join Requests ({pending.length})
            </h3>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 divide-y divide-white/8 overflow-hidden">
              {pending.map((m) => {
                const u = m.userId || {};
                return (
                  <div key={m._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center font-bold">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{u.name}</p>
                        <p className="text-xs text-white/40">@{u.handle || "user"} · joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u._id)}
                        disabled={actioning === u._id}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
                        title="Approve"
                      >
                        {actioning === u._id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={() => handleRemove(u._id)}
                        disabled={actioning === u._id}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
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
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" /> Active Members ({members.length})
          </h3>
          <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/8 overflow-hidden">
            {members.map((m) => {
              const u = m.userId || {};
              const isOwner = m.role === "owner";
              return (
                <div key={m._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center font-bold">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{u.name}</p>
                      <p className="text-xs text-white/40">@{u.handle || "user"} · Member since {new Date(m.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Role Dropdown */}
                    {isOwner ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Owner
                      </span>
                    ) : (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={actioning === u._id}
                        className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400/60"
                      >
                        {Object.entries(ORG_ROLE_LABELS).map(([value, label]) => {
                          if (value === "owner") return null;
                          return <option key={value} value={value} className="bg-gray-900">{label}</option>;
                        })}
                      </select>
                    )}

                    {/* Remove Member */}
                    {!isOwner && (
                      <button
                        onClick={() => handleRemove(u._id)}
                        disabled={actioning === u._id}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
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
  );
}
