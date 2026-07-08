"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { IOrgPublic, IOrgMemberPopulated, OrgRole } from "@/types/org";

interface OrgContextValue {
  org:          IOrgPublic | null;
  members:      IOrgMemberPopulated[];
  loading:      boolean;
  error:        string | null;
  // Current user's membership
  myMembership: { role: OrgRole; status: string; xpInOrg: number } | null;
  isOwner:      boolean;
  isAdmin:      boolean;
  isMember:     boolean;
  // Actions
  refresh:      () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const { data: session } = useSession();
  const [org,     setOrg]     = useState<IOrgPublic | null>(null);
  const [members, setMembers] = useState<IOrgMemberPopulated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const userId = (session?.user as any)?.id;

  const fetchOrg = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${slug}`);
      if (!res.ok) throw new Error("Organization not found");
      const data = await res.json();
      setOrg(data.org);
      setMembers(data.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrg(); }, [slug]);

  // Derive current user's membership
  const myMembership = userId
    ? members.find((m: any) => m.userId?._id === userId || m.userId === userId) as any
    : null;

  const myRole: OrgRole | undefined = myMembership?.role;

  const isOwner  = myRole === "owner";
  const isAdmin  = myRole === "admin" || isOwner;
  const isMember = !!myMembership && myMembership.status === "active";

  return (
    <OrgContext.Provider value={{
      org, members, loading, error,
      myMembership: myMembership
        ? { role: myMembership.role, status: myMembership.status, xpInOrg: myMembership.xpInOrg || 0 }
        : null,
      isOwner, isAdmin, isMember,
      refresh: fetchOrg,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within an OrgProvider");
  return ctx;
}
