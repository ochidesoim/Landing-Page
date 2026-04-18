"use client";

/**
 * SpecCard — The "lock" moment (Lusion ref_1 steal)
 *
 * When the pipeline completes, the 3D geometry "morphs" INTO
 * this flat spec card — matching the lusion.co moment where
 * 3D transitions into a functional UI element.
 *
 * The card slides up from the bottom, overlapping the 3D scene,
 * and presents the validated spec with the heatmap gradient legend.
 * The geometry remains visible behind it, rotating slowly.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";

const SPECS = [
  { label: "AXLE BORE",       value: "Ø 17.000",  unit: "mm"  },
  { label: "CALIPER OFFSET",  value: "54.500",     unit: "mm"  },
  { label: "WALL THICKNESS",  value: "4.200",      unit: "mm"  },
  { label: "BOLT PATTERN R",  value: "28.000",     unit: "mm"  },
  { label: "MATERIAL",        value: "Al 7075-T6", unit: ""    },
  { label: "SAFETY FACTOR",   value: "1.847",      unit: "×"   },
  { label: "PEAK VON MISES",  value: "148.9",      unit: "MPa" },
  { label: "MAX DISP",        value: "0.023",      unit: "mm"  },
  { label: "MASS",            value: "186.4",      unit: "g"   },
  { label: "REDUCTION",       value: "−11.3",      unit: "%"   },
];

interface SpecCardProps {
  visible: boolean;
}

export default function SpecCard({ visible }: SpecCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const lineRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    if (visible) {
      // Slide up + fade in
      gsap.to(cardRef.current, { 
        y: 0, opacity: 1, duration: 0.85, ease: "power4.out", pointerEvents: "auto" 
      });
      // Animate the heatmap line
      if (lineRef.current) {
        gsap.to(lineRef.current, { 
          scaleX: 1, duration: 1.2, ease: "power3.out", delay: 0.4 
        });
      }
    } else {
      // Slide down + fade out when scrolling back up
      gsap.to(cardRef.current, { 
        y: 60, opacity: 0, duration: 0.6, ease: "power3.in", pointerEvents: "none" 
      });
      if (lineRef.current) {
        gsap.to(lineRef.current, { 
          scaleX: 0, duration: 0.4, ease: "power2.in" 
        });
      }
    }
  }, [visible]);

  return (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 15,
        pointerEvents: "none",
        opacity: 0,
        transform: "translateY(60px)",
      }}
    >
      {/* Heatmap bar — the pipeline story in one stripe */}
      <div style={{ padding: "0 2rem" }}>
        <div
          ref={lineRef}
          style={{
            height: "2px",
            background: "linear-gradient(90deg, #00D4FF 0%, #00FF8C 30%, #FFD600 60%, #FF6B00 100%)",
            marginBottom: "0",
          }}
        />
      </div>

      {/* Card body */}
      <div
        style={{
          background: "rgba(8,8,10,0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(232,232,232,0.06)",
          padding: "1.8rem 2rem",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "end",
        }}
      >
        {/* Left: specs grid */}
        <div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "0.8rem 2rem",
          }}>
            {SPECS.map((s) => (
              <div key={s.label}>
                <p style={{
                  color: "rgba(232,232,232,0.3)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.14em",
                  marginBottom: "0.2rem",
                  fontFamily: "IBM Plex Mono, monospace",
                }}>
                  {s.label}
                </p>
                <p style={{
                  color: s.label === "SAFETY FACTOR" ? "#FF6B00" : "#E8E8E8",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: "IBM Plex Mono, monospace",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {s.value}
                  {s.unit && (
                    <span style={{ color: "rgba(232,232,232,0.3)", fontWeight: 400, fontSize: "0.6rem", marginLeft: "0.3em" }}>
                      {s.unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", alignItems: "flex-end", flexShrink: 0 }}>
          <button
            style={{
              background: "#FF6B00",
              color: "#08080A",
              border: "none",
              padding: "1rem 2.4rem",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF8330"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6B00"; }}
          >
            RUN YOUR PART →
          </button>
          <span style={{
            color: "rgba(232,232,232,0.2)",
            fontSize: "0.55rem",
            letterSpacing: "0.08em",
            fontFamily: "IBM Plex Mono, monospace",
          }}>
            bracket_r6_validated.stl · 8.1 KB
          </span>
        </div>
      </div>
    </div>
  );
}
