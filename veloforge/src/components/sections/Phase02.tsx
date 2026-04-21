"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_CARDS = [
  { id: "card-01", step: "01", title: "VOLUMETRIC MESHING",   subtitle: "fTetWild · .stl → .mesh",      detail: "4,847 C3D10 tet elements"     },
  { id: "card-02", step: "02", title: "SETUP SERIALIZATION",  subtitle: "InpSerializer · Abaqus .inp",  detail: "E=71.7GPa · ν=0.33"           },
  { id: "card-03", step: "03", title: "FEA SOLVER",           subtitle: "CalculiX (ccx) invoked",       detail: "6000N bump · bolt holes fixed" },
  { id: "card-04", step: "04", title: "DATA CONVERSION",      subtitle: "ccx2paraview · .frd → .vtu",   detail: ""                             },
  { id: "card-05", step: "05", title: "RESULT PARSING",       subtitle: "Peak Von Mises: 148.9 MPa",    detail: "Max Disp: 0.23mm"             },
];

// Extended terminal lines per new spec
const TERMINAL_LINES = [
  "[MESH]  fTetWild converting surface...",
  "[MESH]  Elements: 4,847 · Nodes: 8,547",
  "[INP]   Serializing Abaqus input deck...",
  "[INP]   Material: E=71.7GPa · ν=0.33",
  "[INP]   BC: 6000N axle · bolt fixed",
  "[SOLVE] CalculiX invoked · ccx running",
  "[SOLVE] Iteration 1/8 · res: 2.53e-3",
  "[SOLVE] Iteration 3/8 · res: 4.17e-4",
  "[SOLVE] Iteration 8/8 · res: 8.96e-7",
  "[CONV]  Solver converged ✓",
  "[PARSE] Peak stress: 148.9 MPa",
  "[PARSE] Max displacement: 0.23mm",
];

