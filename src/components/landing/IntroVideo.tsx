"use client";

import { useState } from "react";
import { Play, Clapperboard } from "lucide-react";
import { BRAND, INTRO_VIDEO } from "./content";

/** Turns a YouTube or Vimeo link into its embeddable player URL; returns null for anything else. */
function embedUrl(src: string): string | null {
  try {
    const u = new URL(src);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
  } catch {
    // A relative path such as /media/intro.mp4 is not a URL; it plays as a file.
  }
  return null;
}

/**
 * The hero's introduction video. Until a video is configured (INTRO_VIDEO.src in content.ts, or
 * NEXT_PUBLIC_INTRO_VIDEO_URL), it shows a "coming soon" frame instead of a broken player.
 */
export function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  const src = INTRO_VIDEO.src.trim();
  const embed = src ? embedUrl(src) : null;

  return (
    <div id="intro-video" className="relative w-full scroll-mt-28">
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-indigo-500/20 via-sky-400/10 to-emerald-400/20 blur-2xl" aria-hidden />
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-900/20 dark:border-slate-700">
        {!src ? (
          <Placeholder />
        ) : playing && embed ? (
          <iframe
            src={embed}
            title={INTRO_VIDEO.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : playing ? (
          <video src={src} poster={INTRO_VIDEO.poster || undefined} className="absolute inset-0 h-full w-full bg-black" controls autoPlay playsInline />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 flex items-center justify-center" aria-label={`Play: ${INTRO_VIDEO.title}`}>
            {INTRO_VIDEO.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={INTRO_VIDEO.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            ) : (
              <Backdrop />
            )}
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-xl transition-transform group-hover:scale-105">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
            <Caption />
          </button>
        )}
      </div>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.35),transparent_55%)]">
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:32px_32px]" />
    </div>
  );
}

function Caption() {
  return (
    <span className="absolute bottom-0 inset-x-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10 text-left">
      <span>
        <span className="block text-[15px] font-semibold text-white">{INTRO_VIDEO.title}</span>
        <span className="block text-[12px] text-white/70">{BRAND.name} · {BRAND.company}</span>
      </span>
      {INTRO_VIDEO.length && <span className="rounded bg-black/50 px-2 py-0.5 text-[12px] font-medium text-white">{INTRO_VIDEO.length}</span>}
    </span>
  );
}

function Placeholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
      <Backdrop />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur">
        <Clapperboard className="h-6 w-6" />
      </span>
      <span className="relative px-6">
        <span className="block text-[16px] font-semibold text-white">{INTRO_VIDEO.title}</span>
        <span className="mt-1 block text-[13px] text-white/70">Our introduction video is coming soon.</span>
      </span>
    </div>
  );
}
