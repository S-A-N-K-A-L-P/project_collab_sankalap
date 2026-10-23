"use client";

import { Check, Clock, X, Loader2, Circle } from "lucide-react";
import type { ReactNode } from "react";
import {
  GATE_KEYS, gateTone, laneSteps, STEP_DOT, STEP_TEXT,
  type CRTask, type Gate, type StepState,
} from "./pipeline";

export function Avatar({ name, src, size = 28 }: { name: string; src?: string; size?: number }) {
  return (
    <div
      className="rounded-lg bg-accent/15 text-accent font-bold flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      title={name}
    >
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : (name || "?")[0].toUpperCase()}
    </div>
  );
}

export function Pill({ children, cls = "bg-accent/10 text-accent", title }: { children: ReactNode; cls?: string; title?: string }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
}

const GATE_CLS = {
  pass: "bg-emerald-500 text-white",
  fail: "bg-red-500 text-white",
  skip: "bg-zinc-400/30 text-muted",
  none: "bg-border-subtle text-muted",
};

/** Four small gate squares: Build · Tests · SAST · API. */
export function GateDots({ gate, labels = false }: { gate?: Gate; labels?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {GATE_KEYS.map((k) => {
        const tone = gateTone(gate?.[k.key]);
        return (
          <span
            key={k.key}
            title={`${k.label}: ${gate?.[k.key] || "not verified"}`}
            className={`inline-flex items-center justify-center rounded ${labels ? "px-1.5 h-5 text-[9px] font-bold font-mono" : "w-3.5 h-3.5"} ${GATE_CLS[tone]}`}
          >
            {labels ? k.label : tone === "pass" ? <Check className="w-2.5 h-2.5" /> : tone === "fail" ? <X className="w-2.5 h-2.5" /> : null}
          </span>
        );
      })}
    </div>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") return <Check className="w-3 h-3" />;
  if (state === "fail") return <X className="w-3 h-3" />;
  if (state === "wait") return <Clock className="w-3 h-3" />;
  if (state === "active") return <Loader2 className="w-3 h-3 animate-spin" />;
  return <Circle className="w-2 h-2" />;
}

/** Horizontal assign → setup → code → verify → PR → review → merge lane for one task. */
export function PipelineLane({ task, nowMs, compact = false }: { task: CRTask; nowMs: number; compact?: boolean }) {
  const steps = laneSteps(task, nowMs);
  return (
    <div className="flex items-start w-full">
      {steps.map((s, i) => (
        <div key={s.key} className="flex-1 min-w-0 flex flex-col items-center relative">
          {i > 0 && (
            <div className={`absolute top-[11px] right-1/2 w-full h-0.5 -z-0 ${steps[i - 1].state === "done" ? "bg-emerald-500/60" : "bg-border-subtle"}`} />
          )}
          <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${STEP_DOT[s.state]}`} title={`${s.label}: ${s.detail || s.state}`}>
            <StepIcon state={s.state} />
          </div>
          {!compact && (
            <>
              <p className={`mt-1 text-[10px] font-bold text-center leading-tight ${s.state === "todo" ? "text-muted" : "text-foreground"}`}>{s.label}</p>
              <p className={`text-[9px] font-mono text-center leading-tight truncate max-w-full px-1 ${STEP_TEXT[s.state]}`} title={s.detail}>{s.detail}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function Kpi({ label, value, sub, tone = "text-foreground", icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string; icon?: ReactNode }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl px-4 py-3 min-w-0">
      <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">{icon}{label}</p>
      <p className={`text-[24px] font-black leading-tight mt-1 ${tone}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted truncate">{sub}</p>}
    </div>
  );
}

export function LiveDot({ updatedAt }: { updatedAt: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted" title={updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : "Loading"}>
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
      </span>
      LIVE
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-[12px] text-muted text-center">{children}</p>;
}
