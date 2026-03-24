"use client";

import Link from "next/link";
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
    <aside className="h-screen sticky top-0 flex flex-col bg-[#121214] border-r border-[#1f1f23] w-[260px] overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center text-white shadow-sm">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <span className="font-bold text-[#e5e7eb] tracking-tight text-lg">Pixel Platform</span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-8 mt-2">
        {navigation.map((group) => (
          <div key={group.group}>
            <h3 className="px-3 text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">
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
                      ? "text-[#e5e7eb] bg-white/[0.03]"
                      : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-white/[0.02]"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-0.5 h-4 bg-[#6366f1] rounded-full" />
                    )}
                    <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#6366f1]" : "text-[#9ca3af] group-hover:text-[#e5e7eb]"
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
            <h3 className="px-3 text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">System</h3>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group relative ${pathname === "/admin"
                ? "text-[#e5e7eb] bg-white/[0.03]"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-white/[0.02]"
                }`}
            >
              {pathname === "/admin" && (
                <div className="absolute left-0 w-0.5 h-4 bg-[#6366f1] rounded-full" />
              )}
              <ShieldCheck className={`w-4 h-4 ${pathname === "/admin" ? "text-[#6366f1]" : "text-[#9ca3af] group-hover:text-[#e5e7eb]"}`} />
              Control Room
            </Link>
            <Link
              href="/admin/projects"
              className={`mt-1 flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group relative ${pathname.startsWith("/admin/projects")
                ? "text-[#e5e7eb] bg-white/[0.03]"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-white/[0.02]"
                }`}
            >
              {pathname.startsWith("/admin/projects") && (
                <div className="absolute left-0 w-0.5 h-4 bg-[#6366f1] rounded-full" />
              )}
              <ListChecks className={`w-4 h-4 ${pathname.startsWith("/admin/projects") ? "text-[#6366f1]" : "text-[#9ca3af] group-hover:text-[#e5e7eb]"}`} />
              Project Progress
            </Link>
          </div>
        )}
      </nav>

      {/* Profile Card Fixed at Bottom */}
      <div className="p-4 border-t border-[#1f1f23] mt-auto">
        <Link
          href={userProfileHref}
          className="flex items-center gap-3 p-2 hover:bg-white/[0.02] rounded-xl transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-[#1f1f23] border border-[#2a2a2f] flex items-center justify-center text-[13px] font-black text-[#e5e7eb] uppercase overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.[0] || '?'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#e5e7eb] truncate tracking-tight">{session?.user?.name || "Guest Node"}</p>
            <p className="text-[10px] font-mono font-medium text-[#9ca3af] truncate uppercase tracking-tight">
              {(session?.user as any)?.role?.replace('_', ' ') || "unverified"}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-[#2a2a2f] px-3 py-2 text-[12px] font-semibold text-[#9ca3af] transition-all hover:bg-white/[0.03] hover:text-[#e5e7eb]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
