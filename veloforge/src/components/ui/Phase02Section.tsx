"use client";

/**
 * Phase02Section — "The Invisible Force" · FEA Pipeline
 *
 * Architecture (phases.md SAFE SECTION ARCHITECTURE):
 *   <section>  400vh · position relative  ← scroll distance (5 cards × ~80vh)
 *     <sticky>  100vh · position sticky top:0  ← layout stays on screen
 *       TOP BAR · then grid: 40% terminal | 60% pipeline cards
 *
 * No GSAP pin. ScrollTrigger onUpdate drives card activation + terminal lines.
 * Connector vertical line scrubs via section scroll.
 */

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────

interface PipelineCard {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  detail: string;
}

const PIPELINE_CARDS: PipelineCard[] = [
  { id: "card-01", step: "01", title: "VOLUMETRIC MESHING",   subtitle: "fTetWild · .stl → .mesh",       detail: "4,847 C3D10 tet elements"      },
  { id: "card-02", step: "02", title: "SETUP SERIALIZATION",  subtitle: "InpSerializer · Abaqus .inp",   detail: "E=71.7GPa · ν=0.33"            },
  { id: "card-03", step: "03", title: "FEA SOLVER",           subtitle: "CalculiX (ccx) invoked",        detail: "6000N bump · bolt holes fixed"  },
  { id: "card-04", step: "04", title: "DATA CONVERSION",      subtitle: "ccx2paraview · .frd → .vtu",    detail: ""                              },
  { id: "card-05", step: "05", title: "RESULT PARSING",       subtitle: "Peak Von Mises: 148.9 MPa",     detail: "Max Disp: 0.23mm"              },
];

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

// ── Component ─────────────────────────────────────────────────────────────────

export interface Phase02SectionProps {
  onActiveCardChange?: (idx: number) => void;
  onCameraUpdate?: (pos: [number, number, number], fov: number) => void;
}

