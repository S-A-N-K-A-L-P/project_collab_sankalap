"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "User Management",
  "/admin/proposals": "Proposal Management",
};

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [key, val] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key + "/")) return val;
  }
  return "Admin";
}

export default function AdminHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur border-b border-border-subtle px-8 py-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">
          Admin / {title}
        </p>
        <h1 className="text-xl font-bold text-foreground tracking-tight mt-0.5">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-accent/10 text-muted hover:text-accent transition-all">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
