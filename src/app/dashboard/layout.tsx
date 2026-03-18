"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Loader2, 
  Menu, 
  X, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Search,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const role = (session?.user as any)?.role;
  const isAdmin = role === "pixel_head";

  const navItems = [
    { name: "Feed", href: "/proposals", icon: Layers }, 
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "My Ideas", href: "/dashboard", icon: LayoutDashboard }, 
    { name: "My Profile", href: `/user/${(session?.user as any)?.id}`, icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.splice(2, 0, { name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 transform lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:relative"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 justify-between border-b border-slate-50 dark:border-slate-800/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">
                PIXEL
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1.5 text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`flex-shrink-0 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"} ${isActive ? "text-white" : "text-slate-400 group-hover:text-current"}`} />
                {!isCollapsed && <span className="font-semibold text-sm tracking-tight">{item.name}</span>}
                {isActive && isCollapsed && (
                    <motion.div layoutId="activePill" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Profile Card Fixed at Bottom */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800/50">
          {!isCollapsed ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                {session?.user?.name?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate capitalize">{session?.user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{role?.replace('_', ' ')}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                    {session?.user?.name?.[0].toUpperCase()}
                </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-bold text-sm ${isCollapsed ? "px-0" : ""}`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between transition-all sticky top-0 z-40">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search proposals, members, or projects..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                />
              </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl relative transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col items-end px-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{session?.user?.name}</p>
                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest leading-none mt-0.5">Verified</p>
            </div>
          </div>
        </header>

        {/* Content Viewbox */}
        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
