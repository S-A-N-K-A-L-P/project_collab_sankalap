"use client";

import { createTheme, alpha } from "@mui/material/styles";

/* ============================================================================
   MUI Theme — tuned to match our Madhyam AI SaaS design tokens.
   Pairs with globals.css. Used by <MuiThemeProvider> in Providers.tsx.
   ========================================================================= */

const PRIMARY_DARK    = "#857BF0";    // matches --primary dark
const PRIMARY_LIGHT   = "#6257E8";    // matches --primary light
const SECONDARY_LIGHT = "#9A8AEF";    // matches --secondary light
const SECONDARY_DARK  = "#9A8AEF";    // matches --secondary dark

// ─── DARK ────────────────────────────────────────────────────────────────────

export const muiDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main:  PRIMARY_DARK,
      dark:  "#6257E8",
      light: "#A49BF5",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: SECONDARY_DARK,
      contrastText: "#0F111A",
    },
    success: { main: "#20B981", contrastText: "#0F111A" },
    info:    { main: "#857BF0", contrastText: "#FFFFFF" },
    warning: { main: "#F59E0B", contrastText: "#0F111A" },
    error:   { main: "#EF4444", contrastText: "#FFFFFF" },
    background: {
      default: "#0F111A",
      paper:   "#171A28",
    },
    text: {
      primary:   "#F2F3F8",
      secondary: "#9496A8",
      disabled:  "#686B7E",
    },
    divider: "rgba(255, 255, 255, 0.08)",
    action: {
      hover:              "rgba(255, 255, 255, 0.05)",
      selected:           alpha(PRIMARY_DARK, 0.16),
      disabledBackground: "rgba(255, 255, 255, 0.04)",
      focus:              alpha(PRIMARY_DARK, 0.22),
    },
  },
  typography: {
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    h1:   { fontWeight: 600, letterSpacing: "-0.022em" },
    h2:   { fontWeight: 600, letterSpacing: "-0.022em" },
    h3:   { fontWeight: 600, letterSpacing: "-0.022em" },
    h4:   { fontWeight: 600, letterSpacing: "-0.02em" },
    h5:   { fontWeight: 600, letterSpacing: "-0.018em" },
    h6:   { fontWeight: 600, letterSpacing: "-0.012em" },
    body1: { letterSpacing: "-0.011em" },
    body2: { letterSpacing: "-0.011em" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "-0.01em" },
  },
  shape: { borderRadius: 14 },
  shadows: [
    "none",
    "0 1px 3px 0 rgba(0,0,0,0.35)",
    "0 2px 10px -2px rgba(0,0,0,0.45), 0 1px 3px 0 rgba(0,0,0,0.30)",
    "0 4px 14px -3px rgba(0,0,0,0.48), 0 2px 5px -1px rgba(0,0,0,0.32)",
    "0 6px 18px -4px rgba(0,0,0,0.50), 0 2px 6px -1px rgba(0,0,0,0.35)",
    "0 8px 22px -5px rgba(0,0,0,0.52), 0 3px 8px -2px rgba(0,0,0,0.36)",
    "0 10px 25px -5px rgba(0,0,0,0.54), 0 4px 10px -2px rgba(0,0,0,0.38)",
    "0 12px 28px -6px rgba(0,0,0,0.56), 0 4px 10px -2px rgba(0,0,0,0.40)",
    "0 14px 32px -7px rgba(0,0,0,0.58), 0 5px 12px -3px rgba(0,0,0,0.40)",
    "0 16px 36px -8px rgba(0,0,0,0.60), 0 6px 14px -3px rgba(0,0,0,0.42)",
    "0 18px 40px -9px rgba(0,0,0,0.62), 0 7px 16px -4px rgba(0,0,0,0.44)",
    "0 20px 42px -10px rgba(0,0,0,0.63), 0 8px 16px -4px rgba(0,0,0,0.45)",
    "0 22px 44px -10px rgba(0,0,0,0.64), 0 8px 18px -5px rgba(0,0,0,0.46)",
    "0 24px 48px -11px rgba(0,0,0,0.65), 0 9px 20px -5px rgba(0,0,0,0.47)",
    "0 26px 52px -12px rgba(0,0,0,0.66), 0 10px 22px -6px rgba(0,0,0,0.48)",
    "0 28px 56px -13px rgba(0,0,0,0.67), 0 11px 24px -6px rgba(0,0,0,0.49)",
    "0 30px 60px -14px rgba(0,0,0,0.68), 0 12px 26px -7px rgba(0,0,0,0.50)",
    "0 32px 64px -15px rgba(0,0,0,0.69), 0 13px 28px -7px rgba(0,0,0,0.51)",
    "0 34px 68px -16px rgba(0,0,0,0.70), 0 14px 30px -8px rgba(0,0,0,0.52)",
    "0 36px 72px -17px rgba(0,0,0,0.71), 0 15px 32px -8px rgba(0,0,0,0.53)",
    "0 38px 76px -18px rgba(0,0,0,0.72), 0 16px 34px -9px rgba(0,0,0,0.54)",
    "0 40px 80px -19px rgba(0,0,0,0.73), 0 17px 36px -9px rgba(0,0,0,0.55)",
    "0 42px 84px -20px rgba(0,0,0,0.74), 0 18px 38px -10px rgba(0,0,0,0.56)",
    "0 44px 88px -21px rgba(0,0,0,0.75), 0 19px 40px -10px rgba(0,0,0,0.57)",
    "0 46px 92px -22px rgba(0,0,0,0.76), 0 20px 42px -11px rgba(0,0,0,0.58)",
  ] as any,
  components: {
    MuiPaper: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: { backgroundImage: "none", borderRadius: 16 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: {
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage: "none",
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600, paddingLeft: 16, paddingRight: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2.5, borderRadius: "3px 3px 0 0" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none", fontWeight: 600, fontSize: 13.5, minHeight: 44,
          letterSpacing: "-0.01em",
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
      main:  PRIMARY_LIGHT,                  // #6257E8
      dark:  "#5246D9",
      light: "#9A8AEF",
      contrastText: "#FFFFFF",
    },
    secondary: { main: SECONDARY_LIGHT, contrastText: "#171827" },
    success:   { main: "#20B981", contrastText: "#FFFFFF" },
    info:      { main: "#6257E8", contrastText: "#FFFFFF" },
    warning:   { main: "#F59E0B", contrastText: "#FFFFFF" },
    error:     { main: "#EF4444", contrastText: "#FFFFFF" },
    background: {
      default: "#F5F5F8",                    // Neutral light background
      paper:   "#FFFFFF",                    // Clean white surfaces
    },
    text: {
      primary:   "#171827",                  // Deep ink primary text
      secondary: "#737586",                  // Muted slate secondary text
      disabled:  "#9E9FAF",
    },
    divider: "#E8E8EF",                      // Thin low-contrast border
    action: {
      hover:              "rgba(23, 24, 39, 0.035)",
      selected:           "#EEECFF",
      disabledBackground: "rgba(23, 24, 39, 0.04)",
      focus:              "rgba(98, 87, 232, 0.16)",
    },
  },
  shadows: [
    "none",
    "0 1px 3px 0 rgba(23, 24, 39, 0.04), 0 1px 2px -1px rgba(23, 24, 39, 0.02)",
    "0 2px 10px -2px rgba(23, 24, 39, 0.05), 0 1px 3px 0 rgba(23, 24, 39, 0.03)",
    "0 4px 14px -3px rgba(23, 24, 39, 0.06), 0 2px 4px -2px rgba(23, 24, 39, 0.03)",
    "0 6px 18px -4px rgba(23, 24, 39, 0.07), 0 2px 6px -2px rgba(23, 24, 39, 0.04)",
    "0 8px 22px -4px rgba(23, 24, 39, 0.08), 0 3px 8px -3px rgba(23, 24, 39, 0.04)",
    "0 10px 25px -5px rgba(23, 24, 39, 0.08), 0 4px 10px -4px rgba(23, 24, 39, 0.04)",
    "0 12px 28px -6px rgba(23, 24, 39, 0.09), 0 4px 10px -4px rgba(23, 24, 39, 0.04)",
    "0 14px 30px -6px rgba(23, 24, 39, 0.09), 0 5px 12px -4px rgba(23, 24, 39, 0.05)",
    "0 16px 34px -7px rgba(23, 24, 39, 0.10), 0 6px 14px -5px rgba(23, 24, 39, 0.05)",
    "0 18px 36px -8px rgba(23, 24, 39, 0.10), 0 7px 14px -5px rgba(23, 24, 39, 0.05)",
    "0 20px 38px -8px rgba(23, 24, 39, 0.11), 0 8px 16px -6px rgba(23, 24, 39, 0.05)",
    "0 22px 40px -9px rgba(23, 24, 39, 0.11), 0 8px 16px -6px rgba(23, 24, 39, 0.06)",
    "0 24px 44px -10px rgba(23, 24, 39, 0.12), 0 9px 18px -6px rgba(23, 24, 39, 0.06)",
    "0 26px 48px -10px rgba(23, 24, 39, 0.12), 0 10px 20px -7px rgba(23, 24, 39, 0.06)",
    "0 28px 50px -11px rgba(23, 24, 39, 0.12), 0 11px 22px -7px rgba(23, 24, 39, 0.06)",
    "0 30px 54px -12px rgba(23, 24, 39, 0.13), 0 12px 24px -8px rgba(23, 24, 39, 0.06)",
    "0 32px 58px -12px rgba(23, 24, 39, 0.13), 0 13px 26px -8px rgba(23, 24, 39, 0.07)",
    "0 34px 60px -13px rgba(23, 24, 39, 0.14), 0 14px 28px -9px rgba(23, 24, 39, 0.07)",
    "0 36px 64px -14px rgba(23, 24, 39, 0.14), 0 15px 30px -9px rgba(23, 24, 39, 0.07)",
    "0 38px 68px -14px rgba(23, 24, 39, 0.15), 0 16px 32px -10px rgba(23, 24, 39, 0.07)",
    "0 40px 72px -15px rgba(23, 24, 39, 0.15), 0 17px 34px -10px rgba(23, 24, 39, 0.08)",
    "0 42px 76px -16px rgba(23, 24, 39, 0.16), 0 18px 36px -11px rgba(23, 24, 39, 0.08)",
    "0 44px 80px -16px rgba(23, 24, 39, 0.16), 0 19px 38px -11px rgba(23, 24, 39, 0.08)",
    "0 46px 84px -17px rgba(23, 24, 39, 0.17), 0 20px 40px -12px rgba(23, 24, 39, 0.08)",
  ] as any,
  components: {
    MuiPaper: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: { backgroundImage: "none", borderRadius: 16 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: {
          border: "1px solid #E8E8EF",
          backgroundImage: "none",
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600, paddingLeft: 16, paddingRight: 16 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2.5, borderRadius: "3px 3px 0 0" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, fontSize: 13.5, minHeight: 44, letterSpacing: "-0.01em" },
      },
    },
  },
});