export default function Phase02Section({ onActiveCardChange, onCameraUpdate }: Phase02SectionProps) {
  const sectionRef    = useRef<HTMLElement>(null);
  const sweepRef      = useRef<HTMLDivElement>(null);
  const connectorRef  = useRef<HTMLDivElement>(null);
  const cardRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const stepNumRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const pulseKills    = useRef<gsap.core.Tween[]>([]);

  const [visibleLines, setVisibleLines] = useState(0);
  const [activeCard,   setActiveCard]   = useState(-1);

  // Animate terminal lines
  useEffect(() => {
    lineRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i < visibleLines) {
        gsap.to(el, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", immediateRender: false });
      } else {
        gsap.set(el, { autoAlpha: 0, x: -10 });
      }
    });
  }, [visibleLines]);

  // Highlight active / completed cards
  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      card.classList.remove("active", "completed");
      if (i < activeCard)  card.classList.add("completed");
      if (i === activeCard) card.classList.add("active");
    });

    pulseKills.current.forEach((t) => t.kill());
    pulseKills.current = [];

    const el = stepNumRefs.current[activeCard];
    if (el) {
      const t = gsap.to(el, { scale: 1.05, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
      pulseKills.current.push(t);
    }
    
    if (onActiveCardChange) {
      onActiveCardChange(activeCard);
    }
  }, [activeCard, onActiveCardChange]);

  useEffect(() => {
    const section   = sectionRef.current;
    const sweep     = sweepRef.current;
    const connector = connectorRef.current;
    if (!section || !sweep || !connector) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    }, (ctx) => {
      const { reduceMotion } = ctx.conditions as { isDesktop: boolean; isMobile: boolean; reduceMotion: boolean };

      // ── Sweep line ───────────────────────────────────────────────────────
      const sweepTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(sweep,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: reduceMotion ? 0 : 0.4, ease: "power2.inOut", immediateRender: false }
          );
          if (onCameraUpdate) onCameraUpdate([-1.8, 0.5, 4.0], 50);
        },
        onLeaveBack: () => {
          gsap.to(sweep, { scaleX: 0, duration: reduceMotion ? 0 : 0.3, ease: "power2.in" });
          if (onCameraUpdate) onCameraUpdate([1.5, 1.2, 3.5], 48); // Phase 01 pos
        }
      });

      // ── Card stagger entrance ────────────────────────────────────────────
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(cards, { autoAlpha: 0, y: 20 });
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
      });

      // ── Connector fill — scrubs full section travel ──────────────────────
      const connectorTween = gsap.to(connector, {
        scaleY: 1,
        transformOrigin: "top",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // ── Card + terminal activation via scroll position ───────────────────
      const activationST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const cardIdx = Math.min(Math.floor(p * PIPELINE_CARDS.length), PIPELINE_CARDS.length - 1);
          setActiveCard(cardIdx);
          const visibleCount = Math.min(Math.ceil(p * TERMINAL_LINES.length), TERMINAL_LINES.length);
          setVisibleLines(visibleCount);
        },
      });

      if (reduceMotion) {
        setActiveCard(PIPELINE_CARDS.length - 1);
        setVisibleLines(TERMINAL_LINES.length);
        gsap.set(cards, { autoAlpha: 1, y: 0 });
      }

      return () => {
        sweepTrigger.kill();
        connectorTween.scrollTrigger?.kill();
        activationST.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="phase-02"
      className="phase-section"
      ref={sectionRef}
      aria-label="Phase 02 — Automated FEA Pipeline"
      style={{ minHeight: "400vh" }}
    >
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

        {/* Top bar */}
        <div style={{
          borderBottom: "1px solid rgba(255,107,0,0.2)",
          padding: "24px 60px",
          flexShrink: 0,
        }}>
          <span className="phase-label" style={{ marginBottom: 0 }}>
            PHASE 02 — AUTOMATED FEA PIPELINE
          </span>
        </div>

        {/* Main content */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40% 60%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}>
          {/* ── LEFT: heading + body + terminal ── */}
          <div style={{
            padding: "32px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRight: "1px solid rgba(255,107,0,0.08)",
            overflow: "hidden",
          }}>
            <h2 className="phase-heading wordmark">Headless Simulation</h2>
            <p className="phase-body">
              Zero human interaction. VeloForge<br />
              pipes the geometry through a full<br />
              structural solver automatically.
            </p>

            {/* Terminal feed */}
            <div style={{
              borderLeft: "2px solid rgba(255,107,0,0.4)",
              paddingLeft: 16,
              marginTop: 8,
              overflow: "hidden",
            }}>
              {TERMINAL_LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => { lineRefs.current[i] = el; }}
                  style={{
                    color: "rgba(255,107,0,0.7)",
                    fontSize: 11,
                    lineHeight: 1.9,
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

          {/* ── RIGHT: 5-step pipeline cards ── */}
          <div style={{
            padding: "32px 40px 32px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Connecting vertical line */}
            <div style={{
              position: "absolute",
              left: 48,
              top: "10%",
              width: 1,
              height: "80%",
              background: "rgba(255,107,0,0.15)",
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
                }}
              />
            </div>

            {/* Cards */}
            {PIPELINE_CARDS.map((card, i) => (
              <div
                id={card.id}
                key={card.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="pipeline-card"
                style={{ marginLeft: 32, marginBottom: 4 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <span
                    ref={(el) => { stepNumRefs.current[i] = el; }}
                    style={{
                      color: "#FF6B00",
                      opacity: 0.3,
                      fontSize: 20,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      lineHeight: 1,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  >
                    {card.step}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: "#E8E8E8",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      fontFamily: "'IBM Plex Mono', monospace",
                      marginBottom: 4,
                    }}>
                      {card.title}
                    </div>
                    <div style={{
                      color: "rgba(255,107,0,0.7)",
                      fontSize: 10,
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
