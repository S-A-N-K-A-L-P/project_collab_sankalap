"use client";

import { useCallback, useEffect, useRef } from "react";
import LoginForm from "@/components/auth/LoginForm";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function LoginPage() {
  const shellRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetPos = useRef({ x: 50, y: 45 });
  const currentPos = useRef({ x: 50, y: 45 });
  const canAnimateCursor = useRef(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");

    const updateCapability = () => {
      canAnimateCursor.current = !reducedMotion.matches && !coarsePointer.matches;
    };

    updateCapability();
    reducedMotion.addEventListener("change", updateCapability);
    coarsePointer.addEventListener("change", updateCapability);

    return () => {
      reducedMotion.removeEventListener("change", updateCapability);
      coarsePointer.removeEventListener("change", updateCapability);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const stepCursorGlow = useCallback(() => {
    const el = shellRef.current;
    if (!el) {
      rafRef.current = null;
      return;
    }

    const dx = targetPos.current.x - currentPos.current.x;
    const dy = targetPos.current.y - currentPos.current.y;

    currentPos.current.x += dx * 0.075;
    currentPos.current.y += dy * 0.075;

    el.style.setProperty("--cursor-x", `${currentPos.current.x.toFixed(2)}%`);
    el.style.setProperty("--cursor-y", `${currentPos.current.y.toFixed(2)}%`);

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      rafRef.current = requestAnimationFrame(stepCursorGlow);
    } else {
      rafRef.current = null;
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canAnimateCursor.current || e.pointerType === "touch") return;
      const el = shellRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      targetPos.current.x = Math.max(0, Math.min(100, x));
      targetPos.current.y = Math.max(0, Math.min(100, y));

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(stepCursorGlow);
      }
    },
    [stepCursorGlow]
  );

  const handlePointerLeave = useCallback(() => {
    if (!canAnimateCursor.current) return;
    targetPos.current.x = 50;
    targetPos.current.y = 45;

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(stepCursorGlow);
    }
  }, [stepCursorGlow]);

  return (
    <div
      ref={shellRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="login-page-shell"
    >
      {/* Multi-layered blurred organic gradient mesh */}
      <div aria-hidden="true" className="login-mesh-stage">
        <div className="login-mesh-orb login-orb-blue" />
        <div className="login-mesh-orb login-orb-indigo" />
        <div className="login-mesh-orb login-orb-mauve" />
        <div className="login-mesh-orb login-orb-lavender" />
        <div className="login-ambient-sheen" />
      </div>

      {/* Subtle cursor-reactive ambient lighting */}
      <div aria-hidden="true" className="login-cursor-glow" />

      {/* Thin, flowing decorative curved lines with subtle independent motion */}
      <svg
        aria-hidden="true"
        className="login-curves-overlay h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="login-flow-indigo-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8BBD8" stopOpacity="0" />
            <stop offset="24%" stopColor="#A8BBD8" stopOpacity="0.34" />
            <stop offset="56%" stopColor="#494477" stopOpacity="0.28" />
            <stop offset="84%" stopColor="#B9AFE5" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#A895BC" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="login-flow-mauve-slate" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#494477" stopOpacity="0" />
            <stop offset="28%" stopColor="#A895BC" stopOpacity="0.30" />
            <stop offset="62%" stopColor="#777B96" stopOpacity="0.24" />
            <stop offset="88%" stopColor="#A8BBD8" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#F5F5F8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="login-flow-lavender" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#B9AFE5" stopOpacity="0" />
            <stop offset="35%" stopColor="#B9AFE5" stopOpacity="0.28" />
            <stop offset="68%" stopColor="#494477" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#777B96" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="login-curve-group-1">
          <path
            d="M-140 150 C 220 20, 520 320, 900 145 C 1170 25, 1340 200, 1580 110"
            stroke="url(#login-flow-indigo-blue)"
            strokeWidth="1.1"
          />
          <path
            d="M-110 215 C 260 95, 560 365, 945 195 C 1200 85, 1370 240, 1590 165"
            stroke="url(#login-flow-lavender)"
            strokeWidth="0.75"
          />
        </g>

        <g className="login-curve-group-2">
          <path
            d="M-100 725 C 290 545, 630 835, 1030 640 C 1255 530, 1400 665, 1560 595"
            stroke="url(#login-flow-mauve-slate)"
            strokeWidth="1.1"
          />
          <path
            d="M-70 780 C 325 605, 665 875, 1065 690 C 1280 585, 1415 710, 1575 650"
            stroke="url(#login-flow-indigo-blue)"
            strokeWidth="0.7"
          />
        </g>

        <g className="login-curve-group-3">
          <path
            d="M 110 -70 C 350 265, 190 615, 490 970"
            stroke="url(#login-flow-lavender)"
            strokeWidth="0.85"
          />
          <path
            d="M 1320 -50 C 1075 295, 1245 625, 955 970"
            stroke="url(#login-flow-mauve-slate)"
            strokeWidth="0.85"
          />
        </g>
      </svg>

      <PublicNavbar />

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6">
        <LoginForm />
      </main>
    </div>
  );
}
