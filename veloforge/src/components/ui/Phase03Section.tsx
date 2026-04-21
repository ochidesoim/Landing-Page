"use client";

/**
 * Phase03Section — "The Machine That Doubts" · Autonomous Optimization
 *
 * Architecture (phases.md SAFE SECTION ARCHITECTURE):
 *   <section>  300vh · position relative
 *     <sticky>  100vh · position sticky top:0
 *       grid: 50% left (table + results + CTAs) | 50% right (transparent)
 *
 * Rows reveal based on scroll progress through the section.
 * Result box + CTAs appear after all rows are shown.
 * "STRUCTURALLY SOUND" flashes then fades. CTAs animate in after.
 */

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────

interface IterRow {
  iter: string;
  thickness: string;
  sf: string;
  status: "FAIL" | "PASS" | "SAVED";
  isOptimal?: boolean;
}

const ITER_ROWS: IterRow[] = [
  { iter: "01",  thickness: "18.0mm", sf: "1.241", status: "FAIL" },
  { iter: "02",  thickness: "20.0mm", sf: "1.547", status: "FAIL" },
  { iter: "03",  thickness: "22.0mm", sf: "1.623", status: "FAIL" },
  { iter: "04",  thickness: "24.0mm", sf: "1.782", status: "PASS" },
  { iter: "OPT", thickness: "22.0mm", sf: "1.847", status: "SAVED", isOptimal: true },
];

interface Stat { label: string; value: string; unit: string; }

const RESULT_STATS: Stat[] = [
  { label: "WEIGHT REDUCTION", value: "−11.3", unit: "%"   },
  { label: "SAFETY FACTOR",    value: "1.847",  unit: "×"   },
  { label: "PEAK VON MISES",   value: "148.9",  unit: "MPa" },
  { label: "ITERATIONS",       value: "23",     unit: "N"   },
];

// ── Component ─────────────────────────────────────────────────────────────────

export interface Phase03SectionProps {
  onVisibleRowsChange?: (rows: number) => void;
  onCameraUpdate?: (pos: [number, number, number], fov: number) => void;
}

