export const THEME_STORAGE_KEY = "pixel-platform-theme";

export const THEME_MODES = ["light", "dark", "system"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: string): value is ThemeMode {
    return THEME_MODES.includes(value as ThemeMode);
}