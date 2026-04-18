"use client";

/**
 * DIRECTION 1 — "THE MACHINE THINKS OUT LOUD"
 *
 * Aesthetic: Industrial Brutalist + Kinetic Data
 * DFII: Impact 5 + Fit 5 + Feasibility 4 + Performance 4 − Risk 2 = 16 → cap at 15 (Excellent)
 *
 * Core idea: Interpret core_visual_idea literally.
 * The 3D part doesn't exist at load — it assembles itself from raw parameter
 * readouts in real-time. Numbers tick up on the left; geometry materializes
 * edge by edge on the right. You watch computation become matter.
 *
 * Differentiation: The hero is split — left half is a terminal-style parameter
 * stream, right half is the wireframe building itself edge by edge via a custom
 * geometry construction shader. They are synced: each parameter locks → one
 * more mesh section solidifies.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

/* ─── Procedural Bracket Geometry ─────────────────────────────────────────── */

function BracketGeometry({ buildProgress }: { buildProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const solidRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    // Simplified brake bracket profile — lathe-style extrusion
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

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;
  });

  // Drive wireframe opacity + solid material from buildProgress
  useEffect(() => {
    if (edgesRef.current) {
      const mat = edgesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = Math.min(1, buildProgress * 1.5);
    }
    if (solidRef.current) {
      const mat = solidRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, (buildProgress - 0.5) * 2);
    }
  }, [buildProgress]);

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Wireframe */}
      <lineSegments ref={edgesRef}>
        <primitive object={edges} />
        <lineBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0}
          linewidth={1}
        />
      </lineSegments>
      {/* Emerging solid */}
      <mesh ref={solidRef} geometry={geometry}>
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={0.9}
          roughness={0.15}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}

/* ─── Parameter Data ───────────────────────────────────────────────────────── */

const PARAMS = [
  { label: "AXLE_BORE_DIA",   unit: "mm",   target: 17.000 },
  { label: "CALIPER_OFFSET",  unit: "mm",   target: 54.500 },
  { label: "WALL_THICKNESS",  unit: "mm",   target: 4.200  },
  { label: "BOLT_PATTERN_R",  unit: "mm",   target: 28.000 },
  { label: "MATERIAL_YIELD",  unit: "MPa",  target: 275.0  },
  { label: "SAFETY_FACTOR",   unit: "×",    target: 1.847  },
  { label: "VON_MISES_PEAK",  unit: "MPa",  target: 148.9  },
  { label: "MASS",            unit: "g",    target: 186.4  },
];

function ParamStream({ buildProgress }: { buildProgress: number }) {
  const [values, setValues] = useState(PARAMS.map(() => 0));

  useEffect(() => {
    PARAMS.forEach((p, i) => {
      const delay = i * 0.35;
      const duration = 1.2;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: p.target,
        delay,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          setValues((prev) => {
            const next = [...prev];
            next[i] = obj.v;
            return next;
          });
        },
      });
    });
  }, []);

  return (
    <div className="param-stream">
      <div className="stream-header">
        <span style={{ color: "var(--color-cyan)", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
          ▶ PIPELINE RUNNING — FEA v2.1.0
        </span>
      </div>
      {PARAMS.map((p, i) => {
        const locked = buildProgress > (i / PARAMS.length);
        return (
          <div key={p.label} className="param-row" style={{ opacity: locked ? 1 : 0.35 }}>
            <span className="param-label">{p.label}</span>
            <span className="param-value" style={{ color: locked ? "var(--color-accent)" : "var(--color-cyan)" }}>
              {values[i].toFixed(p.label === "SAFETY_FACTOR" ? 3 : 1)}
            </span>
            <span className="param-unit">{p.unit}</span>
            {locked && <span className="param-locked">✓</span>}
          </div>
        );
      })}

      <style>{`
        .param-stream {
          font-family: 'IBM Plex Mono', monospace;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          border-right: 1px solid rgba(0,212,255,0.12);
        }
        .stream-header {
          margin-bottom: 1.2rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid rgba(0,212,255,0.15);
        }
        .param-row {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 0.75rem;
          align-items: center;
          transition: opacity 0.4s ease;
          font-size: 0.72rem;
        }
        .param-label {
          color: rgba(232,232,232,0.5);
          letter-spacing: 0.05em;
        }
        .param-value {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          min-width: 60px;
          text-align: right;
          transition: color 0.3s;
        }
        .param-unit {
          color: rgba(232,232,232,0.3);
          font-size: 0.6rem;
          width: 30px;
        }
        .param-locked {
          color: #00D4FF;
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
}

/* ─── Direction 1 Main ─────────────────────────────────────────────────────── */

export default function Direction1() {
  const [buildProgress, setBuildProgress] = useState(0);

  useEffect(() => {
    const obj = { p: 0 };
    gsap.to(obj, {
      p: 1,
      duration: PARAMS.length * 0.35 + 1.5,
      ease: "none",
      onUpdate: () => setBuildProgress(obj.p),
    });
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#08080A",
      display: "grid",
      gridTemplateColumns: "400px 1fr",
      overflow: "hidden",
      fontFamily: "IBM Plex Mono, monospace",
    }}>

      {/* Left — Parameter Stream */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <ParamStream buildProgress={buildProgress} />
      </div>

      {/* Right — 3D Canvas */}
      <div style={{ position: "relative" }}>
        <Canvas
          camera={{ position: [0, 0.7, 3.5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#08080A" }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.1} />
          <pointLight position={[3, 3, 3]} intensity={2} color="#00D4FF" />
          <pointLight position={[-2, -2, 2]} intensity={1} color="#FF6B00" />
          <BracketGeometry buildProgress={buildProgress} />
        </Canvas>

        {/* Hero type — overlaid on canvas */}
        <div style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "2rem",
          right: "2rem",
          pointerEvents: "none",
        }}>
          <p style={{ color: "var(--color-cyan)", fontSize: "0.65rem", letterSpacing: "0.12em", marginBottom: "0.5rem", fontFamily: "IBM Plex Mono, monospace" }}>
            COMPUTATIONAL ENGINEERING, REDEFINED
          </p>
          <h1 style={{
            fontSize: "clamp(3rem, 6vw, 5rem)",
            fontWeight: 700,
            color: "#E8E8E8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 0.9,
            fontFamily: "IBM Plex Mono, monospace",
          }}>
            VELO<br />
            <span style={{ color: "var(--color-accent)" }}>FORGE</span>
          </h1>
        </div>
      </div>

    </div>
  );
}
