"use client";

import React, { createContext, useContext, useState } from "react";

interface LayoutContextType {
  isRightPanelCollapsed: boolean;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  return (
    <LayoutContext.Provider value={{ isRightPanelCollapsed, setIsRightPanelCollapsed }}>
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
