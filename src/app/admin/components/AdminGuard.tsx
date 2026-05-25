"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (
      status === "authenticated" &&
      !["admin", "pixel_head"].includes((session?.user as any)?.role)
    ) {
      router.push("/unauthorized");
    }
  }, [status, session, router]);

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

  if (
    status === "authenticated" &&
    ["admin", "pixel_head"].includes((session?.user as any)?.role)
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-red-500/20 bg-red-500/10">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <p className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-widest">
          Access Denied
        </p>
      </div>
    </div>
  );
}
