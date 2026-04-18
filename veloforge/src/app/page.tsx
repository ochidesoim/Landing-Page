"use client";

/**
 * VeloForge — Main Page (Phase 4: Scroll + Motion)
 *
 * Scroll architecture:
 *   <body>
 *     canvas-root (position:fixed, z:0)   ← Three.js
 *     scroll-driver (height: 500vh)        ← user scrolls this
 *       sticky-display (sticky, 100vh)     ← UI sticks during scroll
 *     SpecCard (position:fixed, bottom:0)  ← slides up at end
 *
 * All scroll-driven updates go to refs via useScrollScene.
 * React state only updates when phase or line count changes.
 *
 * Performance checklist (fixing-motion-performance):
 *  ✓ No DOM reads in scroll handlers
 *  ✓ Camera + lighting via useFrame refs only
 *  ✓ terminal re-renders only on line count change
 *  ✓ will-change: transform on animated DOM elements
 *  ✓ Lenis + GSAP properly synced, no conflict
 */

import dynamic from "next/dynamic";
import { useRef, useState, useCallback, useEffect } from "react";
import * as THREE from "three";
import type { ScenePhase } from "@/components/3d/HeroScene";
import { useScrollScene } from "@/hooks/useScrollScene";
import SpecCard from "@/components/ui/SpecCard";
import AerospaceCursor from "@/components/ui/AerospaceCursor";


const HeroScene = dynamic(() => import("@/components/3d/HeroScene"), { ssr: false });
const Terminal  = dynamic(() => import("@/components/ui/Terminal"),  { ssr: false });

/* ─── Phase Indicator ───────────────────────────────────────────────────────── */

const PHASE_LABELS: Record<ScenePhase, string> = {
  0: "AWAITING INPUT",
  1: "GENERATING MESH",
  2: "FEA RUNNING",
  3: "STRESS MAPPED",
};

function PhaseIndicator({ phase }: { phase: ScenePhase }) {
  const color = phase === 3 ? "#FF6B00" : phase === 0 ? "rgba(232,232,232,0.18)" : "#00D4FF";
  return (
    <div style={{ position: "absolute", top: "1.2rem", right: "1.6rem",
                  display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color,
                    boxShadow: phase > 0 ? `0 0 8px ${color}` : "none",
                    transition: "all 0.5s ease" }} />
      <span style={{ color, fontSize: "0.55rem", letterSpacing: "0.14em",
                     fontFamily: "var(--font-mono)", transition: "color 0.5s ease" }}>
        {PHASE_LABELS[phase]}
      </span>
    </div>
  );
}

/* ─── Scroll Hint ───────────────────────────────────────────────────────────── */

function ScrollHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "absolute", bottom: "2rem", left: "50%",
      transform: "translateX(-50%)", textAlign: "center",
      animation: "scrollHintFade 2s ease-in-out infinite",
      pointerEvents: "none",
    }}>
      <div style={{ color: "rgba(232,232,232,0.2)", fontSize: "0.52rem", letterSpacing: "0.16em",
                    fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}>
        SCROLL TO EXECUTE
      </div>
      <div style={{ width: "1px", height: "24px", background: "linear-gradient(#00D4FF, transparent)",
                    margin: "0 auto", animation: "scrollLine 1.6s ease-in-out infinite" }} />
      <style>{`
        @keyframes scrollHintFade { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes scrollLine { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 100%{transform:scaleY(0);transform-origin:bottom} }
      `}</style>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */

export default function Home() {
  // Shared refs — updated on every scroll frame, zero re-renders
  const phaseRef          = useRef<ScenePhase>(0);
  const cameraPositionRef = useRef(new THREE.Vector3(0, 0.1, 3.8));
  const fovTargetRef      = useRef(60);
  const scrollProgressRef = useRef(0);

  // React state — only updates when values actually change
  const [uiPhase,        setUiPhase]        = useState<ScenePhase>(0);
  const [terminalCount,  setTerminalCount]  = useState(0);
  const [isDone,         setIsDone]         = useState(false);
  const [entered,        setEntered]        = useState(false);
  const [overlayFading,  setOverlayFading]  = useState(false);
  const [overlayHidden,  setOverlayHidden]  = useState(false);
  const [glitchText,     setGlitchText]     = useState("VELOFORGE");
  const [instructionVis, setInstructionVis] = useState(true);

  // Manage pointer events
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = overlayHidden ? "auto" : "none";
    }
  }, [overlayHidden]);

  // Stable setters (avoid recreating useScrollScene on every render)
  const handlePhase    = useCallback((p: ScenePhase) => setUiPhase(p),   []);
  const handleCount    = useCallback((n: number)     => setTerminalCount(n), []);
  const handleDone     = useCallback((v: boolean) => setIsDone(v),  []);

  // Mount Lenis + scroll orchestration
  useScrollScene({
    phaseRef,
    cameraPositionRef,
    fovTargetRef,
    scrollProgressRef,
    setTerminalCount:  handleCount,
    setUiPhase:        handlePhase,
    setIsDone:         handleDone,
  });

  return (
    <>
      <AerospaceCursor />

      {/* ── Entry Overlay ── */}
      <div 
        onClick={() => {
          if (entered) return;
          setEntered(true);
          // Step 1: fade out instruction text
          setInstructionVis(false);
          // Phase 1 (0ms to 800ms): fire glitch on VELOFORGE
          const chars = "█▓▒░|/\\-_";
          const original = "VELOFORGE";
          let iterations = 0;
          const interval = setInterval(() => {
            setGlitchText(original.split("").map((char, index) => {
              if (char === " ") return " ";
              if (index < iterations) return original[index];
              return chars[Math.floor(Math.random() * chars.length)];
            }).join(""));
            iterations += 1/3;
            if (iterations > original.length) {
              clearInterval(interval);
              setGlitchText(original);
            }
          }, 30);

          // Phase 2 (800ms to 1500ms): Glitch resolved, overlay opacity still 1

          // Phase 3 (1500ms to 2200ms): start opacity fade
          setTimeout(() => {
            setOverlayFading(true);
          }, 1500);

          // Phase 3 end (2200ms): completely hide from DOM
          setTimeout(() => {
            setOverlayHidden(true);
          }, 2200);
        }}
        style={{
          position: "fixed", inset: 0, zIndex: 99999, background: "#0A0A0B",
          display: overlayHidden ? "none" : "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "none", transition: "opacity 0.7s ease-in",
          opacity: overlayFading ? 0 : 1,
          isolation: "isolate",
          pointerEvents: "auto"
        }}
      >
        {/* Main wordmark — two-tone */}
          <div className="wordmark" style={{
            fontSize: "clamp(52px, 7vw, 96px)", letterSpacing: "0.05em",
            fontFamily: "'Bierika', var(--font-wordmark), sans-serif", fontWeight: 400
          }}>
            {entered ? (
              <span style={{ color: "#FFF" }}>{glitchText}</span>
            ) : (
              <>
                <span style={{ color: "#FFFFFF" }}>VELO</span>
                <span style={{ color: "#FF4500" }}>FORGE</span>
              </>
            )}
          </div>

          {/* Instruction text — Option C: radar sweep */}
          <div style={{
            marginTop: "24px", textAlign: "center",
            opacity: instructionVis ? 1 : 0,
            transition: "opacity 0.2s ease-out",
          }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 300,
              fontSize: "clamp(10px, 1.1vw, 13px)", color: "#FF6B00",
              letterSpacing: "0.3em",
              animation: "radarPulse 1.8s ease-in-out infinite",
            }}>
              — TAP TO INITIALIZE —
            </div>
            {/* Radar sweep line */}
            <div style={{
              width: "180px", height: "1px", margin: "12px auto 0",
              background: "linear-gradient(90deg, transparent, #FF6B00, transparent)",
              animation: "radarSweep 2s linear infinite",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%",
                background: "linear-gradient(90deg, transparent, #FF6B00 50%, transparent)",
                animation: "radarSweepInner 2s linear infinite",
              }} />
            </div>
          </div>
        </div>
      {/* ── Fixed 3D Canvas (z:0, behind everything) ── */}
      <div id="canvas-root" aria-hidden="true"
           style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {/* Single Canvas — no depth-break dual pass needed since model is on right side only */}
        <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
          <HeroScene
            phaseRef={phaseRef}
            cameraPositionRef={cameraPositionRef}
            fovTargetRef={fovTargetRef}
            scrollProgressRef={scrollProgressRef}
          />
        </div>
      </div>

      {/* ── Left Fixed Glass Panel ── */}
      <div className="glass" style={{
        position: "fixed", left: 0, top: 0, width: "42%", height: "100vh",
        background: "rgba(10, 10, 11, 0.45)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255, 107, 0, 0.20)", borderRadius: 0,
        zIndex: 10, paddingTop: "15vh", paddingLeft: "clamp(2rem, 4vw, 4rem)", paddingRight: "2rem",
        display: "flex", flexDirection: "column"
      }}>
        {/* Descriptor */}
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 300,
          fontSize: "clamp(9px, 1vw, 12px)", color: "#FF6B00",
          letterSpacing: "0.25em", marginBottom: "12px",
        }}>
          COMPUTATIONAL ENGINEERING
        </div>
        {/* Wordmark — two-tone */}
        <div className="wordmark" style={{
          fontFamily: "'Bierika', var(--font-wordmark), sans-serif", fontWeight: 400,
          fontSize: "clamp(48px, 6vw, 80px)",
          letterSpacing: "0.05em",
          lineHeight: 1
        }}>
          <span style={{ color: "#FFFFFF", fontFamily: "'Bierika', var(--font-wordmark), sans-serif" }}>VELO</span>
          <span style={{ color: "#FF4500", fontFamily: "'Bierika', var(--font-wordmark), sans-serif" }}>FORGE</span>
        </div>
        
        {/* Spacer */}
        <div style={{ height: "2rem" }} />

        {/* Terminal feed — slides up as SpecCard appears */}
        <div style={{
          flex: 1, minHeight: 0, position: "relative", zIndex: 20,
          transition: "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isDone ? "translateY(-40px)" : "translateY(0)",
        }}>
          <Terminal visibleCount={terminalCount} />
        </div>
      </div>

      {/* ── Scroll Driver — 500vh, user scrolls through this ── */}
      <div style={{ height: "500vh", position: "relative" }}>

        {/* ── Sticky Display — sticks at top during scroll ── */}
        <div style={{
          position: "sticky", top: 0, height: "100vh",
          zIndex: 10, overflow: "hidden",
          display: "flex", flexDirection: "column",
          pointerEvents: "none",
        }}>

          {/* Main split — empty on left since panel is fixed */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

            <div className="hidden md:block w-[42%] pointer-events-none" />

            {/* Right: transparent — 3D shows through (100% mobile, 58% desktop) */}
            <div className="relative overflow-hidden w-full md:w-[58%] h-full">
              <PhaseIndicator phase={uiPhase} />

              {/* Heatmap legend — phase 3 */}
              {uiPhase >= 3 && (
                <div className="glass" style={{ position: "absolute", top: "1.2rem", left: "1.8rem",
                              pointerEvents: "none", animation: "fadeUp 0.7s ease forwards",
                              padding: "0.8rem", borderRadius: "4px",
                              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                  <div style={{ height: "2px", width: "130px",
                                background: "linear-gradient(90deg, #00D4FF, #00FF8C, #FFD600, #FF6B00)",
                                marginBottom: "0.4rem" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", width: "130px" }}>
                    <span style={{ color: "#00D4FF", fontSize: "0.48rem", fontFamily: "var(--font-mono)" }}>0 MPa</span>
                    <span style={{ color: "#FF6B00", fontSize: "0.48rem", fontFamily: "var(--font-mono)" }}>148.9 MPa</span>
                  </div>
                </div>
              )}

              {/* Scroll hint — only before pipeline starts */}
              <ScrollHint visible={terminalCount < 3} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Spec Card — fixed bottom, slides up at done ── */}
      <SpecCard visible={isDone} />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes radarPulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes radarSweep { 0%{opacity:0.3} 50%{opacity:1} 100%{opacity:0.3} }
        @keyframes radarSweepInner { 0%{left:-100%} 100%{left:200%} }
      `}</style>
    </>
  );
}
