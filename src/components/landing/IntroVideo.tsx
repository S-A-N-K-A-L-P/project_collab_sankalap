"use client";

import { useEffect, useState } from "react";
import { Play, PlayCircle, Clapperboard } from "lucide-react";
import { BRAND, INTRO_VIDEO, type VideoConfig } from "./content";

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
    // A relative path such as /media/sankalp_intro.mp4 is not a URL; it plays as a file.
  }
  return null;
}

/**
 * Reusable showcase / introduction video player.
 * Supports YouTube/Vimeo embeds as well as local MP4 files in /public/media.
 * Until a video is configured, it shows a graceful "coming soon" frame instead of a broken player.
 */
export function IntroVideo({
  video = INTRO_VIDEO,
  id = "intro-video",
}: {
  video?: VideoConfig;
  id?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const src = video.src.trim();
  const embed = src ? embedUrl(src) : null;
  const previewSrc =
    src && !embed && !src.includes("#") && typeof video.previewTime === "number"
      ? `${src}#t=${video.previewTime}`
      : src;

  useEffect(() => {
    const onPlayEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string }>).detail;
      if (detail?.id === id && src) {
        setPlaying(true);
      }
    };
    window.addEventListener("syncro:play-video", onPlayEvent);
    return () => window.removeEventListener("syncro:play-video", onPlayEvent);
  }, [id, src]);

  return (
    <div id={id} className="relative w-full scroll-mt-28">
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-indigo-500/20 via-sky-400/10 to-emerald-400/20 blur-2xl" aria-hidden />
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-900/20 dark:border-slate-700">
        {!src ? (
          <Placeholder title={video.title} />
        ) : playing && embed ? (
          <iframe
            src={embed}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : playing ? (
          <video
            src={src}
            poster={video.poster || undefined}
            className="absolute inset-0 h-full w-full bg-black"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex items-center justify-center cursor-pointer"
            aria-label={`Play: ${video.title}`}
          >
            <Backdrop />
            {video.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.02]" />
            ) : !embed ? (
              <video
                src={previewSrc}
                preload="metadata"
                muted
                playsInline
                aria-hidden
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-slate-950/25 transition-colors group-hover:bg-slate-950/15" aria-hidden />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-xl transition-transform group-hover:scale-105">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
            <Caption video={video} />
          </button>
        )}
      </div>
    </div>
  );
}

/** Button that smoothly scrolls to a video player on the page and starts playback. */
export function WatchVideoButton({
  targetId = "intro-video",
  label = "Watch the introduction",
  className = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-colors",
}: {
  targetId?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        const el = document.getElementById(targetId);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          window.dispatchEvent(new CustomEvent("syncro:play-video", { detail: { id: targetId } }));
        }
      }}
      className={className}
    >
      <PlayCircle className="h-4 w-4" /> {label}
    </a>
  );
}

function Backdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.35),transparent_55%)]">
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:32px_32px]" />
    </div>
  );
}

function Caption({ video }: { video: VideoConfig }) {
  const subtitle = video.subtitle ?? `${BRAND.name} · ${BRAND.company}`;
  return (
    <span className="absolute bottom-0 inset-x-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-4 pt-12 text-left">
      <span>
        <span className="block text-[15px] font-semibold text-white">{video.title}</span>
        <span className="block text-[12px] text-white/75">{subtitle}</span>
      </span>
      {video.length && (
        <span className="shrink-0 rounded bg-black/60 px-2 py-0.5 text-[12px] font-medium tabular-nums text-white backdrop-blur-sm">
          {video.length}
        </span>
      )}
    </span>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
      <Backdrop />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur">
        <Clapperboard className="h-6 w-6" />
      </span>
      <span className="relative px-6">
        <span className="block text-[16px] font-semibold text-white">{title}</span>
        <span className="mt-1 block text-[13px] text-white/70">Our video is coming soon.</span>
      </span>
    </div>
  );
}
