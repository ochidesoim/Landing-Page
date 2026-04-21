"use client";

/**
 * Phase01Section — "Code as Sculpture" · Generative Geometry
 *
 * Architecture (phases.md SAFE SECTION ARCHITECTURE):
 *   <section>  300vh tall · position relative  ← scroll distance for scrub
 *     <sticky>  100vh · position sticky top:0  ← visible layout stays on screen
 *       <grid>  45% left | 55% right transparent
 *
 * No GSAP pin. ScrollTrigger scrubs code typing as section scrolls past.
 * GSAP RULES (phases.md): autoAlpha · x/y/scale · matchMedia · stagger
 */

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Code lines with syntax metadata ──────────────────────────────────────────

interface CodeLine {
  text: string;
  type: "comment" | "keyword" | "normal" | "method";
  keyEvent?: "union" | "subtract_axle" | "subtract_pocket" | "export";
}

const CODE_LINES: CodeLine[] = [
  { text: "// Phase 1: Generative Geometry",         type: "comment"  },
  { text: "var body = new Box(",                     type: "keyword"  },
  { text: "  width:  54.0f,",                        type: "normal"   },
  { text: "  height: 38.0f,",                        type: "normal"   },
  { text: "  dep:    bodyDep        // 22.0mm",       type: "normal"   },
  { text: ");",                                      type: "normal"   },
  { text: "var mount = new Cylinder(",               type: "keyword"  },
  { text: "  r: 14.0f, h: bodyDep",                 type: "normal"   },
  { text: ");",                                      type: "normal"   },
  { text: "geo = geo.Union(mount);",                 type: "method",  keyEvent: "union"          },
  { text: "var axleBore = new Cylinder(",            type: "keyword"  },
  { text: "  r: 8.5f, h: bodyDep + 2f",             type: "normal"   },
  { text: ");",                                      type: "normal"   },
  { text: "geo = geo.Subtract(axleBore);",           type: "method",  keyEvent: "subtract_axle"  },
  { text: "for (int i = 0; i < 9; i++) {",          type: "keyword"  },
  { text: "  var pocket = new Cylinder(",            type: "keyword"  },
  { text: "    r: pocketDep, h: bodyDep",            type: "normal"   },
  { text: "  );",                                   type: "normal"   },
  { text: "  geo = geo.Subtract(pocket);",          type: "method",  keyEvent: "subtract_pocket" },
  { text: "}",                                      type: "normal"   },
  { text: "mesh.ExportStl(",                        type: "method",  keyEvent: "export"         },
  { text: "  \"brake_bracket_v1.stl\"",             type: "normal"   },
  { text: ");",                                     type: "normal"   },
];

function getLineColor(type: CodeLine["type"]): string {
  switch (type) {
    case "comment":  return "rgba(255,107,0,0.4)";
    case "keyword":  return "rgba(0,207,255,0.7)";
    case "method":   return "rgba(255,69,0,0.9)";
    default:         return "rgba(255,255,255,0.9)";
  }
}

export interface Phase01SectionProps {
  onConstructionEvent?: (event: "box" | "union" | "subtract_axle" | "subtract_pocket" | "export") => void;
  onCameraUpdate?: (pos: [number, number, number], fov: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Phase01Section({ onConstructionEvent, onCameraUpdate }: Phase01SectionProps) {
  const sectionRef       = useRef<HTMLElement>(null);
  const sweepRef         = useRef<HTMLDivElement>(null);
  const progressFillRef  = useRef<HTMLDivElement>(null);
  const lineRefs         = useRef<(HTMLSpanElement | null)[]>([]);
  const triggeredEvents  = useRef<Set<string>>(new Set());

  const onEventRef = useRef(onConstructionEvent);
  useEffect(() => { onEventRef.current = onConstructionEvent; }, [onConstructionEvent]);

  const fireEvent = useCallback((ev: "box" | "union" | "subtract_axle" | "subtract_pocket" | "export") => {
    if (triggeredEvents.current.has(ev)) return;
    triggeredEvents.current.add(ev);
    onEventRef.current?.(ev);
  }, []);

  useEffect(() => {
    const section  = sectionRef.current;
    const sweep    = sweepRef.current;
    const progFill = progressFillRef.current;
    if (!section || !sweep || !progFill) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    }, (ctx) => {
      const { reduceMotion } = ctx.conditions as { isDesktop: boolean; isMobile: boolean; reduceMotion: boolean };

      // ── Sweep line — fires once on section enter ─────────────────────────
      const sweepTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(sweep,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: reduceMotion ? 0 : 0.4, ease: "power2.inOut" }
          );
          fireEvent("box");
          if (onCameraUpdate) onCameraUpdate([1.5, 1.2, 3.5], 48);
        },
        onLeaveBack: () => {
          gsap.to(sweep, { scaleX: 0, duration: reduceMotion ? 0 : 0.3, ease: "power2.in" });
          if (onCameraUpdate) onCameraUpdate([0, 0.1, 3.8], 60);
        }
      });

