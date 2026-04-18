"use client";

/**
 * DIRECTION 2 — "DATA IS THE GATE"
 *
 * Aesthetic: Luxury Minimal + Severe Editorial
 * DFII: Impact 5 + Fit 4 + Feasibility 4 + Performance 5 − Risk 1 = 17 → cap 15 (Excellent)
 *
 * Subverts: bruno-simon.com reference.
 * bruno-simon: "Navigation IS the product experience."
 * Subversion: Here, the DATA IS the gate. The 3D part is invisible until the
 * user interacts with the parameter inputs. Each input unlocks a section of
 * geometry. You don't scroll to run the pipeline — you fill in the spec.
 *
 * Visually: Extreme negative space. Massive off-center wordmark. A single
 * stark horizontal rule. Below it: 3 bare input fields — diameter, material,
 * load. As each fills, the geometry materializes in grayscale → accent.
 * The 3D scene is off-center right, almost cropped by the viewport edge.
 * No decorative elements. The emptiness IS the design.
 *
 * Differentiation: The part only exists if you provide parameters.
 * You are the engineer. You must specify before the machine can make.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

/* ─── Parametric Bracket ───────────────────────────────────────────────────── */

function BracketMesh({ visible, heatmap }: { visible: number; heatmap: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);

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

  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.2;
    if (edgeRef.current) edgeRef.current.rotation.y = meshRef.current.rotation.y;
  });

  useEffect(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    gsap.to(mat, { opacity: visible, duration: 1.2, ease: "power3.out" });
    if (heatmap) {
      gsap.to(mat.color, { r: 1, g: 0.42, b: 0, duration: 0.8 });
    } else {
      gsap.to(mat.color, { r: 0.91, g: 0.91, b: 0.91, duration: 0.8 });
    }
  }, [visible, heatmap]);

  return (
    <group position={[0.3, -0.7, 0]}>
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={0.85}
          roughness={0.2}
          transparent
          opacity={0}
        />
      </mesh>
      <lineSegments ref={edgeRef}>
        <primitive object={edges} />
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

/* ─── Direction 2 Main ─────────────────────────────────────────────────────── */

const FIELDS = [
  { id: "bore",     label: "AXLE BORE",       placeholder: "17.00",  unit: "mm"  },
  { id: "material", label: "MATERIAL YIELD",  placeholder: "275.0",  unit: "MPa" },
  { id: "load",     label: "PEAK LOAD",       placeholder: "2.40",   unit: "kN"  },
];

export default function Direction2() {
  const [filled, setFilled] = useState<Record<string, string>>({});
  const filledCount = Object.keys(filled).filter(k => filled[k]?.length > 0).length;
  const visibility = filledCount / FIELDS.length;
  const heatmap = filledCount === FIELDS.length;

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#08080A",
      display: "grid",
      gridTemplateColumns: "1fr 52vw",
      overflow: "hidden",
      fontFamily: "IBM Plex Mono, monospace",
    }}>

      {/* Left — Severe editorial */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3rem 3rem 3rem 4rem",
        borderRight: "1px solid rgba(232,232,232,0.06)",
      }}>
        {/* Top — wordmark */}
        <div>
          <p style={{ color: "rgba(232,232,232,0.25)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "3rem", fontFamily: "IBM Plex Mono, monospace" }}>
            FEA PIPELINE — v2.1.0
          </p>
          <h1 style={{
            fontSize: "clamp(4rem, 9vw, 8rem)",
            fontWeight: 700,
            color: "#E8E8E8",
            letterSpacing: "-0.02em",
            lineHeight: 0.85,
            fontFamily: "IBM Plex Mono, monospace",
            textTransform: "uppercase",
          }}>
            VELO<br />
            FORGE
          </h1>
          <div style={{ width: "100%", height: "1px", background: "rgba(232,232,232,0.1)", margin: "2rem 0" }} />
          <p style={{ color: "rgba(232,232,232,0.4)", fontSize: "0.7rem", lineHeight: 1.7, maxWidth: "280px", fontFamily: "IBM Plex Mono, monospace" }}>
            SPECIFY THE PARAMETERS.<br />
            THE MACHINE WILL COMPUTE THE PART.
          </p>
        </div>

        {/* Middle — bare inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {FIELDS.map((f) => (
            <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", borderBottom: "1px solid rgba(232,232,232,0.1)" }}>
              <div>
                <p style={{ color: "rgba(232,232,232,0.3)", fontSize: "0.55rem", letterSpacing: "0.15em", marginBottom: "0.5rem", fontFamily: "IBM Plex Mono, monospace" }}>
                  {f.label}
                </p>
                <input
                  type="number"
                  placeholder={f.placeholder}
                  step="0.01"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: filled[f.id] ? "var(--color-accent)" : "rgba(232,232,232,0.6)",
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    width: "100%",
                    fontFamily: "IBM Plex Mono, monospace",
                    caretColor: "var(--color-cyan)",
                    padding: "0.5rem 0",
                  }}
                  onChange={(e) => setFilled(prev => ({ ...prev, [f.id]: e.target.value }))}
                />
              </div>
              <span style={{ color: "rgba(232,232,232,0.2)", fontSize: "0.65rem", paddingBottom: "0.8rem", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.1em" }}>
                {f.unit}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom — CTA + status */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{
              height: "2px",
              background: "linear-gradient(90deg, var(--color-cyan), var(--color-accent))",
              transition: "width 0.8s ease",
              width: `${visibility * 100}%`,
            }} />
            <span style={{ color: "rgba(232,232,232,0.3)", fontSize: "0.6rem", fontFamily: "IBM Plex Mono, monospace", whiteSpace: "nowrap" }}>
              {filledCount}/{FIELDS.length} PARAMS
            </span>
          </div>
          <button
            disabled={filledCount < FIELDS.length}
            style={{
              background: filledCount === FIELDS.length ? "var(--color-accent)" : "transparent",
              color: filledCount === FIELDS.length ? "#08080A" : "rgba(232,232,232,0.2)",
              border: "1px solid",
              borderColor: filledCount === FIELDS.length ? "var(--color-accent)" : "rgba(232,232,232,0.15)",
              padding: "0.9rem 2rem",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              cursor: filledCount === FIELDS.length ? "pointer" : "default",
              transition: "all 0.4s ease",
              textTransform: "uppercase",
            }}
          >
            EXECUTE PIPELINE →
          </button>
        </div>
      </div>

      {/* Right — 3D canvas, cropped edge */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Canvas
          camera={{ position: [1.5, 1, 4], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#08080A", width: "100%", height: "100%" }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.05} />
          <directionalLight position={[5, 5, 5]} intensity={3} color="#E8E8E8" />
          <pointLight position={[-3, -3, 2]} intensity={2} color="#FF6B00" />
          <BracketMesh visible={visibility} heatmap={heatmap} />
        </Canvas>

        {/* Corner label */}
        <div style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          textAlign: "right",
          pointerEvents: "none",
        }}>
          <p style={{ color: heatmap ? "var(--color-accent)" : "rgba(232,232,232,0.15)", fontSize: "0.6rem", letterSpacing: "0.12em", fontFamily: "IBM Plex Mono, monospace", transition: "color 0.8s" }}>
            {heatmap ? "FEA COMPLETE — SF 1.847×" : "AWAITING PARAMETERS"}
          </p>
        </div>
      </div>

    </div>
  );
}
