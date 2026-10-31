export function formatIsoDate(value: string | Date | null | undefined, fallback = "unknown-date"): string {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().split("T")[0];
}

export function formatIsoTime(value: string | Date | null | undefined, fallback = "--:--"): string {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(11, 16);
}

export function formatIsoYear(value: string | Date | null | undefined, fallback = "unknown-year"): string {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 4);
}