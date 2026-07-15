"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface LayoutContextType {
  isRightPanelCollapsed: boolean;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const SIDEBAR_COLLAPSE_STORAGE_KEY = "sankalp:sidebar-collapsed";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
    if (stored !== null) setIsSidebarCollapsed(stored === "true");
  }, []);

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <LayoutContext.Provider
      value={{
        isRightPanelCollapsed,
        setIsRightPanelCollapsed,
        isSidebarCollapsed,
        toggleSidebarCollapsed,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
