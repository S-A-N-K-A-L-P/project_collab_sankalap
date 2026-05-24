"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/proposals", label: "Proposals", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border-subtle flex flex-col z-30">
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest truncate">
              Pixel Platform
            </p>
            <p className="text-[13px] font-bold text-foreground tracking-tight">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all group ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-accent/5 hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive
                    ? "text-accent"
                    : "text-muted group-hover:text-foreground"
                }`}
              />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-accent" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-subtle space-y-3">
        {session?.user && (
          <div className="px-3 py-2.5 rounded-xl bg-background space-y-0.5">
            <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest truncate">
              {session.user.email}
            </p>
            <p className="text-[11px] font-bold text-accent uppercase tracking-wider">
              {(session.user as any).role}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
