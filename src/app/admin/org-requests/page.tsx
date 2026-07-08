"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, AlertCircle, Check, X, ShieldAlert,
  Building, User, FileText, Send, Calendar, Clock
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isPlatformReviewer } from "@/lib/roles";

interface RequestDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  orgType: string;
  charter: string;
  roadmap?: string;
  tagline?: string;
  logo?: string;
  themeColor?: string;
  status: string;
  createdAt: string;
  ownerId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function PlatformOrgRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [selected, setSelected] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [reason, setReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/org-requests");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (!isPlatformReviewer(role)) {
        router.push("/dashboard");
        return;
      }
      fetchRequests();
    }
  }, [status]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/org-requests?status=requested");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data.requests || []);
      if (data.requests?.length > 0) {
        setSelected(data.requests[0]);
      } else {
        setSelected(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (!selected) return;
    if (decision === "rejected" && !reason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setActioning(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/org-requests/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Action failed");
      }

      // Success
      setReason("");
      setShowRejectBox(false);
      await fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioning(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  const role = (session?.user as any)?.role;
  if (!isPlatformReviewer(role)) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-white/8 bg-black/20 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={16} />
          </a>
          <h1 className="font-bold text-white text-sm">Org Launch requests Queue</h1>
        </div>
        <span className="text-xs text-white/40">{requests.length} pending requests</span>
      </div>

      {error && (
        <div className="m-4 p-3 rounded-xl bg-red-500/10 border border-red-400/20 text-xs text-red-300 flex items-center gap-2 shrink-0">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Main Splitted Queue */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: List of pending orgs (300px) */}
        <div className="w-[300px] shrink-0 border-r border-white/8 bg-black/10 overflow-y-auto scrollbar-thin">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-white/30 space-y-2 mt-20">
              <Building size={28} className="mx-auto" />
              <p className="text-xs">Queue is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests.map((req) => (
                <button
                  key={req._id}
                  onClick={() => { setSelected(req); setShowRejectBox(false); setError(null); }}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 hover:bg-white/5 ${
                    selected?._id === req._id ? "bg-white/5" : ""
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: req.themeColor || "#6366f1" }}
                  >
                    {req.logo ? <img src={req.logo} alt="" className="w-full h-full object-cover rounded-lg" /> : req.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{req.name}</h3>
                    <p className="text-[10px] text-white/40 truncate">@{req.ownerId?.name || "user"}</p>
                    <p className="text-[9px] text-white/30 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Detailed View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-[#08080c]">
          {selected ? (
            <div className="max-w-2xl space-y-6">
              {/* Org Header */}
              <div className="flex items-center gap-4 border-b border-white/5 pb-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                  style={{ backgroundColor: selected.themeColor }}
                >
                  {selected.logo ? <img src={selected.logo} alt="" className="w-full h-full object-cover rounded-xl" /> : selected.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <p className="text-xs text-white/40">sankalp.dev/orgs/{selected.slug}</p>
                </div>
              </div>

              {/* Founder Profile */}
              <div className="p-4 rounded-xl border border-white/8 bg-white/4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">
                  {selected.ownerId?.avatar ? <img src={selected.ownerId.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : selected.ownerId?.name?.[0]}
                </div>
                <div>
                  <p className="text-xs text-white/40">Request Submitter</p>
                  <p className="text-sm font-semibold text-white">{selected.ownerId?.name} ({selected.ownerId?.email})</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5"><FileText size={12} /> Description</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{selected.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Target size={12} className="text-indigo-400" /> Mission & Charter</h4>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                    {selected.charter}
                  </div>
                </div>

                {selected.roadmap && (
                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={12} className="text-indigo-400" /> Planned Roadmap</h4>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-mono text-xs">
                      {selected.roadmap}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-white/8">
                {showRejectBox ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider">Specify Rejection Reason</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Explain to the founder why the organization request was not approved..."
                      className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowRejectBox(false)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-white/60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDecision("rejected")}
                        disabled={actioning}
                        className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-xs font-bold flex items-center gap-1"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowRejectBox(true)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <X size={14} /> Reject Request
                    </button>
                    <button
                      onClick={() => handleDecision("approved")}
                      disabled={actioning}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold flex items-center gap-1 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
                    >
                      <Check size={14} /> Approve & Launch Org
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/30">
              Select an org request from the queue to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick fallback Target icon
function Target({ className, size }: { className?: string; size?: number }) {
  return <Building className={className} size={size} />;
}
