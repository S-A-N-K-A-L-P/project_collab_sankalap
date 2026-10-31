import { useId } from "react";

/**
 * Madhyam AI mark — a calligraphic Devanagari "म" drawn as one continuous
 * pen stroke (headline swoosh, looped stem, crossbar) with glowing node
 * terminals that read as an AI / workflow graph.
 */
export function MadhyamMark({ size = 40, tile = true, className }: { size?: number; tile?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const grad = `mg-${id}`;
  const tileGrad = `mt-${id}`;
  const glow = `mglow-${id}`;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="6" y1="40" x2="44" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7BD15A" />
          <stop offset="0.45" stopColor="#24C6B5" />
          <stop offset="1" stopColor="#3B8BFF" />
        </linearGradient>
        <linearGradient id={tileGrad} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#13213A" />
          <stop offset="1" stopColor="#0B1220" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {tile && (
        <>
          <rect x="0.5" y="0.5" width="47" height="47" rx="12" fill={`url(#${tileGrad})`} />
          <rect x="0.5" y="0.5" width="47" height="47" rx="12" stroke={`url(#${grad})`} strokeOpacity="0.35" />
        </>
      )}

      <g stroke={`url(#${grad})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        {/* shirorekha — calligraphic headline swoosh */}
        <path d="M7 9.5c2.2 3.4 5 5 9.5 5H39" />
        {/* left stem curling into a loop, exiting as the crossbar */}
        <path d="M17.5 14.5v13.8c0 6.2-3.6 9.4-6.9 8-2.9-1.2-2.4-5.7 1.4-6.6 2.6-.6 5.5.1 8.4.1H33" />
        {/* right stem */}
        <path d="M33 14.5V39" />
      </g>

      {/* AI node terminals */}
      <g filter={`url(#${glow})`}>
        <circle cx="39" cy="14.5" r="2.6" fill="#3B8BFF" />
        <circle cx="33" cy="39" r="2.6" fill="#24C6B5" />
      </g>
      {/* spark */}
      <path d="M40.5 31.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#A7CBFF" />
    </svg>
  );
}

/**
 * Wordmark: the calligraphic "मा" (म + ा matra, sharing one headline) stands
 * in for "Ma", followed by "dhyam" — read as "Madhyam" — with an AI badge.
 */
export function MadhyamLogo({ size = 36, className, subtitle }: { size?: number; className?: string; subtitle?: string }) {
  const id = useId().replace(/:/g, "");
  const grad = `wg-${id}`;
  const glyph = Math.round(size * 0.95);

  return (
    <span className={`inline-flex flex-col leading-none ${className ?? ""}`}>
      <span className="inline-flex items-end">
        <svg width={glyph * (46 / 37)} height={glyph} viewBox="4 6 46 37" fill="none" aria-hidden="true" className="-mr-0.5 shrink-0">
          <defs>
            <linearGradient id={grad} x1="6" y1="40" x2="50" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#5DBB3F" />
              <stop offset="0.45" stopColor="#14B3A3" />
              <stop offset="1" stopColor="#2F7BF5" />
            </linearGradient>
          </defs>
          <g stroke={`url(#${grad})`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            {/* shared shirorekha across म and the ा matra */}
            <path d="M7 9.5c2.2 3.4 5 5 9.5 5H46" />
            {/* म */}
            <path d="M17.5 14.5v13.8c0 6.2-3.6 9.4-6.9 8-2.9-1.2-2.4-5.7 1.4-6.6 2.6-.6 5.5.1 8.4.1H31" />
            <path d="M31 14.5V39" />
            {/* ा matra */}
            <path d="M41.5 14.5V39" />
          </g>
          <circle cx="46.5" cy="14.5" r="2.5" fill="#2F7BF5" />
          <circle cx="41.5" cy="39" r="2.5" fill="#14B3A3" />
        </svg>
        <span
          className="font-medium tracking-[-0.01em] text-[#1E6FE8]"
          style={{ fontSize: size * 0.78, lineHeight: 1, marginBottom: size * 0.02 }}
        >
          dhyam
        </span>
        <span
          className="ml-1.5 rounded-md bg-gradient-to-r from-[#14B3A3] to-[#2F7BF5] font-bold uppercase tracking-wider text-white"
          style={{ fontSize: Math.max(10, size * 0.24), padding: `${size * 0.06}px ${size * 0.11}px`, marginBottom: size * 0.05 }}
        >
          AI
        </span>
      </span>
      {subtitle && <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">{subtitle}</span>}
    </span>
  );
}
