"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Copy, Check, Loader2, Server, KeyRound, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/context/OrgContext";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import { toast } from "@/hooks/use-toast";

type NodeStatus = {
  paired: boolean;
  nodeId?: string;
  hostName?: string;
  url?: string | null;
  features?: string[];
  lastOnlineAt?: string | null;
  lastOfflineAt?: string | null;
};

type Pairing = { code: string; expiresAt: string; replacesNode: string | null };

function ago(iso?: string | null): string {
  if (!iso) return "never";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

/** S2 — Node pairing & status (Syncro.Desktop docs/org-server/admindashboard-syncro.md §7). Org owner/admin only. */
export default function OrgNodeAdminPage() {
  const { org, loading, isAdmin } = useOrg();
  const router = useRouter();
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [busy, setBusy] = useState<"pair" | "unpair" | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    if (!org) return;
    const res = await fetch(`/api/orgs/${org.slug}/node`, { cache: "no-store" });
    if (res.ok) setStatus(await res.json());
  }, [org]);

  useEffect(() => {
    if (loading) return;
    if (!org) { router.push("/orgs"); return; }
    if (!isAdmin) { router.push(`/orgs/${org.slug}`); return; }
    load();
  }, [loading, org, isAdmin, router, load]);

  // Countdown only while a code is on screen (no polling of the Showcase).
  useEffect(() => {
    if (!pairing) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [pairing]);

  const remaining = pairing ? Math.max(0, Math.floor((new Date(pairing.expiresAt).getTime() - now) / 1000)) : 0;

  async function generate() {
    if (!org) return;
    if (status?.paired && !confirm("A node is already paired. Pairing a new PC replaces it and signs everyone out of the old one. Continue?")) return;
    setBusy("pair");
    try {
      const res = await fetch(`/api/orgs/${org.slug}/node/pairing-code`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Couldn't create a pairing code");
      setPairing(data);
      setNow(Date.now());
    } catch (e) {
      toast({ variant: "destructive", title: "Pairing code failed", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function unpair() {
    if (!org || !confirm("Unpair the node? Everyone is signed out of the console. Projects and code stay on the host's PC and can be re-paired.")) return;
    setBusy("unpair");
    try {
      const res = await fetch(`/api/orgs/${org.slug}/node`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Couldn't unpair");
      toast({ title: "Node unpaired" });
      setPairing(null);
      await load();
    } catch (e) {
      toast({ variant: "destructive", title: "Unpair failed", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function copyCode() {
    if (!pairing) return;
    await navigator.clipboard.writeText(pairing.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading || !org || !isAdmin) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={28} />
      </div>
    );
  }

  const card = "p-5 rounded-2xl border border-border dark:border-white/8 bg-card dark:bg-white/4";
  const online = !!status?.url;

  return (
    <AppLayoutClient>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5 text-foreground dark:text-white">
        <a href={`/orgs/${org.slug}/admin`} className="text-xs text-muted-foreground dark:text-white/50 hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> Admin console
        </a>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Server size={18} className="text-primary dark:text-indigo-400" /> Org server</h1>
          <p className="text-sm text-muted-foreground dark:text-white/50 mt-1">
            {org.name}&apos;s console runs on a host&apos;s computer with Syncro Desktop. Projects and code stay on that PC;
            this site only signs people in and shows public summaries.
          </p>
        </div>

        {/* Status */}
        <section className={card}>
          <h2 className="font-semibold mb-3">Status</h2>
          {!status ? (
            <Loader2 className="animate-spin text-muted-foreground" size={18} />
          ) : !status.paired ? (
            <p className="text-sm text-muted-foreground dark:text-white/50">No node is paired yet.</p>
          ) : (
            <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground dark:text-white/40">State</dt>
              <dd className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-zinc-400"}`} />
                {online ? "Announced online" : "Offline"}
              </dd>
              <dt className="text-muted-foreground dark:text-white/40">Host</dt>
              <dd>{status.hostName || "—"} <span className="text-muted-foreground dark:text-white/40 font-mono text-xs">({status.nodeId})</span></dd>
              <dt className="text-muted-foreground dark:text-white/40">Last online</dt>
              <dd>{ago(status.lastOnlineAt)}</dd>
              <dt className="text-muted-foreground dark:text-white/40">Last offline</dt>
              <dd>{ago(status.lastOfflineAt)}</dd>
            </dl>
          )}
        </section>

        {/* Pair */}
        <section className={card}>
          <h2 className="font-semibold mb-1 flex items-center gap-2"><KeyRound size={15} /> Pair a PC</h2>
          <p className="text-sm text-muted-foreground dark:text-white/50 mb-4">
            Generate a code, then on the host&apos;s PC paste it into Syncro Desktop → Org server → Pair, or run the command below.
          </p>
          {pairing && remaining > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <code className="text-2xl tracking-widest font-mono px-4 py-2 rounded-lg bg-muted dark:bg-white/8 break-all">{pairing.code}</code>
                <button onClick={copyCode} className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-border dark:border-white/10 hover:bg-muted dark:hover:bg-white/8">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground dark:text-white/40">
                Expires in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
                {pairing.replacesNode ? ` · replaces ${pairing.replacesNode}` : ""}
              </p>
              <pre className="text-xs font-mono p-3 rounded-lg bg-muted dark:bg-white/6 overflow-x-auto">syncro org pair {pairing.code}{"\n"}syncro org up</pre>
            </div>
          ) : (
            <button
              onClick={generate}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground dark:bg-indigo-500 dark:text-white disabled:opacity-60"
            >
              {busy === "pair" && <Loader2 className="animate-spin" size={14} />}
              {pairing ? "Code expired — generate a new one" : "Generate pairing code"}
            </button>
          )}
        </section>

        {/* Danger zone */}
        {status?.paired && (
          <section className={`${card} border-red-500/30`}>
            <h2 className="font-semibold mb-1 text-red-600 dark:text-red-400 flex items-center gap-2"><Unplug size={15} /> Unpair</h2>
            <p className="text-sm text-muted-foreground dark:text-white/50 mb-3">
              Signs everyone out of the node. Live work stays on the PC and can be paired again.
            </p>
            <button
              onClick={unpair}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-60"
            >
              {busy === "unpair" && <Loader2 className="animate-spin" size={14} />} Unpair node
            </button>
          </section>
        )}
      </div>
    </AppLayoutClient>
  );
}
