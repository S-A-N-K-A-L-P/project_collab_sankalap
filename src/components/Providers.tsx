"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LayoutProvider } from "@/context/LayoutContext";

// Temporary workaround for React 19 / Next.js 15 warning caused by next-themes injecting a script tag.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="pixel-platform-theme"
      disableTransitionOnChange
    >
      <LayoutProvider>
        <SessionProvider>{children}</SessionProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
