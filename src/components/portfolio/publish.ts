/**
 * Draft → Published model.
 *
 * The portfolio document stores the live *draft* at the top level (what the
 * builder autosaves on every keystroke). A snapshot of the publishable fields
 * is copied into `published` only when the user clicks "Republish" — that
 * snapshot is what the public /portfolio/[handle] page renders. This gives a
 * git-style commit flow: edit freely, then push when ready.
 *
 * Shared by client (dirty detection) and server (snapshotting) so the two can
 * never drift on *which* fields count as a publishable change.
 */
export const PUBLISHABLE_KEYS = [
  "themeId", "accent", "accent2", "card", "sectionAnim", "projectCardStyle", "projectCardAnim",
  "bgOverride", "threeOverride", "heavy3d",
  "headline", "tagline", "aboutLong",
  "sections", "featuredProjectIds", "experience", "links", "seo",
] as const;

/** Pick only the publishable fields from a draft/published object. */
export function snapshotPublishable(src: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!src) return out;
  for (const k of PUBLISHABLE_KEYS) out[k] = src[k];
  return out;
}

/** Recursively sort object keys so key-order never triggers a false "dirty". */
function stable(v: any): any {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === "object") {
    return Object.keys(v).sort().reduce((acc: Record<string, any>, k) => {
      acc[k] = stable(v[k]);
      return acc;
    }, {});
  }
  return v;
}

/** Order-independent fingerprint of the publishable content. */
export function publishFingerprint(src: any): string {
  return JSON.stringify(stable(snapshotPublishable(src)));
}

/** True when the draft has publishable changes not yet in `published`. */
export function hasUnpublishedChanges(draft: any, published: any): boolean {
  if (!draft) return false;
  if (!published) return true; // never published → treat as needing a publish
  return publishFingerprint(draft) !== publishFingerprint(published);
}
