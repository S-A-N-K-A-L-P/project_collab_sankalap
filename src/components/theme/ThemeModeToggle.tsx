"use client";

import { useEffect, useState, type ComponentType } from "react";

import { Monitor, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { isThemeMode, type ThemeMode } from "@/lib/theme";

const options: Array<{ value: ThemeMode; label: string; icon: ComponentType<{ className?: string }> }> = [
  { value: "light", label: "Light", icon: SunMedium },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme && isThemeMode(theme)) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  const activeTheme = mounted ? selectedTheme : "system";

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-1 shadow-sm" role="radiogroup" aria-label="Theme mode">
      <div className="grid grid-cols-3 gap-1">
        {options.map(({ value, label, icon: Icon }) => {
          const isActive = activeTheme === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={label}
              onClick={() => {
                setSelectedTheme(value);
                setTheme(value);
              }}
              className={`flex h-10 min-w-0 items-center justify-center rounded-lg border text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive
                ? "border-accent bg-accent/10 text-foreground shadow-[0_0_0_1px_var(--accent-glow)]"
                : "border-transparent text-muted hover:border-border-subtle hover:bg-surface-alt hover:text-foreground"
                }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
