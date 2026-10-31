"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { Mail, Loader2, Inbox } from "lucide-react";
import NextLink from "next/link";

const STATUS_COLOR: Record<string, string> = {
  new:       "bg-blue-100 text-blue-800",
  responded: "bg-amber-100 text-amber-800",
  closed:    "bg-gray-100 text-gray-700",
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/admin/marketplace/inquiries")
      .then(r => r.ok ? r.json() : [])
      .then(setInquiries)
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace Inquiries</h1>
          <p className="text-sm text-muted mt-1">Buyer inquiries from listed projects.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
            <Inbox className="w-10 h-10 text-muted/30 mb-3" />
            <p className="text-sm font-medium text-foreground">No inquiries yet</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {inquiries.map(inq => (
              <div key={inq._id} className="p-5 hover:bg-background/30 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[inq.status]}`}>
                        {inq.status}
                      </span>
                      {inq.projectId && (
                        <NextLink href={`/showcase/${inq.projectId._id}`} className="text-xs font-medium text-primary hover:underline">
                          {inq.projectId.title}
                        </NextLink>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {inq.buyerName} {inq.buyerOrg && <span className="text-muted">· {inq.buyerOrg}</span>}
                    </p>
                    <a href={`mailto:${inq.buyerEmail}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {inq.buyerEmail}
                    </a>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(inq.createdAt).toLocaleDateString("en-GB", { day:"numeric",month:"short",year:"numeric" })}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mt-2 whitespace-pre-wrap">
                  {inq.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
