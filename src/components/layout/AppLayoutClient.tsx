"use client";

import React from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { useLayout } from "@/context/LayoutContext";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isRightPanelCollapsed } = useLayout();

  return (
    <div className="flex min-h-screen bg-[var(--background-primary)] text-[var(--foreground)] font-sans antialiased">
      {/* Left Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex justify-center transition-all duration-300">
        <div className={`w-full transition-all duration-300 ${
          isRightPanelCollapsed 
            ? "max-w-7xl p-6 lg:p-8" 
            : "max-w-4xl p-6 lg:p-8"
        }`}>
          {children}
        </div>
      </main>

      {/* Right Intelligence Panel - Sticky (Collapsible) */}
      <div className={`transition-all duration-300 ease-in-out ${
        isRightPanelCollapsed 
          ? "w-0 opacity-0 overflow-hidden pointer-events-none hidden xl:hidden" 
          : "w-80 opacity-100 block"
      }`}>
        <RightPanel />
      </div>
    </div>
  );
}
