"use client";

/**
 * HeroScenePlaceholder
 *
 * Scaffold placeholder for the Phase 3 hero scene.
 * Confirms R3F canvas works, canvas is fixed/full-screen,
 * and WebGL is available before Phase 2 diverge work begins.
 *
 * Rules (GEMINI.md):
 *  - DPR capped at 2 (desktop) / 1 (mobile)
 *  - Canvas: position fixed, pointer-events none
 *  - WebGL fallback required
 */

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Rotating wireframe torus — visual proof the canvas is alive
function WireframePlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.25;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1.4, 0.35, 16, 64]} />
      <meshBasicMaterial
        color="#00D4FF"
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

// Detect mobile for DPR cap
function getPixelRatio(): number {
  if (typeof window === "undefined") return 1;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  return isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
}

export default function HeroScenePlaceholder() {
  return (
    <Canvas
      dpr={getPixelRatio()}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#08080A",
        pointerEvents: "none",
      }}
      performance={{ min: 0.5 }}
    >
      {/* Minimal lighting for Phase 1 */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#00D4FF" />

      {/* Wireframe placeholder — Phase 3 replaces this */}
      <WireframePlaceholder />
    </Canvas>
  );
}
