"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import type { OrgRole } from "@/types/org";

export interface OrgMembershipState {
  isMember:  boolean;
  isPending: boolean;
  role?:     OrgRole;
  loading:   boolean;
  joining:   boolean;
  error:     string | null;
  join:      (slug: string) => Promise<void>;
  leave:     (slug: string) => Promise<void>;
}

/**
 * Hook for managing the current user's membership in a specific org.
 * Pass an initial membership object if you already have it (e.g. from OrgContext).
 */
export function useOrgMembership(slug: string, initial?: { role: OrgRole; status: string } | null): OrgMembershipState {
  const { data: session } = useSession();
  const [membership, setMembership] = useState(initial ?? null);
  const [loading,    setLoading]    = useState(false);
  const [joining,    setJoining]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const isMember  = membership?.status === "active";
  const isPending = membership?.status === "pending";

  const join = useCallback(async (slug: string) => {
    if (!session) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${slug}/members`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join");
      setMembership({ role: "member", status: data.pending ? "pending" : "active" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  }, [session]);

  const leave = useCallback(async (slug: string) => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${slug}/members/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to leave");
      setMembership(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    isMember,
    isPending,
    role:    membership?.role,
    loading,
    joining,
    error,
    join,
    leave,
  };
}
