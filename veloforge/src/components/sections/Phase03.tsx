"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ITERATIONS = [
  { num: "01", dim: "18.0mm", stress: "1.241", status: "FAIL" },
  { num: "02", dim: "20.0mm", stress: "1.547", status: "FAIL" },
  { num: "03", dim: "22.0mm", stress: "1.623", status: "FAIL" },
  { num: "04", dim: "24.0mm", stress: "1.782", status: "PASS" },
  { num: "OPT", dim: "22.0mm", stress: "1.847", status: "SAVED" },
];

// Stat counter helper
function useCountUp(target: number, enabled: boolean, decimals = 1) {
  const [value, setValue] = useState(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const obj = { v: 0 };
    tweenRef.current = gsap.to(obj, {
      v: target,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => setValue(parseFloat(obj.v.toFixed(decimals))),
    });
    return () => { tweenRef.current?.kill(); };
  }, [enabled, target, decimals]);
  return value;
}

export default function Phase03() {
  const sectionRef    = useRef<HTMLElement>(null);
  const pinRef        = useRef<HTMLDivElement>(null);
  const sweepLineRef  = useRef<HTMLDivElement>(null);
  const rowsRef       = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef     = useRef<HTMLDivElement>(null);
  const soundTextRef  = useRef<HTMLDivElement>(null); // full-screen overlay
  const btn1Ref       = useRef<HTMLButtonElement>(null);
  const btn2Ref       = useRef<HTMLButtonElement>(null);
  const optRowRef     = useRef<HTMLDivElement>(null);

  const [statsVisible, setStatsVisible] = useState(false);
  const [soundVisible, setSoundVisible] = useState(false);

  // Count-up stats
  const weightReduction = useCountUp(-11.3, statsVisible, 1);
  const safetyFactor    = useCountUp(1.847, statsVisible, 3);
  const peakStress      = useCountUp(148.9, statsVisible, 1);
  const iterations      = useCountUp(23,    statsVisible, 0);

  useEffect(() => {
    const section = sectionRef.current;
    const pin     = pinRef.current;
    if (!section || !pin) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    }, (ctx) => {
      const { reduceMotion } = ctx.conditions as { reduceMotion: boolean };

      const rows   = rowsRef.current.filter(Boolean) as HTMLDivElement[];
      const result = resultRef.current;
      const btn1   = btn1Ref.current;
      const btn2   = btn2Ref.current;
      const optRow = optRowRef.current;

      gsap.set(rows,         { autoAlpha: 0, x: -16 });
      gsap.set([result, btn1, btn2], { autoAlpha: 0, y: 12 });

      let lastVisibleRow = -1;
      let resultShown    = false;
      let pulseShown     = false;
      let soundShown     = false;
      let ctaShown       = false;
      let optPulseTween: gsap.core.Tween | null = null;

      // ── Sweep line on section entry ───────────────────────────────────
      const sweepST = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: () => {
          if (reduceMotion || !sweepLineRef.current) return;
          gsap.fromTo(sweepLineRef.current,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: 0.4, ease: "power2.inOut" }
          );
        },
      });

      // ── GSAP PIN ─────────────────────────────────────────────────────
      const st = ScrollTrigger.create({
        trigger:       section,
        pin:           pin,
        pinSpacing:    false,
        start:         "top top",
        end:           "+=250%",
        anticipatePin: 1,
        scrub:         1,
        onUpdate: (self) => {
          if (reduceMotion) return;
          const p = self.progress;

          // ── Table rows at thresholds ──
          const newVisibleRow =
            p > 0.56 ? 4 :
            p > 0.44 ? 3 :
            p > 0.32 ? 2 :
            p > 0.20 ? 1 :
            p > 0.08 ? 0 : -1;

          if (newVisibleRow !== lastVisibleRow) {
            lastVisibleRow = newVisibleRow;
            rows.forEach((row, i) => {
              if (!row) return;
              if (i <= newVisibleRow) {
                gsap.to(row, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
              }
            });

            // Opt row pulse when it appears
            if (newVisibleRow >= 4 && optRow && !optPulseTween) {
              optPulseTween = gsap.to(optRow, {
                "--opt-bg": "rgba(255,107,0,0.12)",
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            }
          }

          // ── 3D iteration dispatch ──
          const iter =
            p >= 0.50 ? 4 :
            p >= 0.35 ? 3 :
            p >= 0.20 ? 2 : 1;
          window.dispatchEvent(new CustomEvent("vf:iteration", { detail: iter }));

          // ── Result box at p > 0.65 ──
          if (p > 0.65 && !resultShown) {
            resultShown = true;
            gsap.to(result, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" });
            setStatsVisible(true);
          }

          // ── Validation pulse at p > 0.72 ──
          if (p > 0.72 && !pulseShown) {
            pulseShown = true;
            window.dispatchEvent(new CustomEvent("vf:validationPulse"));
          }

          // ── "STRUCTURALLY SOUND" overlay at p > 0.78 ──
          if (p > 0.78 && !soundShown) {
            soundShown = true;
            setSoundVisible(true);
            const soundEl = soundTextRef.current;
            if (soundEl) {
              const tl = gsap.timeline();
              tl.fromTo(soundEl,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.5, ease: "power2.out", immediateRender: false }
              ).to(soundEl,
                { autoAlpha: 0, duration: 0.5, ease: "power2.in", delay: 2.0 }
              );
            }
          }

          // ── CTA buttons at p > 0.90 ──
          if (p > 0.90 && !ctaShown) {
            ctaShown = true;
            gsap.to([btn1, btn2], { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" });
          }
        },
      });

      if (reduceMotion) {
        gsap.set(rows,         { autoAlpha: 1, x: 0 });
        gsap.set([result, btn1, btn2], { autoAlpha: 1, y: 0 });
        setStatsVisible(true);
      }

      return () => {
        st.kill();
        sweepST.kill();
        optPulseTween?.kill();
      };
    });

    return () => mm.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getRowStyle = (status: string): React.CSSProperties => {
    if (status === "FAIL") return { opacity: 0.5 };
    if (status === "PASS") return { opacity: 1.0 };
    return { opacity: 1.0 }; // SAVED/OPT
  };

  const getSFColor = (status: string) => {
    if (status === "FAIL") return "#FF2200";
    if (status === "PASS") return "#FF6B00";
    return "#FF6B00"; // SAVED
  };

  return (
    <>
      {/* ── "STRUCTURALLY SOUND" full-screen overlay (phases.md spec) ── */}
      {soundVisible && (
        <div
          ref={soundTextRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            visibility: "hidden",
            opacity: 0,
          }}
        >
          <div style={{
            fontFamily: "'Bierika', sans-serif",
            color: "white",
            fontSize: "clamp(32px, 4vw, 56px)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 0 40px rgba(255,107,0,0.4)",
          }}>
            STRUCTURALLY SOUND
          </div>
        </div>
      )}

      <section
        id="phase-03"
        ref={sectionRef}
        aria-label="Phase 03 — Autonomous Optimization"
        style={{ position: "relative", width: "100vw", minHeight: "350vh", zIndex: 2 }}
      >
        {/* Orange sweep line */}
        <div
          ref={sweepLineRef}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%", height: "1px",
            background: "linear-gradient(90deg, #FF6B00, rgba(255,107,0,0.2))",
            transformOrigin: "left",
            transform: "scaleX(0)",
            zIndex: 10,
          }}
        />

        {/* ── GSAP pins this div ── */}
        <div
          ref={pinRef}
          style={{
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            willChange: "transform",
          }}
        >
          {/* Top bar */}
          <div style={{
            borderBottom: "1px solid rgba(255,107,0,0.2)",
            padding: "24px 60px",
            flexShrink: 0,
            background: "#0A0A0B",
          }}>
            <span style={{
              color: "#FF6B00",
              fontSize: "10px",
              letterSpacing: "0.25em",
              fontWeight: 300,
            }}>
              PHASE 03 — AUTONOMOUS OPTIMIZATION
            </span>
          </div>

          <div style={{
            display: "flex",
            width: "100%",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}>
            {/* ── LEFT COLUMN ── */}
            <div style={{
              width: "50%",
              padding: "32px 60px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#0A0A0B",
              borderRight: "1px solid rgba(255,107,0,0.08)",
              overflow: "hidden",
            }}>
              <h2 style={{
                fontFamily: "'Bierika', sans-serif",
                color: "white",
                fontSize: "48px",
                margin: "0 0 16px 0",
                lineHeight: 1.1,
              }}>
                Design to<br />Constraint
              </h2>

              <p style={{
                color: "#FF6B00",
                opacity: 0.6,
                fontSize: "13px",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}>
                VeloForge iterates automatically.<br />
                No engineer in the loop until<br />
                a validated design is found.
              </p>

              {/* Iteration Table */}
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.05em",
                borderLeft: "1px solid rgba(255,107,0,0.2)",
                paddingLeft: "16px",
                marginBottom: "20px",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                }}>
                  <div style={{ width: "44px" }}>ITER</div>
                  <div style={{ width: "72px" }}>DIM</div>
                  <div style={{ width: "72px" }}>SF_MIN</div>
                  <div style={{ flex: 1 }}>STATUS</div>
                </div>

                {/* Data rows */}
                {ITERATIONS.map((row, i) => {
                  const isOpt = row.status === "SAVED";
                  return (
                    <div
                      key={i}
                      ref={(el) => {
                        rowsRef.current[i] = el;
                        if (isOpt) optRowRef.current = el;
                      }}
                      style={{
                        display: "flex",
                        padding: "7px 0",
                        borderBottom: i === ITERATIONS.length - 1
                          ? "none"
                          : "1px solid rgba(255,255,255,0.04)",
                        visibility: "hidden",
                        opacity: 0,
                        willChange: "transform, opacity",
                        ...(isOpt ? {
                          background: "rgba(255,107,0,0.06)",
                          border: "1px solid rgba(255,107,0,0.5)",
                          marginTop: 4,
                          padding: "7px 6px",
                        } : {}),
                        ...getRowStyle(row.status),
                      }}
                    >
                      <div style={{
                        width: "44px",
                        color: isOpt ? "#FF6B00" : "rgba(255,255,255,0.7)",
                        fontWeight: isOpt ? 700 : 400,
                      }}>{row.num}</div>
                      <div style={{
                        width: "72px",
                        color: "rgba(255,255,255,0.7)",
                      }}>{row.dim}</div>
                      <div style={{
                        width: "72px",
                        color: getSFColor(row.status),
                        fontWeight: row.status !== "FAIL" ? 700 : 400,
                      }}>{row.stress}</div>
                      <div style={{
                        flex: 1,
                        color: row.status === "FAIL" ? "#FF2200" : (row.status === "PASS" ? "#FF6B00" : "#00FF8C"),
                      }}>
                        {row.status === "FAIL"  && "✗ FAIL"}
                        {row.status === "PASS"  && "✓ PASS"}
                        {row.status === "SAVED" && "✓ SAVED"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Result Box */}
              <div
                ref={resultRef}
                style={{
                  border: "1px solid #FF6B00",
                  background: "rgba(255,107,0,0.04)",
                  padding: "20px 24px",
                  marginBottom: "20px",
                  visibility: "hidden",
                  opacity: 0,
                  willChange: "transform, opacity",
                }}
              >
                <div style={{
                  color: "white",
                  fontFamily: "'Bierika', sans-serif",
                  fontSize: "15px",
                  marginBottom: "16px",
                  letterSpacing: "0.02em",
                }}>
                  brake_bracket_optimized.stl
                </div>

                {/* Stats grid — count up on reveal */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 24px",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {[
                    { label: "WEIGHT REDUCTION", value: `${weightReduction > 0 ? "" : ""}${weightReduction.toFixed(1)}%`, accent: true },
                    { label: "SAFETY FACTOR",    value: `${safetyFactor.toFixed(3)}×`,  accent: false },
                    { label: "PEAK VON MISES",   value: `${peakStress.toFixed(1)} MPa`, accent: false },
                    { label: "ITERATIONS",        value: `N: ${Math.round(iterations)}`,  accent: false },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div style={{
                        color: "rgba(255,107,0,0.5)",
                        fontSize: "8px",
                        letterSpacing: "0.1em",
                        marginBottom: 3,
                      }}>{stat.label}</div>
                      <div style={{
                        color: stat.accent ? "#00FF8C" : "#FF6B00",
                        fontSize: "16px",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                      }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  ref={btn1Ref}
                  style={{
                    padding: "12px 20px",
                    background: "#FF6B00",
                    color: "#0A0A0B",
                    border: "none",
                    fontFamily: "var(--font-display)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    visibility: "hidden",
                    opacity: 0,
                    willChange: "transform, opacity",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#FF8533"}
                  onMouseOut={(e)  => e.currentTarget.style.background = "#FF6B00"}
                >
                  DOWNLOAD .STL
                </button>
                <button
                  ref={btn2Ref}
                  style={{
                    padding: "12px 20px",
                    background: "transparent",
                    color: "#FF6B00",
                    border: "1px solid #FF6B00",
                    fontFamily: "var(--font-display)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    visibility: "hidden",
                    opacity: 0,
                    willChange: "transform, opacity",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,107,0,0.08)"}
                  onMouseOut={(e)  => e.currentTarget.style.background = "transparent"}
                >
                  RUN YOUR PART →
                </button>
              </div>
            </div>

            {/* ── RIGHT COLUMN — transparent (3D shows through) ── */}
            <div style={{ width: "50%", background: "transparent", pointerEvents: "none" }} />
          </div>
        </div>
      </section>
    </>
  );
}
