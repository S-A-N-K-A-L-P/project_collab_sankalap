"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Bell,
  User,
  Settings,
  ShieldCheck,
  ListChecks,
  Lightbulb,
  Zap,
  LogOut
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import ThemeModeToggle from "@/components/theme/ThemeModeToggle";

import ThemeModeToggle from "@/components/theme/ThemeModeToggle";

const navigation = [
  {
    group: "Primary", items: [
      { name: "Feed", href: "/feed", icon: Home },
      { name: "My Ideas", href: "/ideas", icon: Lightbulb },
      { name: "Discover", href: "/discover", icon: Search },
    ]
  },
  {
    group: "Network", items: [
      { name: "Notifications", href: "/notifications", icon: Bell },
    ]
  },
  {
    group: "Personal", items: [
      { name: "Profile", href: "/profile", icon: User, dynamic: true },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userProfileHref = session?.user ? `/profile/${(session.user as any).id}` : "/login";

  return (
    <aside className="h-screen sticky top-0 flex flex-col bg-surface border-r border-border-subtle w-65 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white shadow-[0_0_18px_var(--accent-glow)]">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <span className="font-bold text-foreground tracking-tight text-lg">Pixel Platform</span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-8 mt-2">
        {navigation.map((group) => (
          <div key={group.group}>
            <h3 className="px-3 text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
              {group.group}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const href = item.dynamic ? userProfileHref : item.href;
                const isActive = pathname === href || (item.dynamic && pathname.startsWith("/profile/"));

                return (
                  <Link
                    key={item.name}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group relative ${isActive
                      ? "text-foreground bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
                      : "text-muted hover:text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)]"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-0.5 h-4 bg-accent rounded-full shadow-[0_0_12px_var(--accent-glow)]" />
                    )}
                    <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                      }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin Section */}
        {session?.user && (session.user as any).role === "pixel_head" && (
          <div>
            <h3 className="px-3 text-[10px] font-bold text-muted uppercase tracking-wider mb-2">System</h3>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group relative ${pathname === "/admin"
                ? "text-foreground bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
                : "text-muted hover:text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)]"
                }`}
            >
              {pathname === "/admin" && (
                <div className="absolute left-0 w-0.5 h-4 bg-accent rounded-full shadow-[0_0_12px_var(--accent-glow)]" />
              )}
              <ShieldCheck className={`w-4 h-4 ${pathname === "/admin" ? "text-accent" : "text-muted group-hover:text-foreground"}`} />
              Control Room
            </Link>
            <Link
              href="/admin/projects"
              className={`mt-1 flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group relative ${pathname.startsWith("/admin/projects")
                ? "text-foreground bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
                : "text-muted hover:text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)]"
                }`}
            >
              {pathname.startsWith("/admin/projects") && (
                <div className="absolute left-0 w-0.5 h-4 bg-accent rounded-full shadow-[0_0_12px_var(--accent-glow)]" />
              )}
              <ListChecks className={`w-4 h-4 ${pathname.startsWith("/admin/projects") ? "text-accent" : "text-muted group-hover:text-foreground"}`} />
              Project Progress
            </Link>
          </div>
        )}
      </nav>

      {/* Profile Card Fixed at Bottom */}
      <div className="p-4 border-t border-border-subtle mt-auto">
        <ThemeModeToggle />
        <Link
          href={userProfileHref}
          className="mt-3 flex items-center gap-3 p-2 hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] rounded-xl transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-surface-alt border border-border-strong flex items-center justify-center text-[13px] font-black text-foreground uppercase overflow-hidden">
            {session?.user?.image ? (
              <Image src={session.user.image} alt="" width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.[0] || '?'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-foreground truncate tracking-tight">{session?.user?.name || "Guest Node"}</p>
            <p className="text-[10px] font-mono font-medium text-muted truncate uppercase tracking-tight">
              {(session?.user as any)?.role?.replace('_', ' ') || "unverified"}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-[12px] font-semibold text-muted transition-all hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        <div className="mt-3">
          <ThemeModeToggle />
        </div>
      </div>
    </aside>
  );
}