      // ── Progress fill — scrubs full section travel ───────────────────────
      const progressTween = gsap.to(progFill, {
        scaleX: 1,
        transformOrigin: "left",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // ── Code typing — scroll-scrubbed character reveal ───────────────────
      const totalChars = CODE_LINES.reduce((s, l) => s + l.text.length, 0);
      let charsSoFar = 0;
      const lineStartChars: number[] = [];
      CODE_LINES.forEach((l) => {
        lineStartChars.push(charsSoFar);
        charsSoFar += l.text.length;
      });

      const keyThresholds: Record<string, number> = {};
      CODE_LINES.forEach((l, i) => {
        if (l.keyEvent) {
          keyThresholds[l.keyEvent] = (lineStartChars[i] + l.text.length) / totalChars;
        }
      });

      const firedKeyEvents = new Set<string>();

      const codeScrubST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: reduceMotion ? false : 1,
        onUpdate: (self) => {
          const p = self.progress;
          const charsVisible = Math.floor(p * totalChars);

          let charsLeft = charsVisible;
          CODE_LINES.forEach((line, i) => {
            const el = lineRefs.current[i];
            if (!el) return;
            if (charsLeft <= 0) {
              el.textContent = "";
            } else if (charsLeft >= line.text.length) {
              el.textContent = line.text;
              charsLeft -= line.text.length;
            } else {
              el.textContent = line.text.slice(0, charsLeft);
              charsLeft = 0;
            }
          });

          // Fire key events at character thresholds
          Object.entries(keyThresholds).forEach(([ev, threshold]) => {
            if (p >= threshold && !firedKeyEvents.has(ev)) {
              firedKeyEvents.add(ev);
              const lineIdx = CODE_LINES.findIndex((l) => l.keyEvent === ev);
              const el = lineRefs.current[lineIdx];
              if (el && !reduceMotion) {
                gsap.to(el, { color: "#FFFFFF", duration: 0.1, yoyo: true, repeat: 1 });
              }
              fireEvent(ev as "union" | "subtract_axle" | "subtract_pocket" | "export");
            }
          });

          if (p < 0.05) firedKeyEvents.clear();
        },
      });

      if (reduceMotion) {
        CODE_LINES.forEach((line, i) => {
          const el = lineRefs.current[i];
          if (el) el.textContent = line.text;
        });
        ["union", "subtract_axle", "subtract_pocket", "export"].forEach((ev) =>
          fireEvent(ev as "box" | "union" | "subtract_axle" | "subtract_pocket" | "export")
        );
      }

      return () => {
        sweepTrigger.kill();
        progressTween.scrollTrigger?.kill();
        codeScrubST.kill();
      };
    });

    return () => mm.revert();
  }, [fireEvent]);

  return (
    <section
      id="phase-01"
      className="phase-section"
      ref={sectionRef}
      aria-label="Phase 01 — Generative Geometry"
      style={{ minHeight: "300vh" }}
    >
      {/* CSS-sticky inner wrapper — stays visible while section scrolls */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Sweep line at section boundary */}
        <div className="sweep-line" ref={sweepRef} />

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "45% 55%",
          flex: 1,
          minHeight: 0,
        }}>
          {/* ── LEFT COLUMN ── */}
          <div className="phase-left-col" style={{ borderRight: "1px solid rgba(255,107,0,0.08)" }}>
            <div className="phase-label">PHASE 01 — GENERATIVE GEOMETRY</div>

            <h2 className="phase-heading wordmark">Programmatic Construction</h2>

            <p className="phase-body">
              No CAD software. No manual modeling.<br />
              VeloForge builds geometry by defining<br />
              analytical volumes in pure code.
            </p>

            {/* Code block */}
            <div className="phase-code-block">
              {CODE_LINES.map((line, i) => (
                <div key={i} style={{ minHeight: "1.8em" }}>
                  <span
                    ref={(el) => { lineRefs.current[i] = el; }}
                    style={{
                      color: getLineColor(line.type),
                      whiteSpace: "pre",
                      display: "inline-block",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Powered-by label */}
            <div style={{
              marginTop: 16,
              color: "rgba(255,107,0,0.35)",
              fontSize: 9,
              letterSpacing: "0.1em",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              Powered by Leap71 ShapeKernel + PicoGK
            </div>

            {/* Phase progress */}
            <div className="phase-progress-wrap">
              <div className="phase-progress-label">PHASE 01 / 03</div>
              <div className="phase-progress-track">
                <div className="phase-progress-fill" ref={progressFillRef} />
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
