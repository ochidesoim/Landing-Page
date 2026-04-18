"use client";

/**
 * DIRECTION 3 — "THE EXECUTABLE"
 *
 * Aesthetic: Industrial Brutalist + Retro-Futurist Terminal
 * DFII: Impact 5 + Fit 4 + Feasibility 4 + Performance 4 − Risk 1 = 16 → cap 15 (Excellent)
 *
 * The RISKY one.
 *
 * Core premise: VeloForge is not a website. It is a running process.
 * The hero is a terminal window — authentic, monospaced, scrolling stdout.
 * You watch the pipeline execute in real-time: mesh generation, FEA setup,
 * solver convergence, result extraction. Then at 100%: the terminal
 * SHATTERS — the text fragments into 3D space and the geometry
 * assembles from the exploded characters.
 *
 * This is high-risk because it hides the product behind a CLI metaphor.
 * But the payoff: engineers will feel it in their bones the moment they see it.
 * This IS how they think. This IS what VeloForge actually does.
 *
 * Differentiation: No other SaaS site opens with a running executable.
 * The 3D reveal is earned — you watch the computation before you see the part.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

/* ─── Terminal Lines ───────────────────────────────────────────────────────── */

const PIPELINE_OUTPUT = [
  { delay: 0.0,  text: "$ veloforge run --input params.json",          color: "#E8E8E8" },
  { delay: 0.5,  text: "[INFO]  Loading parameter set v2.1.0",          color: "#00D4FF" },
  { delay: 0.9,  text: "[MESH]  Generating brake bracket geometry...",  color: "#00D4FF" },
  { delay: 1.3,  text: "[MESH]  Extruding profile — 2847 faces",       color: "#00D4FF" },
  { delay: 1.6,  text: "[MESH]  Draco compression: 97.3KB → 8.1KB",   color: "#00D4FF" },
  { delay: 2.0,  text: "[FEA]   Setting up finite element analysis...", color: "#00D4FF" },
  { delay: 2.4,  text: "[FEA]   Nodes: 14,392  Elements: 9,847",       color: "#00D4FF" },
  { delay: 2.8,  text: "[FEA]   Applying boundary conditions...",       color: "#00D4FF" },
  { delay: 3.2,  text: "[FEA]   Axle load: 2.4 kN  Caliper: 54.5mm", color: "#00D4FF" },
  { delay: 3.7,  text: "[SOLVE] Running sparse direct solver...",       color: "#FFD600" },
  { delay: 4.4,  text: "[SOLVE] Iteration 1/8  residual: 2.31e-2",     color: "#FFD600" },
  { delay: 4.8,  text: "[SOLVE] Iteration 4/8  residual: 8.14e-5",     color: "#FFD600" },
  { delay: 5.2,  text: "[SOLVE] Iteration 8/8  residual: 1.02e-8 ✓",  color: "#FFD600" },
  { delay: 5.7,  text: "[POST]  Peak von Mises: 148.9 MPa",            color: "#FF6B00" },
  { delay: 6.0,  text: "[POST]  Max displacement: 0.023 mm",           color: "#FF6B00" },
  { delay: 6.3,  text: "[POST]  Safety factor: 1.847 ✓",               color: "#FF6B00" },
  { delay: 6.7,  text: "[DONE]  Part validated. Mass: 186.4g",         color: "#E8E8E8" },
  { delay: 7.0,  text: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",              color: "#FF6B00" },
];

/* ─── Exploding Bracket ────────────────────────────────────────────────────── */

function ExplodingBracket({ triggered }: { triggered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useRef(0); // 0 = hidden, 1 = assembling, 2 = solid

  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.2, 0);
    shape.lineTo(1.2, 0.3);
    shape.lineTo(0.8, 0.3);
    shape.lineTo(0.8, 1.0);
    shape.lineTo(0.5, 1.4);
    shape.lineTo(0.2, 1.4);
    shape.lineTo(0, 1.1);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  }, []);

  useEffect(() => {
    if (!triggered || !meshRef.current || !groupRef.current) return;

    // Start hidden, scale up from 0
    groupRef.current.scale.setScalar(0);
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0;

    gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: "power4.out" });
    gsap.to(mat, { opacity: 1, duration: 1.2, delay: 0.2, ease: "power2.out" });
  }, [triggered]);

  useFrame((_, delta) => {
    if (!groupRef.current || !triggered) return;
    groupRef.current.rotation.y += delta * 0.4;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
  });

  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  if (!triggered) return null;

  return (
    <group ref={groupRef} position={[0, -0.7, 0]}>
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial color="#E8E8E8" metalness={0.9} roughness={0.1} transparent opacity={0} />
      </mesh>
      <lineSegments>
        <primitive object={edges} />
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/* ─── Direction 3 Main ─────────────────────────────────────────────────────── */

export default function Direction3() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    PIPELINE_OUTPUT.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
        if (termRef.current) {
          termRef.current.scrollTop = termRef.current.scrollHeight;
        }
      }, line.delay * 1000);
    });

    // Reveal 3D scene after pipeline completes
    setTimeout(() => {
      setShowCanvas(true);
      setTimeout(() => setRevealed(true), 400);
    }, 7500);
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#08080A",
      display: "flex",
      flexDirection: "column",
      fontFamily: "IBM Plex Mono, monospace",
      overflow: "hidden",
    }}>

      {/* Nav bar — terminal title bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0.6rem 1.5rem",
        borderBottom: "1px solid rgba(232,232,232,0.08)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: "0.4rem", marginRight: "1rem" }}>
          {["#FF5F57","#FFBD2E","#28CA41"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ color: "rgba(232,232,232,0.3)", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
          veloforge — pipeline — 120×40
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "2rem" }}>
          {["DOCS", "GITHUB", "PRICING"].map(link => (
            <a key={link} href="#" style={{ color: "rgba(232,232,232,0.25)", fontSize: "0.6rem", letterSpacing: "0.1em", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>
      </div>

      {/* Main — terminal + 3D split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: showCanvas ? "1fr 1fr" : "1fr", transition: "grid-template-columns 0.8s ease", overflow: "hidden" }}>

        {/* Terminal */}
        <div ref={termRef} style={{
          padding: "2rem",
          overflowY: "auto",
          borderRight: showCanvas ? "1px solid rgba(0,212,255,0.12)" : "none",
          scrollbarWidth: "none",
        }}>
          {PIPELINE_OUTPUT.map((line, i) =>
            visibleLines.includes(i) ? (
              <div key={i} style={{
                color: line.color,
                fontSize: "0.78rem",
                lineHeight: 1.9,
                letterSpacing: "0.03em",
                animation: "fadeInLine 0.15s ease",
              }}>
                {line.text}
              </div>
            ) : null
          )}
          {!revealed && <span style={{ color: "var(--color-cyan)", animation: "blink 1s infinite" }}>█</span>}
        </div>

        {/* 3D reveal */}
        {showCanvas && (
          <div style={{ position: "relative" }}>
            <Canvas
              camera={{ position: [1.5, 1, 3.5], fov: 45 }}
              gl={{ antialias: true, alpha: false }}
              style={{ background: "#08080A", width: "100%", height: "100%" }}
              dpr={[1, 2]}
            >
              <ambientLight intensity={0.1} />
              <pointLight position={[4, 4, 4]} intensity={2} color="#E8E8E8" />
              <pointLight position={[-2, -2, 2]} intensity={3} color="#FF6B00" />
              <ExplodingBracket triggered={revealed} />
            </Canvas>

            {/* Heatmap legend */}
            {revealed && (
              <div style={{
                position: "absolute",
                bottom: "2rem",
                left: "2rem",
                right: "2rem",
                pointerEvents: "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "rgba(232,232,232,0.4)", fontSize: "0.55rem", fontFamily: "IBM Plex Mono, monospace" }}>0 MPa</span>
                  <span style={{ color: "rgba(232,232,232,0.4)", fontSize: "0.55rem", fontFamily: "IBM Plex Mono, monospace" }}>148.9 MPa</span>
                </div>
                <div style={{ height: "3px", background: "linear-gradient(90deg, #00D4FF, #00FF8C, #FFD600, #FF6B00)" }} />
                <p style={{ color: "var(--color-accent)", fontSize: "0.6rem", marginTop: "0.5rem", letterSpacing: "0.1em", fontFamily: "IBM Plex Mono, monospace" }}>
                  VON MISES STRESS — SAFETY FACTOR 1.847×
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero label — bottom of terminal when revealed */}
      {revealed && (
        <div style={{
          padding: "1.5rem 2rem",
          borderTop: "1px solid rgba(232,232,232,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#E8E8E8",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "IBM Plex Mono, monospace",
              margin: 0,
            }}>
              VELOFORGE — <span style={{ color: "var(--color-accent)" }}>PART VALIDATED</span>
            </h1>
          </div>
          <button style={{
            background: "var(--color-accent)",
            color: "#08080A",
            border: "none",
            padding: "0.8rem 2rem",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}>
            RUN YOUR PART →
          </button>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeInLine { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