export default function Phase02() {
  const sectionRef      = useRef<HTMLElement>(null);
  const pinRef          = useRef<HTMLDivElement>(null);
  const connectorRef    = useRef<HTMLDivElement>(null);
  const sweepLineRef    = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const stepNumRefs     = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const cardLeftBarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pulseTweens     = useRef<(gsap.core.Tween | null)[]>([]);
  const lastCard        = useRef(-1);

  useEffect(() => {
    const section   = sectionRef.current;
    const pin       = pinRef.current;
    const connector = connectorRef.current;
    if (!section || !pin || !connector) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    }, (ctx) => {
      const { reduceMotion } = ctx.conditions as { reduceMotion: boolean };

      const cards  = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const lines  = lineRefs.current.filter(Boolean) as HTMLDivElement[];

      gsap.set(cards,  { autoAlpha: 0, y: 20 });
      gsap.set(lines,  { autoAlpha: 0, x: -10 });
      gsap.set(connector, { scaleY: 0, transformOrigin: "top" });

      // Kill any running pulse tweens on card deactivation
      function killPulse(i: number) {
        if (pulseTweens.current[i]) {
          pulseTweens.current[i]!.kill();
          pulseTweens.current[i] = null;
        }
      }

      function applyCardState(i: number, state: "inactive" | "active" | "completed", reduceMotion: boolean) {
        const card    = cardRefs.current[i];
        const stepNum = stepNumRefs.current[i];
        const leftBar = cardLeftBarRefs.current[i];
        if (!card || !stepNum || !leftBar) return;

        killPulse(i);

        if (state === "inactive") {
          card.style.border           = "1px solid rgba(255,107,0,0.2)";
          card.style.background       = "rgba(10,10,11,0.5)";
          leftBar.style.background    = "rgba(255,107,0,0.2)";
          stepNum.style.opacity       = "0.3";
          stepNum.textContent         = PIPELINE_CARDS[i].step;
          stepNum.style.color         = "#FF6B00";
        } else if (state === "active") {
          card.style.border           = "1px solid rgba(255,107,0,0.8)";
          card.style.background       = "rgba(255,107,0,0.04)";
          leftBar.style.background    = "#FF6B00";
          stepNum.style.opacity       = "1";
          stepNum.textContent         = PIPELINE_CARDS[i].step;
          stepNum.style.color         = "#FF6B00";
          // Pulse animation on active step number
          if (!reduceMotion) {
            pulseTweens.current[i] = gsap.to(stepNum, {
              scale: 1.05,
              duration: 1,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          }
        } else { // completed
          card.style.border           = "1px solid rgba(255,107,0,0.4)";
          card.style.background       = "rgba(10,10,11,0.5)";
          leftBar.style.background    = "rgba(255,107,0,0.5)";
          stepNum.style.opacity       = "1";
          stepNum.textContent         = "✓";
          stepNum.style.color         = "#FFFFFF";
        }
      }

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

      // ── Card stagger entrance ─────────────────────────────────────────
      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.12,
        ease: "power2.out",
        duration: reduceMotion ? 0 : 0.4,
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
        onStart: () => {
          cards.forEach((_, i) => applyCardState(i, "inactive", reduceMotion));
        },
      });

      // ── GSAP PIN ─────────────────────────────────────────────────────
      const st = ScrollTrigger.create({
        trigger:       section,
        pin:           pin,
        pinSpacing:    false,
        start:         "top top",
        end:           "+=200%",
        anticipatePin: 1,
        scrub:         1,
        onUpdate: (self) => {
          if (reduceMotion) return;
          const p = self.progress;

          // ── Connector fills with progress ──
          gsap.set(connector, { scaleY: p });

          // ── Card activation at thresholds ──
          const newCard =
            p > 0.82 ? 4 :
            p > 0.64 ? 3 :
            p > 0.46 ? 2 :
            p > 0.28 ? 1 :
            p > 0.10 ? 0 : -1;

          if (newCard !== lastCard.current) {
            const prev = lastCard.current;
            lastCard.current = newCard;

            PIPELINE_CARDS.forEach((_, i) => {
              if (i < newCard)       applyCardState(i, "completed", reduceMotion);
              else if (i === newCard) applyCardState(i, "active",    reduceMotion);
              else                   applyCardState(i, "inactive",   reduceMotion);
            });
            void prev;
          }

          // ── Terminal lines appear with card activation ──
          const visibleLines = Math.ceil(p * TERMINAL_LINES.length);
          lines.forEach((line, i) => {
            if (!line) return;
            if (i < visibleLines) {
              gsap.to(line, { autoAlpha: 1, x: 0, duration: 0.2, ease: "power2.out", overwrite: "auto" });
            }
          });

          // ── Particle flow phase dispatch ──
          const phase =
            p >= 0.70 ? "solved" :
            p >= 0.40 ? "converging" : "chaos";
          window.dispatchEvent(new CustomEvent("vf:particlePhase", { detail: phase }));
        },
      });

      if (reduceMotion) {
        gsap.set(cards,  { autoAlpha: 1, y: 0 });
        gsap.set(lines,  { autoAlpha: 1, x: 0 });
        gsap.set(connector, { scaleY: 1 });
        PIPELINE_CARDS.forEach((_, i) => applyCardState(i, i < PIPELINE_CARDS.length - 1 ? "completed" : "active", reduceMotion));
      }

      return () => {
        st.kill();
        sweepST.kill();
        pulseTweens.current.forEach((t) => t?.kill());
      };
    });

    return () => mm.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      id="phase-02"
      ref={sectionRef}
      aria-label="Phase 02 — Automated FEA Pipeline"
      style={{ position: "relative", width: "100vw", minHeight: "300vh", zIndex: 2 }}
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
            PHASE 02 — AUTOMATED FEA PIPELINE
          </span>
        </div>

        {/* Main content */}
        <div style={{
          display: "flex",
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}>
          {/* ── LEFT: 40% ── */}
          <div style={{
            width: "40%",
            padding: "32px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRight: "1px solid rgba(255,107,0,0.08)",
            background: "#0A0A0B",
            overflow: "hidden",
          }}>
            <h2 style={{
              fontFamily: "'Bierika', sans-serif",
              color: "white",
              fontSize: "48px",
              margin: "0 0 16px 0",
              lineHeight: 1.1,
            }}>Headless Simulation</h2>

            <p style={{
              color: "#FF6B00",
              opacity: 0.6,
              fontSize: "13px",
              marginBottom: "24px",
              lineHeight: 1.6,
            }}>
              Zero human interaction. VeloForge<br />
              pipes the geometry through a full<br />
              structural solver automatically.
            </p>

            {/* Terminal feed */}
            <div style={{
              borderLeft: "2px solid rgba(255,107,0,0.4)",
              paddingLeft: 16,
              overflow: "hidden",
              flex: 1,
            }}>
              {TERMINAL_LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => { lineRefs.current[i] = el; }}
                  style={{
                    color: "rgba(255,107,0,0.7)",
                    fontSize: 10,
                    lineHeight: 1.8,
                    fontFamily: "'IBM Plex Mono', monospace",
                    whiteSpace: "pre",
                    visibility: "hidden",
                    opacity: 0,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: 60% — pipeline cards ── */}
          <div style={{
            width: "60%",
            padding: "32px 40px 32px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: "transparent",
            pointerEvents: "none",
          }}>
            {/* Vertical connector */}
            <div style={{
              position: "absolute",
              left: 68,
              top: "8%",
              width: 1,
              height: "84%",
              background: "rgba(255,107,0,0.12)",
              overflow: "hidden",
            }}>
              <div
                ref={connectorRef}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#FF6B00",
                  transformOrigin: "top",
                  transform: "scaleY(0)",
                  willChange: "transform",
                }}
              />
            </div>

            {/* Cards */}
            {PIPELINE_CARDS.map((card, i) => (
              <div
                key={card.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                style={{
                  marginLeft: 88,
                  marginBottom: 6,
                  padding: "14px 16px",
                  background: "rgba(10,10,11,0.5)",
                  border: "1px solid rgba(255,107,0,0.2)",
                  display: "flex",
                  alignItems: "stretch",
                  gap: 0,
                  visibility: "hidden",
                  opacity: 0,
                  willChange: "transform, opacity",
                  transition: "border 0.2s, background 0.2s",
                }}
              >
                {/* Left accent bar */}
                <div
                  ref={(el) => { cardLeftBarRefs.current[i] = el; }}
                  style={{
                    width: 2,
                    background: "rgba(255,107,0,0.2)",
                    marginRight: 16,
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1 }}>
                  <span
                    ref={(el) => { stepNumRefs.current[i] = el; }}
                    style={{
                      color: "#FF6B00",
                      fontSize: 18,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      lineHeight: 1,
                      flexShrink: 0,
                      opacity: 0.3,
                      display: "inline-block",
                      willChange: "transform",
                    }}
                  >
                    {card.step}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      fontFamily: "'IBM Plex Mono', monospace",
                      marginBottom: 4,
                    }}>
                      {card.title}
                    </div>
                    <div style={{
                      color: "rgba(255,107,0,0.7)",
                      fontSize: 9,
                      fontFamily: "'IBM Plex Mono', monospace",
                      lineHeight: 1.6,
                    }}>
                      {card.subtitle}
                      {card.detail && <><br />{card.detail}</>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
