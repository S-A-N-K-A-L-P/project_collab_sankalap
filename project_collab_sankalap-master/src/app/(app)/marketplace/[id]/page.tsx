"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import {
  ExternalLink, Github, IndianRupee, ArrowLeft, Loader2, Send,
  CheckCircle2,
} from "lucide-react";

const LICENSE_LABEL: Record<string, string> = {
  "one-time":    "One-time purchase",
  "subscription":"Subscription",
  "open-source": "Open-source / donation",
  "custom":      "Custom — contact for terms",
};

export default function MarketplaceDetailPage() {
  const { id }      = useParams();
  const projectId   = id as string;

  const [data, setData]     = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [buyerName, setBuyerName]   = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerOrg, setBuyerOrg]     = useState("");
  const [message, setMessage]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    fetch(`/api/showcase/${projectId}`)
      .then(async r => r.ok ? r.json() : Promise.reject((await r.json())?.error))
      .then(setData)
      .catch(e => setError(typeof e === "string" ? e : "Not found"))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/${projectId}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerName, buyerEmail, buyerOrg, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");
      setSuccess(true);
      setBuyerName(""); setBuyerEmail(""); setBuyerOrg(""); setMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }
  if (!data?.project || !data.project.marketplace?.forSale) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-base font-semibold mb-1">This project is not for sale</p>
        <NextLink href="/marketplace" className="text-sm text-primary hover:underline">← Back to marketplace</NextLink>
      </div>
    );
  }

  const project = data.project;
  const price   = project.marketplace.priceINR;
  const license = LICENSE_LABEL[project.marketplace.licenseType] || "Custom";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <NextLink href="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </NextLink>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project info */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="aspect-video w-full bg-gradient-to-br from-emerald-500/15 via-primary/5 to-background overflow-hidden">
              {project.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl font-bold text-primary/20">{project.title?.[0]?.toUpperCase() || "?"}</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{project.description}</p>
              )}
              {project.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.techStack.map((t: string) => (
                    <span key={t} className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4 flex-wrap">
                <NextLink href={`/showcase/${project._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground hover:bg-card-hover text-xs font-semibold rounded-lg transition-colors">
                  View full showcase
                </NextLink>
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground hover:bg-card-hover text-xs font-semibold rounded-lg transition-colors">
                    <ExternalLink className="w-3 h-3" /> Live demo
                  </a>
                )}
                {project.githubRepo && (
                  <a href={project.githubRepo} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground hover:bg-card-hover text-xs font-semibold rounded-lg transition-colors">
                    <Github className="w-3 h-3" /> Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pricing */}
          <div className="bg-card border border-border rounded-xl p-5"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.10)" }}>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">Listed at</p>
            <div className="flex items-baseline gap-1 mt-1">
              <IndianRupee className="w-6 h-6 text-emerald-700" />
              <span className="text-3xl font-bold text-foreground">
                {price ? price.toLocaleString() : "Negotiate"}
              </span>
              {price > 0 && license === LICENSE_LABEL.subscription && (
                <span className="text-sm text-muted">/month</span>
              )}
            </div>
            <p className="text-sm text-muted mt-2">{license}</p>
          </div>

          {/* Inquiry form */}
          <div className="bg-card border border-border rounded-xl p-5"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.10)" }}>
            <h3 className="text-base font-bold text-foreground mb-3">Send inquiry</h3>

            {success ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                <p className="text-sm font-semibold text-foreground">Inquiry sent</p>
                <p className="text-xs text-muted mt-1">The project owner will get back to you via email.</p>
                <button onClick={() => setSuccess(false)} className="mt-4 text-xs font-medium text-primary hover:underline">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Your name *</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Email *</label>
                  <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Company / organisation</label>
                  <input type="text" value={buyerOrg} onChange={e => setBuyerOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Message *</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                    placeholder="What's your use case? Any specific requirements?"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? "Sending…" : "Send Inquiry"}
                </button>
                <p className="text-xs text-muted text-center pt-1">
                  We won't share your email. The owner receives this directly.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
