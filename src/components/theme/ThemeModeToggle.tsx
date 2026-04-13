"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "pixel-platform-theme";
const MODES: ThemeMode[] = ["light", "dark", "system"];

function getSystemTheme(): Exclude<ThemeMode, "system"> {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  const resolved = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

const MODE_META: Record<ThemeMode, { label: string; Icon: typeof Sun }> = {
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  system: { label: "System", Icon: Monitor },
};

export default function ThemeModeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const initialMode = readStoredMode();
    setMode(initialMode);
    applyTheme(initialMode);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      const nextMode = readStoredMode();
      if (nextMode === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", onMediaChange);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const nextMode = readStoredMode();
      setMode(nextMode);
      applyTheme(nextMode);
    };

    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const activeLabel = useMemo(() => {
    if (mode === "system") {
      return `System (${getSystemTheme()})`;
    }

    return mode[0].toUpperCase() + mode.slice(1);
  }, [mode]);

  const setThemeMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted">Theme</p>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-border-subtle bg-surface-alt p-1">
        {MODES.map((candidate) => {
          const { Icon, label } = MODE_META[candidate];
          const isActive = mode === candidate;
          return (
            <button
              key={candidate}
              type="button"
              onClick={() => setThemeMode(candidate)}
              className={`rounded-md px-2 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] hover:text-foreground"
              }`}
              aria-label={`Switch theme to ${label}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted">Active: {activeLabel}</p>
    </div>
  );
}
