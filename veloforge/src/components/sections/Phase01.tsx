"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CODE_LINES = [
  { text: "// Phase 1: Generative Geometry",         type: "comment"  },
  { text: "var body = new Box(",                     type: "keyword"  },
  { text: "  width:  54.0f,",                        type: "number"   },
  { text: "  height: 38.0f,",                        type: "number"   },
  { text: "  dep:    bodyDep        // 22.0mm",       type: "number"   },
  { text: ");",                                      type: "normal"   },
  { text: "var mount = new Cylinder(",               type: "keyword"  },
  { text: "  r: 14.0f, h: bodyDep",                 type: "number"   },
  { text: ");",                                      type: "normal"   },
  { text: "geo = geo.Union(mount);",                 type: "method",  keyEvent: "union"          },
  { text: "var axleBore = new Cylinder(",            type: "keyword"  },
  { text: "  r: 8.5f, h: bodyDep + 2f",             type: "number"   },
  { text: ");",                                      type: "normal"   },
  { text: "geo = geo.Subtract(axleBore);",           type: "method",  keyEvent: "subtract_axle"  },
  { text: "for (int i = 0; i < 9; i++) {",          type: "keyword"  },
  { text: "  var pocket = new Cylinder(",            type: "keyword"  },
  { text: "    r: pocketDep, h: bodyDep",            type: "number"   },
  { text: "  );",                                   type: "normal"   },
  { text: "  geo = geo.Subtract(pocket);",          type: "method",  keyEvent: "subtract_pocket" },
  { text: "}",                                      type: "normal"   },
  { text: "mesh.ExportStl(",                        type: "method",  keyEvent: "export"         },
  { text: "  \"brake_bracket_v1.stl\"",             type: "normal"   },
  { text: ");",                                     type: "normal"   },
];

function getLineColor(type: string): string {
  switch (type) {
    case "comment":  return "rgba(255,107,0,0.4)";
    case "keyword":  return "rgba(0,207,255,0.7)";   // var new for → #00CFFF 70%
    case "number":   return "rgba(255,255,255,0.9)"; // numbers → white 90%
    case "method":   return "rgba(255,69,0,0.9)";    // .Union .Subtract → #FF4500 90%
    default:         return "rgba(255,107,0,0.8)";   // keywords → #FF6B00 80%
  }
}

