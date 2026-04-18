"use client";

/**
 * useScrollScene — Scroll orchestration hook (Phase 4)
 *
 * Drives the entire VeloForge narrative from Lenis scroll progress.
 * All updates go to refs — zero React re-renders on scroll.
 * Only setters for terminal count and phase trigger re-renders
 * when the value actually changes.
 *
 * Performance (fixing-motion-performance rules):
 *  - No DOM reads in scroll handler
 *  - No scrollTop polling — Lenis provides normalized progress
 *  - All 3D updates via refs read in useFrame (compositor only)
 *  - Lenis + GSAP ScrollTrigger properly synced, never fight
 */

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";
import { PIPELINE_LINES } from "@/components/ui/Terminal";
import type { ScenePhase } from "@/components/3d/HeroScene";

gsap.registerPlugin(ScrollTrigger);

// Camera waypoints — one per narrative section
const CAMERA_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0.0,  0.1,  3.8),  // S0: frontal, distant — void
  new THREE.Vector3( 1.0,  0.2,  3.4),  // S1: right orbit — mesh forms
  new THREE.Vector3(-0.5,  0.6,  3.0),  // S2: left-high — FEA setup
  new THREE.Vector3(-0.2,  0.9,  2.7),  // S3: overhead — solver converging
  new THREE.Vector3( 0.3,  0.3,  2.5),  // S4: close front — stress map
  new THREE.Vector3( 0.3,  0.0,  2.4),  // S5: locked tight — done
], false, "catmullrom", 0.5);

// Scroll progress thresholds for phase triggers
const PHASE_TRIGGERS: Record<number, ScenePhase> = {
  0.18: 1,  // wireframe
  0.45: 2,  // solid
  0.72: 3,  // heatmap
};

interface ScrollSceneOptions {
  phaseRef:          React.MutableRefObject<ScenePhase>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
  fovTargetRef:      React.MutableRefObject<number>;
  scrollProgressRef: React.MutableRefObject<number>;
  setTerminalCount:  (n: number) => void;
  setUiPhase:        (p: ScenePhase) => void;
  setIsDone:         (v: boolean) => void;
}

export function useScrollScene({
  phaseRef,
  cameraPositionRef,
  fovTargetRef,
  scrollProgressRef,
  setTerminalCount,
  setUiPhase,
  setIsDone,
}: ScrollSceneOptions): void {
  // Track last values to avoid redundant setState calls
  const lastLineCount = useRef(-1);
  const lastPhase     = useRef<ScenePhase>(0);
  const isDoneRef     = useRef(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Sync Lenis → GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time: number) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Scroll handler — pure ref updates + batched state on change
    lenis.on("scroll", ({ progress }: { progress: number }) => {
      // 1. Camera position along curve
      const point = CAMERA_PATH.getPoint(Math.min(progress, 1));
      cameraPositionRef.current.copy(point);

      // 2. FOV: 60° → 45° (cinematic tighten)
      fovTargetRef.current = 60 - progress * 15;

      // 3. Scroll progress for lighting
      scrollProgressRef.current = progress;

      // 4. Terminal line reveal (batched — only setState when count changes)
      const targetCount = Math.min(
        Math.ceil(progress * PIPELINE_LINES.length),
        PIPELINE_LINES.length
      );
      if (targetCount !== lastLineCount.current) {
        lastLineCount.current = targetCount;
        setTerminalCount(targetCount);
      }

      // 5. Phase transitions (only fire when crossing threshold)
      let newPhase: ScenePhase = 0;
      for (const [threshold, phase] of Object.entries(PHASE_TRIGGERS)) {
        if (progress >= Number(threshold)) newPhase = phase;
      }
      if (newPhase !== lastPhase.current) {
        lastPhase.current = newPhase;
        phaseRef.current  = newPhase;   // immediate (no re-render)
        setUiPhase(newPhase);            // UI indicator (1 re-render)
      }

      // 6. Done trigger — bidirectional (reset when scrolling back up)
      if (progress >= 0.93 && !isDoneRef.current) {
        isDoneRef.current = true;
        setIsDone(true);
      } else if (progress < 0.93 && isDoneRef.current) {
        isDoneRef.current = false;
        setIsDone(false);
      }

      // 7. Kinetic typography weight mapping (700 -> 300)
      const currentWeight = Math.max(300, 700 - Math.floor(progress * 400));
      document.documentElement.style.setProperty('--scroll-weight', currentWeight.toString());
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [
    phaseRef, cameraPositionRef, fovTargetRef, scrollProgressRef,
    setTerminalCount, setUiPhase, setIsDone,
  ]);
}
