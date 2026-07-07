"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { isAdminRole } from "@/lib/roles";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as any)?.role as string | undefined;
  const allowed = status === "authenticated" && isAdminRole(role);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-[11px] font-mono font-bold text-muted uppercase tracking-widest">
            Verifying Access...
          </p>
        </div>
      </div>
    );
  }

  // Authorized
  if (allowed) {
    return <>{children}</>;
  }

  // Authenticated but wrong role — most often a stale session.
  // Offer the real fix (sign out → log back in with an admin account)
  // instead of a dead-end redirect.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-red-500/20 bg-red-500/10 max-w-sm text-center">
        <ShieldAlert className="w-9 h-9 text-red-500" />
        <div>
          <p className="text-sm font-bold text-foreground">Admin access required</p>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {role
              ? <>You&apos;re signed in as <span className="font-semibold text-foreground">{role.replace(/_/g, " ")}</span>, which doesn&apos;t have admin access.</>
              : "Your session doesn't carry an admin role."}
            {" "}If you recently became an admin, sign out and sign back in to refresh your session.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out &amp; log in as admin
        </button>
      </div>
    </div>
  );
}
