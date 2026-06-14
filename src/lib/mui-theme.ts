"use client";

import { createTheme, alpha } from "@mui/material/styles";

/* ============================================================================
   MUI Theme — tuned to match our shadcn/Tailwind tokens.
   Pairs with globals.css. Used by <MuiThemeProvider> in Providers.tsx.
   ========================================================================= */

const PRIMARY_DARK   = "#818cf8";    // indigo-400 (brighter for dark bg)
const PRIMARY_LIGHT  = "#4f46e5";    // indigo-600 (matches HTML reference)
const SECONDARY      = "#ec4899";    // pink-500 (used rarely)
const TERTIARY       = "#14b8a6";    // teal-500

// ─── DARK ────────────────────────────────────────────────────────────────────

export const muiDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main:  PRIMARY_DARK,
      dark:  "#6c61d4",
      light: "#a39bf3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: SECONDARY,
      contrastText: "#ffffff",
    },
    success: { main: "#4CAF50", contrastText: "#ffffff" },
    info:    { main: "#42A5F5", contrastText: "#ffffff" },
    warning: { main: "#FFA726", contrastText: "#131319" },
    error:   { main: "#EF5350", contrastText: "#ffffff" },
    background: {
      default: "#131319",
      paper:   "#20202a",
    },
    text: {
      primary:   "#ececf1",
      secondary: "#b0b3bd",
      disabled:  "#6b6e78",
    },
    divider: "rgba(255, 255, 255, 0.10)",
    action: {
      hover:           "rgba(255, 255, 255, 0.06)",
      selected:        alpha(PRIMARY_DARK, 0.16),
      disabledBackground: "rgba(255, 255, 255, 0.04)",
      focus:           alpha(PRIMARY_DARK, 0.20),
    },
  },
  typography: {
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    h1:   { fontWeight: 600, letterSpacing: "-0.02em" },
    h2:   { fontWeight: 600, letterSpacing: "-0.02em" },
    h3:   { fontWeight: 600, letterSpacing: "-0.02em" },
    h4:   { fontWeight: 600, letterSpacing: "-0.02em" },
    h5:   { fontWeight: 600, letterSpacing: "-0.02em" },
    h6:   { fontWeight: 600, letterSpacing: "-0.01em" },
    body1: { letterSpacing: "-0.01em" },
    body2: { letterSpacing: "-0.01em" },
    button: { textTransform: "none", fontWeight: 500, letterSpacing: 0 },
  },
  shape: { borderRadius: 8 },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.02)",
    "0 2px 4px -1px rgba(0,0,0,0.50), 0 4px 8px -2px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.04)",
    "0 3px 6px -1px rgba(0,0,0,0.52), 0 6px 12px -3px rgba(0,0,0,0.42), inset 0 1px 0 0 rgba(255,255,255,0.05)",
    "0 4px 8px -2px rgba(0,0,0,0.55), 0 8px 16px -4px rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.05)",
    "0 5px 10px -2px rgba(0,0,0,0.55), 0 10px 20px -4px rgba(0,0,0,0.46), inset 0 1px 0 0 rgba(255,255,255,0.05)",
    "0 6px 12px -3px rgba(0,0,0,0.57), 0 12px 24px -5px rgba(0,0,0,0.46), inset 0 1px 0 0 rgba(255,255,255,0.06)",
    "0 7px 14px -3px rgba(0,0,0,0.58), 0 14px 28px -6px rgba(0,0,0,0.47), inset 0 1px 0 0 rgba(255,255,255,0.06)",
    "0 8px 16px -4px rgba(0,0,0,0.60), 0 16px 32px -8px rgba(0,0,0,0.50), inset 0 1px 0 0 rgba(255,255,255,0.06)",
    "0 9px 18px -4px rgba(0,0,0,0.60), 0 18px 36px -8px rgba(0,0,0,0.50), inset 0 1px 0 0 rgba(255,255,255,0.06)",
    "0 10px 20px -4px rgba(0,0,0,0.62), 0 20px 40px -10px rgba(0,0,0,0.51), inset 0 1px 0 0 rgba(255,255,255,0.07)",
    "0 11px 22px -5px rgba(0,0,0,0.62), 0 22px 44px -10px rgba(0,0,0,0.52), inset 0 1px 0 0 rgba(255,255,255,0.07)",
    "0 12px 24px -5px rgba(0,0,0,0.63), 0 24px 48px -10px rgba(0,0,0,0.52), inset 0 1px 0 0 rgba(255,255,255,0.07)",
    "0 13px 26px -6px rgba(0,0,0,0.64), 0 26px 52px -12px rgba(0,0,0,0.53), inset 0 1px 0 0 rgba(255,255,255,0.07)",
    "0 14px 28px -6px rgba(0,0,0,0.65), 0 28px 56px -12px rgba(0,0,0,0.53), inset 0 1px 0 0 rgba(255,255,255,0.07)",
    "0 15px 30px -7px rgba(0,0,0,0.66), 0 30px 60px -14px rgba(0,0,0,0.54), inset 0 1px 0 0 rgba(255,255,255,0.08)",
    "0 16px 32px -8px rgba(0,0,0,0.68), 0 32px 64px -16px rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.08)",
    "0 17px 34px -8px rgba(0,0,0,0.69), 0 34px 68px -16px rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.08)",
    "0 18px 36px -9px rgba(0,0,0,0.70), 0 36px 72px -18px rgba(0,0,0,0.56), inset 0 1px 0 0 rgba(255,255,255,0.08)",
    "0 19px 38px -9px rgba(0,0,0,0.71), 0 38px 76px -18px rgba(0,0,0,0.56), inset 0 1px 0 0 rgba(255,255,255,0.08)",
    "0 20px 40px -10px rgba(0,0,0,0.72), 0 40px 80px -20px rgba(0,0,0,0.57), inset 0 1px 0 0 rgba(255,255,255,0.09)",
    "0 21px 42px -10px rgba(0,0,0,0.73), 0 42px 84px -20px rgba(0,0,0,0.57), inset 0 1px 0 0 rgba(255,255,255,0.09)",
    "0 22px 44px -11px rgba(0,0,0,0.74), 0 44px 88px -22px rgba(0,0,0,0.58), inset 0 1px 0 0 rgba(255,255,255,0.09)",
    "0 23px 46px -11px rgba(0,0,0,0.75), 0 46px 92px -22px rgba(0,0,0,0.58), inset 0 1px 0 0 rgba(255,255,255,0.09)",
    "0 24px 48px -12px rgba(0,0,0,0.76), 0 48px 96px -24px rgba(0,0,0,0.59), inset 0 1px 0 0 rgba(255,255,255,0.10)",
  ] as any,
  components: {
    MuiPaper: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: false },
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500, paddingLeft: 16, paddingRight: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 6 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: "3px 3px 0 0" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none", fontWeight: 500, fontSize: 14, minHeight: 48,
          letterSpacing: 0,
        },
      },
    },
  },
});

