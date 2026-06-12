"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LayoutProvider } from "@/context/LayoutContext";
import { muiDarkTheme, muiLightTheme } from "@/lib/mui-theme";
import { useEffect, useState } from "react";

// React 19 / Next 15 next-themes warning suppression
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
    originalError.apply(console, args);
  };
}

/**
 * Bridges next-themes' `data-theme` attribute → MUI's ThemeProvider so MUI
 * components automatically follow our dark/light toggle.
 */
function MuiBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Default to light (matches HTML reference); switch only when explicitly dark
  const theme = mounted && resolvedTheme === "dark" ? muiDarkTheme : muiLightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      storageKey="pixel-platform-theme"
      disableTransitionOnChange
    >
      <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: false }}>
        <MuiBridge>
          <LayoutProvider>
            <SessionProvider>{children}</SessionProvider>
          </LayoutProvider>
        </MuiBridge>
      </AppRouterCacheProvider>
    </NextThemesProvider>
  );
}
