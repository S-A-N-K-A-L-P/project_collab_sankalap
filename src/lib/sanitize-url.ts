/**
 * URL sanitizers for user-supplied portfolio content (links, project URLs,
 * image sources). Portfolio sections store free-form content that renders
 * directly into `href`/`src` attributes, so a stored `javascript:` URL
 * would execute in a visitor's browser on click. These strip control
 * characters (which browsers ignore when parsing a URL scheme, a classic
 * filter-bypass trick) and allow only a safe scheme allowlist.
 */

const CONTROL_CHAR_MAX = 0x1f;
const DEL_CHAR = 0x7f;

function stripControlChars(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code > CONTROL_CHAR_MAX && code !== DEL_CHAR) out += raw[i];
  }
  return out;
}

function getScheme(url: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(url);
  return match ? match[1].toLowerCase() + ":" : null;
}

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_IMAGE_DATA_URI = /^data:image\/(png|jpe?g|gif|webp|bmp|avif);base64,/i;

function isRelative(url: string): boolean {
  return url.startsWith("//") || url.startsWith("/") || url.startsWith("#") || url.startsWith("?");
}

/** Sanitizes a URL used as a clickable link (`href`, `window.open`). */
export function sanitizeUrl(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "";
  const url = stripControlChars(raw).trim();
  if (!url) return "";
  if (isRelative(url)) return url;
  const scheme = getScheme(url);
  if (!scheme) return url; // no scheme -> relative URL, safe
  return SAFE_LINK_PROTOCOLS.has(scheme) ? url : "";
}

/** Sanitizes a URL used as an image source (`src`). */
export function sanitizeImageSrc(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "";
  const url = stripControlChars(raw).trim();
  if (!url) return "";
  if (isRelative(url)) return url;
  const scheme = getScheme(url);
  if (!scheme) return url;
  if (scheme === "data:") return SAFE_IMAGE_DATA_URI.test(url) ? url : "";
  return SAFE_IMAGE_PROTOCOLS.has(scheme) ? url : "";
}
