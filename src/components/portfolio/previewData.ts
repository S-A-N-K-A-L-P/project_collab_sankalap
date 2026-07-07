import type { PortfolioData } from "./PortfolioRenderer";

/**
 * Build the renderer's `PortfolioData` from a portfolio doc + user + the list
 * of projects the user can feature. Shared by the in-editor live preview and
 * the standalone /portfolio/preview route so the projects-resolution logic
 * (featured ids → fallback to completed) lives in exactly one place.
 */
export function buildPreviewData(
  cfg: any,
  user: any,
  available: any[],
): PortfolioData | null {
  if (!cfg) return null;

  const projSection = (cfg.sections || []).find((s: any) => s.type === "projects");
  const ids: string[] = projSection?.content?.ids || [];

  let projects: any[];
  if (ids.length) {
    const byId = new Map((available || []).map((p: any) => [p._id, p]));
    projects = ids.map((id) => byId.get(id)).filter(Boolean);
  } else {
    projects = (available || []).filter((p: any) => p.status === "completed").slice(0, 6);
  }

  return { ...cfg, user, projects };
}