// ─── LIGHT ───────────────────────────────────────────────────────────────────

export const muiLightTheme = createTheme({
  ...muiDarkTheme,
  palette: {
    mode: "light",
    primary: {
      main:  PRIMARY_LIGHT,                  // indigo-600 #4f46e5
      dark:  "#4338ca",                      // indigo-700
      light: "#6366f1",                      // indigo-500
      contrastText: "#ffffff",
    },
    secondary: { main: SECONDARY, contrastText: "#ffffff" },
    success:   { main: "#15803d", contrastText: "#ffffff" }, // green-700
    info:      { main: "#1d4ed8", contrastText: "#ffffff" }, // blue-700
    warning:   { main: "#b45309", contrastText: "#ffffff" }, // amber-700
    error:     { main: "#b91c1c", contrastText: "#ffffff" }, // red-700
    background: {
      default: "#f3f4f6",                    // gray-100 — matches HTML reference
      paper:   "#ffffff",                    // pure white cards
    },
    text: {
      primary:   "#111827",                  // gray-900
      secondary: "#6b7280",                  // gray-500
      disabled:  "#9ca3af",                  // gray-400
    },
    divider: "#e5e7eb",                      // gray-200 (solid, not transparent)
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0,0,0,0.04)",
    "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
    "0 2px 4px -1px rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
    "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)",
    "0 6px 10px -2px rgba(0,0,0,0.09), 0 2px 6px -2px rgba(0,0,0,0.06)",
    "0 8px 14px -3px rgba(0,0,0,0.10), 0 3px 8px -3px rgba(0,0,0,0.06)",
    "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.06)",
    "0 12px 18px -4px rgba(0,0,0,0.11), 0 5px 8px -4px rgba(0,0,0,0.06)",
    "0 14px 22px -5px rgba(0,0,0,0.12), 0 6px 10px -5px rgba(0,0,0,0.07)",
    "0 16px 24px -6px rgba(0,0,0,0.12), 0 7px 12px -6px rgba(0,0,0,0.07)",
    "0 18px 28px -7px rgba(0,0,0,0.13), 0 8px 14px -7px rgba(0,0,0,0.07)",
    "0 20px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.06)",
    "0 22px 28px -6px rgba(0,0,0,0.13), 0 9px 12px -7px rgba(0,0,0,0.07)",
    "0 24px 32px -7px rgba(0,0,0,0.13), 0 10px 14px -8px rgba(0,0,0,0.07)",
    "0 25px 35px -8px rgba(0,0,0,0.14), 0 11px 16px -9px rgba(0,0,0,0.08)",
    "0 26px 38px -9px rgba(0,0,0,0.14), 0 12px 18px -10px rgba(0,0,0,0.08)",
    "0 28px 42px -10px rgba(0,0,0,0.15), 0 13px 20px -11px rgba(0,0,0,0.08)",
    "0 30px 45px -11px rgba(0,0,0,0.15), 0 14px 22px -12px rgba(0,0,0,0.09)",
    "0 32px 48px -12px rgba(0,0,0,0.16), 0 15px 24px -13px rgba(0,0,0,0.09)",
    "0 34px 52px -13px rgba(0,0,0,0.16), 0 16px 26px -14px rgba(0,0,0,0.09)",
    "0 36px 56px -14px rgba(0,0,0,0.17), 0 17px 28px -15px rgba(0,0,0,0.10)",
    "0 38px 60px -15px rgba(0,0,0,0.17), 0 18px 30px -16px rgba(0,0,0,0.10)",
    "0 40px 64px -16px rgba(0,0,0,0.18), 0 19px 32px -17px rgba(0,0,0,0.10)",
    "0 42px 68px -17px rgba(0,0,0,0.18), 0 20px 34px -18px rgba(0,0,0,0.11)",
  ] as any,
  components: {
    MuiPaper: {
      defaultProps: { elevation: 1 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: { border: 0, backgroundImage: "none" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, paddingLeft: 16, paddingRight: 16 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 999 } },  // fully rounded pill
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: "3px 3px 0 0" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500, fontSize: 14, minHeight: 48, letterSpacing: 0 },
      },
    },
  },
});
