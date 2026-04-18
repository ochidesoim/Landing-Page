"use client";

/**
 * Terminal — Scroll-driven (Phase 4)
 *
 * Previously time-driven (setTimeout). Now pure render from `visibleCount`.
 * Lines revealed by scroll progress via useScrollScene.
 * Phase triggers are exported as constants for useScrollScene to use.
 */

export interface PipelineLine {
  text:  string;
  color: string;
}

export const PIPELINE_LINES: PipelineLine[] = [
  { text: "[MESH]  Generating parametric geometry...",              color: "rgba(255, 107, 0, 0.6)" },
  { text: "[FEA]   Extruding bracket profile → 4,001 faces",       color: "rgba(255, 107, 0, 0.6)" },
  { text: "[MESH]  Cutting sole beam 017.00mm",                    color: "rgba(255, 107, 0, 0.6)" },
  { text: "[MESH]  Lightweighting pockets → 9 holes",              color: "rgba(255, 107, 0, 0.6)" },
  { text: "[VALID] Checking edges (limit ±0.031) ✓",               color: "rgba(255, 107, 0, 0.6)" },
  { text: "[FEA]   Setting up finite element analysis...",          color: "rgba(255, 107, 0, 0.6)" },
  { text: "[FEA]   Material: Al7075-T6 · E = 275 MPa",             color: "rgba(255, 107, 0, 0.6)" },
  { text: "[FEA]   Auto load: 2.40 kN · Caliper offset: 54.5mm",   color: "rgba(255, 107, 0, 0.6)" },
  { text: "[SOLVE] Running sparse direct solver (MUMPS)...",        color: "rgba(255, 107, 0, 0.6)" },
  { text: "[SOLVE] Iteration 1/8 · residual: 2.53e-3",             color: "rgba(255, 107, 0, 0.6)" },
  { text: "[SOLVE] Iteration 3/8 · residual: 4.17e-4",             color: "rgba(255, 107, 0, 0.6)" },
  { text: "[SOLVE] Iteration 8/8 · residual: 8.96e-7",             color: "rgba(255, 107, 0, 0.6)" },
  { text: "[DONE]  Part validated → FEA complete ✓",               color: "rgba(255, 107, 0, 0.6)" },
];

import { useState, useEffect, useRef } from "react";

interface TerminalProps {
  visibleCount?: number;
}

export default function Terminal({ visibleCount: propVisibleCount }: TerminalProps) {
  const [internalCount, setInternalCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setInternalCount(c => {
        const next = c + 1;
        return next > PIPELINE_LINES.length ? 0 : next;
      });
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const visibleCount = propVisibleCount !== undefined ? propVisibleCount : internalCount;
  const lines  = PIPELINE_LINES.slice(0, visibleCount);
  const isDone = visibleCount >= PIPELINE_LINES.length;

  return (
    <div ref={containerRef} style={{
      height: "100%",
      overflowY: "hidden",
      padding: "1.6rem 0",
      scrollbarWidth: "none",
      background: "transparent",
      borderLeft: "1px solid rgba(255, 107, 0, 0.4)",
      paddingLeft: "1.2rem",
      marginTop: "1.5rem"
    }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            color: line.color,
            fontSize: "0.76rem",
            lineHeight: 1.95,
            letterSpacing: "0.025em",
            fontFamily: "var(--font-display)",
            whiteSpace: "pre",
          }}
        >
          {line.text || "\u00A0"}
        </div>
      ))}

      {/* Blinking cursor while pipeline runs */}
      {!isDone && visibleCount > 0 && (
        <span style={{
          display: "inline-block",
          width: "0.5em",
          height: "1.1em",
          background: "rgba(255, 107, 0, 0.6)",
          verticalAlign: "text-bottom",
          animation: "cursorBlink 0.9s step-end infinite",
        }} />
      )}

      <style>{`
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        div::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
