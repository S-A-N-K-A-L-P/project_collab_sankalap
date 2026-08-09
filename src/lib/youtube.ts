const CONTROL_CHAR_MAX = 0x1f;
const DEL_CHAR = 0x7f;

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

function stripControlChars(raw: string): string {
  let output = "";
  for (let index = 0; index < raw.length; index++) {
    const code = raw.charCodeAt(index);
    if (code > CONTROL_CHAR_MAX && code !== DEL_CHAR) output += raw[index];
  }
  return output;
}

function parseRawVideoId(raw: string): string | null {
  return YOUTUBE_VIDEO_ID_PATTERN.test(raw) ? raw : null;
}

/** Extracts a normalized YouTube video ID from a supported YouTube URL or raw ID. */
export function extractYouTubeVideoId(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;

  const cleaned = stripControlChars(raw).trim();
  if (!cleaned) return null;

  const rawId = parseRawVideoId(cleaned);
  if (rawId) return rawId;

  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    return null;
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (host === "youtu.be") {
    const pathSegments = url.pathname.split("/").filter(Boolean);
    return pathSegments.length === 1 ? parseRawVideoId(pathSegments[0]) : null;
  }

  if (url.pathname === "/watch") {
    return parseRawVideoId(url.searchParams.get("v") ?? "");
  }

  const embedMatch = /^\/embed\/([^/?#]+)/.exec(url.pathname);
  if (embedMatch) {
    return parseRawVideoId(embedMatch[1]);
  }

  return null;
}

export function formatYouTubeEditableUrl(videoId: string): string {
  return `https://youtu.be/${videoId}`;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}