export default function Phase01() {
  const sectionRef    = useRef<HTMLElement>(null);
  const pinRef        = useRef<HTMLDivElement>(null);
  const codeLinesRef  = useRef<(HTMLSpanElement | null)[]>([]);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const sweepLineRef  = useRef<HTMLDivElement>(null);

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

      const totalChars = CODE_LINES.reduce((s, l) => s + l.text.length, 0);
      let charsSoFar = 0;
      const lineStartChars: number[] = [];
      CODE_LINES.forEach((l) => {
        lineStartChars.push(charsSoFar);
        charsSoFar += l.text.length;
      });

      const fired = new Set<string>();

      // ── Sweep line on section enter ──────────────────────────────────
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

      // ── Progress line (fills with scroll) ────────────────────────────
      const progressLine = progressLineRef.current;
      const progressST = progressLine ? gsap.to(progressLine, {
        scaleX: 1,
        transformOrigin: "left",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }) : null;

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

          // ── Code typing ──
          const visible = Math.floor(p * totalChars);
          CODE_LINES.forEach((line, i) => {
            const el = codeLinesRef.current[i];
            if (!el) return;
            const start = lineStartChars[i];
            const end   = start + line.text.length;
            if (visible <= start) {
              el.textContent = "";
            } else if (visible >= end) {
              if (el.textContent !== line.text) {
                el.textContent = line.text;
                // Flash key lines white when completed (phases.md spec)
                if (line.keyEvent && !fired.has(`flash-${line.keyEvent}`)) {
                  fired.add(`flash-${line.keyEvent}`);
                  gsap.to(el, {
                    color: "#FFFFFF",
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                      gsap.set(el, { color: getLineColor(line.type) });
                    },
                  });
                }
              }
            } else {
              el.textContent = line.text.substring(0, visible - start);
            }
          });

          // ── 3D construction threshold events ──
          if (p > 0.15 && !fired.has("box"))            { fired.add("box");             window.dispatchEvent(new CustomEvent("vf:geo", { detail: "box"             })); }
          if (p > 0.30 && !fired.has("union"))           { fired.add("union");           window.dispatchEvent(new CustomEvent("vf:geo", { detail: "union"           })); }
          if (p > 0.50 && !fired.has("subtract_axle"))   { fired.add("subtract_axle");   window.dispatchEvent(new CustomEvent("vf:geo", { detail: "subtract_axle"   })); }
          if (p > 0.65 && !fired.has("subtract_pocket")) { fired.add("subtract_pocket"); window.dispatchEvent(new CustomEvent("vf:geo", { detail: "subtract_pocket" })); }
          if (p > 0.90 && !fired.has("export"))          { fired.add("export");          window.dispatchEvent(new CustomEvent("vf:geo", { detail: "export"          })); }
        },
      });

      if (reduceMotion) {
        CODE_LINES.forEach((line, i) => {
          const el = codeLinesRef.current[i];
          if (el) el.textContent = line.text;
        });
        if (progressLine) gsap.set(progressLine, { scaleX: 1 });
      }

      return () => {
        st.kill();
        sweepST.kill();
        progressST?.scrollTrigger?.kill();
        progressST?.kill();
      };
    });

    return () => mm.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      id="phase-01"
      ref={sectionRef}
      aria-label="Phase 01 — Generative Geometry"
      style={{ position: "relative", width: "100vw", minHeight: "300vh", zIndex: 2 }}
    >
      {/* Orange sweep line — appears on section entry */}
      <div
        ref={sweepLineRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "1px",
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
        <div style={{ display: "flex", width: "100%", height: "100%" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{
            width: "45%",
            padding: "80px 60px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#0A0A0B",
            borderRight: "1px solid rgba(255,107,0,0.08)",
          }}>

            <div style={{
              color: "#FF6B00",
              fontSize: "10px",
              letterSpacing: "0.25em",
              fontWeight: 300,
              marginBottom: "24px",
            }}>PHASE 01 — GENERATIVE GEOMETRY</div>

            <h2 style={{
              fontFamily: "'Bierika', sans-serif",
              color: "white",
              fontSize: "48px",
              margin: "0 0 24px 0",
              lineHeight: 1.1,
            }}>
              Programmatic<br />Construction
            </h2>

            <p style={{
              color: "#FF6B00",
              opacity: 0.6,
              fontSize: "13px",
              marginBottom: "32px",
              lineHeight: 1.6,
            }}>
              No CAD software. No manual modeling.<br />
              VeloForge builds geometry by defining<br />
              analytical volumes in pure code.
            </p>

            {/* Code block */}
            <div style={{
              background: "rgba(10,10,11,0.7)",
              border: "1px solid rgba(255,107,0,0.2)",
              borderLeft: "2px solid #FF6B00",
              padding: "20px 24px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              lineHeight: 1.8,
              flex: 1,
              overflow: "hidden",
            }}>
              {CODE_LINES.map((line, i) => (
                <div key={i} style={{ minHeight: "1.8em" }}>
                  <span
                    ref={(el) => { codeLinesRef.current[i] = el; }}
                    style={{
                      color: getLineColor(line.type),
                      whiteSpace: "pre",
                      display: "inline-block",
                      padding: "0 4px",
                      borderRadius: "2px",
                      transition: "color 0.1s",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Phase progress indicator (phases.md spec) */}
            <div style={{ marginTop: "auto", paddingTop: 24 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <span style={{
                  color: "#FF6B00",
                  opacity: 0.35,
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  Powered by Leap71 ShapeKernel + PicoGK
                </span>
                <span style={{
                  color: "#FF6B00",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  fontFamily: "'IBM Plex Mono', monospace",
                  opacity: 0.6,
                }}>
                  PHASE 01 / 03
                </span>
              </div>
              {/* Progress line */}
              <div style={{
                width: "100%",
                height: 1,
                background: "rgba(255,107,0,0.15)",
                overflow: "hidden",
              }}>
                <div
                  ref={progressLineRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#FF6B00",
                    transformOrigin: "left",
                    transform: "scaleX(0)",
                    willChange: "transform",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — transparent (3D shows through) ── */}
          <div style={{ width: "55%", background: "transparent", pointerEvents: "none" }} />
        </div>
      </div>
    </section>
  );
}