export default function Phase03Section({ onVisibleRowsChange, onCameraUpdate }: Phase03SectionProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const sweepRef     = useRef<HTMLDivElement>(null);
  const rowRefs      = useRef<(HTMLTableRowElement | null)[]>([]);
  const resultBoxRef = useRef<HTMLDivElement>(null);
  const soundTextRef = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const optRowRef    = useRef<HTMLTableRowElement>(null);

  const [visibleRows, setVisibleRows] = useState(0);
  const [showResult,  setShowResult]  = useState(false);

  // Trigger callback when visibleRows changes
  useEffect(() => {
    if (onVisibleRowsChange) onVisibleRowsChange(visibleRows);
  }, [visibleRows, onVisibleRowsChange]);

  // Reveal rows based on visibleRows count
  useEffect(() => {
    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i < visibleRows) {
        gsap.to(el, {
          autoAlpha: 1,
          x: 0,
          duration: 0.4,
          ease: "power2.out",
          immediateRender: false,
        });
      } else {
        gsap.set(el, { autoAlpha: 0, x: -20 });
      }
    });
  }, [visibleRows]);

  // Pulse optimal row background
  useEffect(() => {
    const row = optRowRef.current;
    if (!row) return;
    const tween = gsap.to({ op: 0.06 }, {
      op: 0.12,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      onUpdate: function () {
        if (row) row.style.background = `rgba(255,107,0,${this.targets()[0].op})`;
      },
    });
    return () => { tween.kill(); };
  }, []);

  // "STRUCTURALLY SOUND" + result box + CTA sequence
  useEffect(() => {
    const soundText = soundTextRef.current;
    const ctaDiv    = ctaRef.current;
    const resultBox = resultBoxRef.current;
    if (!soundText || !ctaDiv || !resultBox) return;
    if (!showResult) return;

    // Result box slides in
    gsap.fromTo(resultBox,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", immediateRender: false, delay: 0.4 }
    );

    // "STRUCTURALLY SOUND" then CTAs
    gsap.timeline()
      .fromTo(soundText,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: "power2.out", immediateRender: false }
      )
      .to(soundText,
        { autoAlpha: 0, duration: 0.5, ease: "power2.out", delay: 2.0 }
      )
      .fromTo(ctaDiv,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: "power2.out", immediateRender: false },
        "+=0.2"
      );
  }, [showResult]);

  useEffect(() => {
    const section = sectionRef.current;
    const sweep   = sweepRef.current;
    if (!section || !sweep) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    }, (ctx) => {
      const { reduceMotion } = ctx.conditions as { isDesktop: boolean; isMobile: boolean; reduceMotion: boolean };

      // ── Sweep line ───────────────────────────────────────────────────────
      const sweepST = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(sweep,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: reduceMotion ? 0 : 0.4, ease: "power2.inOut", immediateRender: false }
          );
          if (onCameraUpdate) onCameraUpdate([0, 0, 4.5], 45);
        },
        onLeaveBack: () => {
          gsap.to(sweep, { scaleX: 0, duration: reduceMotion ? 0 : 0.3, ease: "power2.in" });
          if (onCameraUpdate) onCameraUpdate([-1.8, 0.5, 4.0], 50); // Phase 02 pos
        }
      });

      // ── Row reveal via scroll progress ───────────────────────────────────
      const rowST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          // Rows reveal from 0% to 70% scroll progress
          const rowProgress = Math.min(p / 0.7, 1);
          const count = Math.ceil(rowProgress * ITER_ROWS.length);
          setVisibleRows(count);

          // Show result after 75% scroll
          if (p >= 0.75) {
            setShowResult(true);
          }
        },
      });

      if (reduceMotion) {
        setVisibleRows(ITER_ROWS.length);
        setShowResult(true);
      }

      return () => {
        sweepST.kill();
        rowST.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="phase-03"
      className="phase-section"
      ref={sectionRef}
      aria-label="Phase 03 — Autonomous Optimization"
      style={{ minHeight: "300vh" }}
    >
      {/* "STRUCTURALLY SOUND" — fixed center overlay */}
      <div
        ref={soundTextRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 100,
          pointerEvents: "none",
          fontFamily: "'Bierika', var(--font-wordmark), sans-serif",
          fontSize: "clamp(32px,4vw,56px)",
          color: "#FFFFFF",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          visibility: "hidden",
          opacity: 0,
        }}
      >
        STRUCTURALLY SOUND
      </div>

      {/* CSS-sticky inner wrapper */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Sweep line */}
        <div className="sweep-line" ref={sweepRef} />

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "50% 50%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}>
          {/* ── LEFT COLUMN ── */}
          <div className="phase-left-col" style={{ overflowY: "auto", scrollbarWidth: "none" }}>
            <div className="phase-label">PHASE 03 — AUTONOMOUS OPTIMIZATION</div>

            <h2 className="phase-heading wordmark">Design to Constraint</h2>

            <p className="phase-body">
              VeloForge iterates automatically.<br />
              No engineer in the loop until<br />
              a validated design is found.
            </p>

            {/* Iteration table */}
            <table className="iter-table">
              <thead>
                <tr>
                  <th>ITER</th>
                  <th>THICKNESS</th>
                  <th>SF</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {ITER_ROWS.map((row, i) => (
                  <tr
                    key={row.iter}
                    ref={(el) => {
                      if (row.isOptimal) optRowRef.current = el;
                      rowRefs.current[i] = el;
                    }}
                    className={
                      row.status === "FAIL"  ? "iter-row-fail" :
                      row.status === "PASS"  ? "iter-row-pass" :
                      "iter-row-optimal"
                    }
                    style={{
                      visibility: "hidden",
                      opacity: 0,
                      ...(row.isOptimal ? { background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.5)" } : {}),
                    }}
                  >
                    <td style={{ color: row.isOptimal ? "#FF6B00" : "#E8E8E8" }}>{row.iter}</td>
                    <td style={{ color: "#E8E8E8" }}>{row.thickness}</td>
                    <td className={row.status === "FAIL" ? "sf-fail" : "sf-pass"}>{row.sf}</td>
                    <td style={{ color: row.status === "FAIL" ? "#FF2200" : "#FF6B00" }}>
                      {row.status === "FAIL" ? "✗ FAIL" : row.status === "PASS" ? "✓ PASS" : "✓ SAVED"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ height: 1, background: "rgba(255,107,0,0.15)", margin: "16px 0" }} />

            {/* Result box */}
            <div
              ref={resultBoxRef}
              className="result-box"
              style={{ visibility: "hidden", opacity: 0 }}
            >
              <div style={{
                fontFamily: "'Bierika', var(--font-wordmark), sans-serif",
                fontSize: 16,
                color: "#FFFFFF",
                marginBottom: 20,
              }}>
                brake_bracket_optimized.stl
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 32px",
                marginBottom: 24,
              }}>
                {RESULT_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div style={{
                      color: "rgba(255,107,0,0.5)",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      fontFamily: "'IBM Plex Mono', monospace",
                      marginBottom: 4,
                    }}>
                      {stat.label}
                    </div>
                    <div style={{
                      color: "#E8E8E8",
                      fontSize: 20,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {stat.value}
                      <span style={{ color: "rgba(255,107,0,0.5)", fontSize: 11, marginLeft: 4 }}>
                        {stat.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div
                ref={ctaRef}
                style={{ display: "flex", gap: 12, visibility: "hidden", opacity: 0 }}
              >
                <button className="cta-primary">DOWNLOAD .STL</button>
                <button className="cta-secondary">RUN YOUR PART →</button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — transparent · 3D canvas shows through ── */}
          <div style={{ background: "transparent" }} />
        </div>
      </div>
    </section>
  );
}
