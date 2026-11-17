"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Clapperboard,
  Film,
  GitBranch,
  Maximize2,
  Play,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import { BRAND, INTRO_VIDEO, SYNCRO_GIT_VIDEO, type VideoConfig } from "./content";

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
 * Interactive 3D-tilting, aurora-framed showcase video player with live-synced chapters and Cinema Lightbox.
 */
export function IntroVideo({
  video = INTRO_VIDEO,
  id = "intro-video",
  showChapters = true,
  showFloatingBadges = true,
  initialAutoPlay = false,
}: {
  video?: VideoConfig;
  id?: string;
  showChapters?: boolean;
  showFloatingBadges?: boolean;
  initialAutoPlay?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(initialAutoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [theaterOpen, setTheaterOpen] = useState(false);
  const [theaterStartTime, setTheaterStartTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const src = video.src.trim();
  const embed = src ? embedUrl(src) : null;
  const isEmerald = video.accent === "emerald";
  const chapters = video.chapters ?? [];

  const previewSrc =
    src && !embed && !src.includes("#") && typeof video.previewTime === "number"
      ? `${src}#t=${video.previewTime}`
      : src;

  // 3D spring tilt & specular cursor glare
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smoothX = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.5 });
  const smoothY = useSpring(my, { stiffness: 220, damping: 26, mass: 0.5 });
  const rotateX = useTransform(smoothY, [0, 1], [4.5, -4.5]);
  const rotateY = useTransform(smoothX, [0, 1], [-5.5, 5.5]);
  const glareX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.22), transparent 65%)`;

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

  useEffect(() => {
    if (!theaterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTheaterOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theaterOpen]);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playing || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mx.set(0.5);
    my.set(0.5);
  };

  const seekToChapter = (time: number) => {
    if (!src) return;
    setCurrentTime(time);
    if (playing && videoRef.current) {
      videoRef.current.currentTime = time;
      void videoRef.current.play().catch(() => {});
    } else {
      setPendingSeek(time);
      setPlaying(true);
    }
  };

  const openTheater = () => {
    if (!src) return;
    const resumeAt = videoRef.current ? videoRef.current.currentTime : currentTime;
    videoRef.current?.pause();
    setTheaterStartTime(resumeAt);
    setTheaterOpen(true);
  };

  // Active chapter index based on playback timestamp
  let activeChapterIdx = 0;
  for (let i = 0; i < chapters.length; i++) {
    if (currentTime >= chapters[i].time) activeChapterIdx = i;
  }

  return (
    <motion.div
      id={id}
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full scroll-mt-28"
    >
      {/* Breathing multi-tone ambient aurora behind the stage */}
      <motion.div
        aria-hidden
        animate={
          reducedMotion
            ? undefined
            : {
                scale: playing ? [1.02, 1.07, 1.02] : [0.97, 1.03, 0.97],
                opacity: playing ? [0.7, 0.95, 0.7] : [0.45, 0.75, 0.45],
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`pointer-events-none absolute -inset-4 -z-10 rounded-[32px] blur-2xl ${
          isEmerald
            ? "bg-gradient-to-br from-emerald-500/25 via-sky-500/20 to-indigo-500/25"
            : "bg-gradient-to-br from-indigo-500/30 via-sky-400/20 to-emerald-400/25"
        }`}
      />

      {/* Floating levitating context chips (gracefully hide while playing) */}
      <AnimatePresence>
        {showFloatingBadges && !playing && video.floatingBadges?.topRight && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={
              reducedMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: [0, -5, 0], scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
              opacity: { duration: 0.35, delay: 0.2 },
              y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="pointer-events-none absolute -top-3.5 right-4 z-20 hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-slate-950/30 backdrop-blur-md dark:border-white/15"
          >
            <Sparkles className={`h-3 w-3 ${isEmerald ? "text-emerald-400" : "text-indigo-400"}`} />
            {video.floatingBadges.topRight}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFloatingBadges && !playing && video.floatingBadges?.bottomLeft && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={
              reducedMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: [0, 5, 0], scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
              opacity: { duration: 0.35, delay: 0.3 },
              y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
            }}
            className={`pointer-events-none absolute ${
              showChapters && chapters.length > 0 ? "bottom-12" : "-bottom-3"
            } -left-2 z-20 hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-lg shadow-slate-900/15 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isEmerald ? "bg-emerald-500" : "bg-indigo-500"}`} />
            {video.floatingBadges.bottomLeft}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Tilt Stage */}
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        style={
          playing || reducedMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }
        }
        className="relative rounded-[22px] p-[1.5px] overflow-hidden shadow-2xl shadow-slate-900/25 dark:shadow-black/50"
      >
        {/* Rotating conic light-beam border */}
        <div
          aria-hidden
          className="pf-conic pointer-events-none opacity-80"
          style={{
            background: isEmerald
              ? "conic-gradient(from 0deg, transparent 0%, #10b981 20%, #38bdf8 40%, #6366f1 55%, transparent 72%)"
              : "conic-gradient(from 0deg, transparent 0%, #6366f1 20%, #38bdf8 40%, #10b981 55%, transparent 72%)",
          }}
        />
        {/* Subtle static border fallback layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-slate-200/80 dark:ring-slate-700/80"
        />

        {/* Inner studio glass window */}
        <div className="relative overflow-hidden rounded-[20.5px] bg-slate-950">
          {/* Cursor-following specular highlight */}
          {!playing && !reducedMotion && (
            <motion.div
              aria-hidden
              style={{ background: glareBg }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute inset-0 z-20"
            />
          )}

          {/* Top studio chrome bar */}
          <div className="relative z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-3.5 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/75" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/75" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/75" />
              </div>
              <span className="mx-1 h-3 w-px bg-white/15" aria-hidden />
              {playing ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-emerald-300">
                  <AudioBars />
                  <span>NOW PLAYING</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 truncate">
                  <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isEmerald ? "bg-emerald-400" : "bg-indigo-400"}`} />
                  <span className="truncate">{video.badge ?? "HD Showcase"}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {video.length && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-200">
                  {video.length}
                </span>
              )}
              {src && (
                <button
                  type="button"
                  onClick={openTheater}
                  title="Open in Cinema Mode"
                  aria-label={`Open ${video.title} in Cinema Mode`}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-white/25 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Cinema</span>
                </button>
              )}
            </div>

            {/* Live laser playback progress bar */}
            {playing && progress > 0 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
                <div
                  className={`h-full transition-[width] duration-200 ${
                    isEmerald
                      ? "bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                      : "bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
          </div>

          {/* 16:9 Video Viewport */}
          <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
            {!src ? (
              <Placeholder title={video.title} />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {playing && embed ? (
                  <motion.iframe
                    key="embed-player"
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={embed}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : playing ? (
                  <motion.video
                    key="file-player"
                    ref={videoRef}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={src}
                    poster={video.poster || undefined}
                    className="absolute inset-0 h-full w-full bg-black"
                    controls
                    autoPlay
                    playsInline
                    onLoadedMetadata={(e) => {
                      if (pendingSeek !== null) {
                        e.currentTarget.currentTime = pendingSeek;
                        setPendingSeek(null);
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      setCurrentTime(v.currentTime);
                      if (v.duration > 0) {
                        setProgress((v.currentTime / v.duration) * 100);
                      }
                    }}
                  />
                ) : (
                  <motion.button
                    key="poster-trigger"
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setPlaying(true)}
                    className="group absolute inset-0 flex items-center justify-center cursor-pointer text-left"
                    aria-label={`Play: ${video.title}`}
                  >
                    <Backdrop isEmerald={isEmerald} />
                    {video.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.poster}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : !embed ? (
                      <video
                        src={previewSrc}
                        preload="metadata"
                        muted
                        playsInline
                        aria-hidden
                        tabIndex={-1}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : null}

                    {/* Cinematic vignette */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/30 transition-opacity duration-300 group-hover:opacity-90"
                      aria-hidden
                    />

                    {/* Sonar ripple rings + magnetic play orb */}
                    <span className="relative z-10 flex items-center justify-center">
                      {!reducedMotion && (
                        <>
                          <motion.span
                            aria-hidden
                            animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                            className={`pointer-events-none absolute h-16 w-16 rounded-full ${
                              isEmerald ? "bg-emerald-400/40" : "bg-indigo-400/45"
                            }`}
                          />
                          <motion.span
                            aria-hidden
                            animate={{ scale: [1, 1.9], opacity: [0.45, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
                            className="pointer-events-none absolute h-16 w-16 rounded-full bg-white/35"
                          />
                        </>
                      )}
                      <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-white/40 bg-white/15 p-1.5 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                        <span
                          className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ${
                            isEmerald ? "text-emerald-600" : "text-indigo-600"
                          }`}
                        >
                          {/* Hover light-sheen sweep */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-200/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                          />
                          <Play className="relative ml-0.5 h-6 w-6 fill-current" />
                        </span>
                      </span>
                    </span>

                    <Caption video={video} />
                  </motion.button>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* Interactive live-synced chapter bar */}
      {showChapters && chapters.length > 0 && src && !embed && (
        <div
          className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
          role="group"
          aria-label={`${video.title} chapters`}
        >
          {chapters.map((ch, idx) => {
            const isActive = playing && activeChapterIdx === idx;
            return (
              <button
                key={`${ch.tag}-${ch.label}`}
                type="button"
                onClick={() => seekToChapter(ch.time)}
                className={`relative shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "border border-slate-200/90 bg-white/80 text-slate-600 hover:border-indigo-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId={`${id}-active-chapter`}
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className={`absolute inset-0 -z-10 rounded-full shadow-sm ${
                      isEmerald
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                        : "bg-gradient-to-r from-indigo-600 to-sky-600"
                    }`}
                  />
                )}
                <span className={`font-mono text-[10.5px] ${isActive ? "text-white/90" : "text-indigo-600 dark:text-indigo-400"}`}>
                  {ch.tag}
                </span>
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cinema Theater Lightbox */}
      <TheaterModal
        open={theaterOpen}
        onClose={() => setTheaterOpen(false)}
        video={video}
        embed={embed}
        startTime={theaterStartTime}
      />
    </motion.div>
  );
}

/**
 * Hero dual-reel stage: lets visitors watch Introducing S.A.N.K.A.L.P. (default) OR switch straight to
 * the Syncro Git Showcase right inside the Hero with a spring-animated segmented control.
 */
export function HeroVideoStage() {
  const [activeReel, setActiveReel] = useState<"intro" | "syncro">("intro");
  const [autoPlayReel, setAutoPlayReel] = useState<"intro" | "syncro" | null>(null);

  useEffect(() => {
    const onPlayEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string }>).detail;
      if (detail?.id === "intro-video") {
        setActiveReel("intro");
        setAutoPlayReel("intro");
      } else if (detail?.id === "hero-syncro-video") {
        setActiveReel("syncro");
        setAutoPlayReel("syncro");
      }
    };
    window.addEventListener("syncro:play-video", onPlayEvent);
    return () => window.removeEventListener("syncro:play-video", onPlayEvent);
  }, []);

  const reels = [
    { key: "intro" as const, label: "S.A.N.K.A.L.P. Intro", length: INTRO_VIDEO.length, Icon: Film },
    { key: "syncro" as const, label: "Syncro Git Showcase", length: SYNCRO_GIT_VIDEO.length, Icon: GitBranch },
  ];

  return (
    <div id="hero-video-stage" className="w-full scroll-mt-28">
      {/* Animated dual-video switcher tabs */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Featured videos"
          className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
        >
          {reels.map(({ key, label, length, Icon }) => {
            const selected = activeReel === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setAutoPlayReel(null);
                  setActiveReel(key);
                }}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors cursor-pointer ${
                  selected
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="hero-video-reel-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700"
                  />
                )}
                <Icon className={`relative z-10 h-3.5 w-3.5 ${key === "syncro" ? "text-emerald-500" : "text-indigo-500"}`} />
                <span className="relative z-10">{label}</span>
                {length && (
                  <span className="relative z-10 rounded bg-slate-200/70 px-1.5 py-0.2 font-mono text-[10.5px] text-slate-600 dark:bg-slate-700/70 dark:text-slate-300">
                    {length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {activeReel === "intro" ? (
          <motion.div
            key="hero-reel-intro"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <IntroVideo id="intro-video" video={INTRO_VIDEO} initialAutoPlay={autoPlayReel === "intro"} />
          </motion.div>
        ) : (
          <motion.div
            key="hero-reel-syncro"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <IntroVideo id="hero-syncro-video" video={SYNCRO_GIT_VIDEO} initialAutoPlay={autoPlayReel === "syncro"} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Button that smoothly scrolls to a video player on the page and starts playback. */
export function WatchVideoButton({
  targetId = "intro-video",
  label = "Watch the introduction",
  className = "group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-700 dark:hover:bg-slate-800 transition-all",
}: {
  targetId?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        window.dispatchEvent(new CustomEvent("syncro:play-video", { detail: { id: targetId } }));
        const el = document.getElementById(targetId);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }}
      className={className}
    >
      <PlayCircle className="h-4 w-4 shrink-0 opacity-90 transition-transform duration-200 group-hover:scale-110" />
      <span>{label}</span>
    </a>
  );
}

function TheaterModal({
  open,
  onClose,
  video,
  embed,
  startTime,
}: {
  open: boolean;
  onClose: () => void;
  video: VideoConfig;
  embed: string | null;
  startTime: number;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/88 p-4 sm:p-8 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{video.title}</p>
                <p className="truncate text-xs text-slate-400">{video.subtitle ?? `${BRAND.name} · ${BRAND.company}`}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Cinema Mode"
                className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              {embed ? (
                <iframe
                  src={embed}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={video.src.trim()}
                  className="absolute inset-0 h-full w-full bg-black"
                  controls
                  autoPlay
                  playsInline
                  onLoadedMetadata={(e) => {
                    if (startTime > 0) e.currentTarget.currentTime = startTime;
                  }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function AudioBars() {
  return (
    <span className="inline-flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 0.18, 0.32, 0.12].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ height: ["35%", "100%", "45%", "90%", "35%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay }}
          className="w-[2.5px] rounded-full bg-emerald-400"
        />
      ))}
    </span>
  );
}

function Backdrop({ isEmerald = false }: { isEmerald?: boolean }) {
  return (
    <div
      className={`absolute inset-0 ${
        isEmerald
          ? "bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]"
          : "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.35),transparent_55%)]"
      }`}
    >
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:32px_32px]" />
    </div>
  );
}

function Caption({ video }: { video: VideoConfig }) {
  const subtitle = video.subtitle ?? `${BRAND.name} · ${BRAND.company}`;
  return (
    <span className="absolute bottom-0 inset-x-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-4 pt-14 text-left">
      <span>
        <span className="block text-[15px] font-semibold text-white drop-shadow-sm">{video.title}</span>
        <span className="mt-0.5 block text-[12px] text-white/75">{subtitle}</span>
      </span>
      <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition-colors group-hover:bg-white/20">
        Click to play
      </span>
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
