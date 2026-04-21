"use client";

/**
 * usePhaseCameraControl — ScrollTrigger-based camera control for phase sections
 *
 * Per phases.md CAMERA SYSTEM — SAFE APPROACH:
 *   - Does NOT use Lenis progress
 *   - Creates separate targetCameraPos / targetFov refs
 *   - Attaches ScrollTrigger onEnter/onLeaveBack per section
 *   - HeroScene's CameraController lerps toward these targets each frame
 *
 * The existing useScrollScene camera path is handed off once section enters.
 * This hook ONLY sets target refs; lerping happens inside the existing
 * CameraController's useFrame (which reads cameraPositionRef / fovTargetRef).
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Camera positions per section (from phases.md)
const PHASE_CAMERAS = {
  hero:    { pos: new THREE.Vector3(0,    0,   4.5), fov: 42 },
  phase01: { pos: new THREE.Vector3(1.5,  1.2, 3.5), fov: 48 },
  phase02: { pos: new THREE.Vector3(-1.5, 0.3, 3.2), fov: 44 },
  phase03: { pos: new THREE.Vector3(0,    0.5, 5.0), fov: 38 },
} as const;

interface PhaseCameraControlOptions {
  /** Ref that CameraController reads each frame — we write target here */
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
  /** Ref that CameraController reads each frame — we write target fov here */
  fovTargetRef: React.MutableRefObject<number>;
}

export function usePhaseCameraControl({
  cameraPositionRef,
  fovTargetRef,
}: PhaseCameraControlOptions): void {
  // Track whether phase camera control is active
  const phaseCameraActive = useRef(false);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Helper: set camera target
    function setCam(section: keyof typeof PHASE_CAMERAS) {
      const { pos, fov } = PHASE_CAMERAS[section];
      cameraPositionRef.current.set(pos.x, pos.y, pos.z);
      fovTargetRef.current = fov;
    }

    // ── Phase 01 ──────────────────────────────────────────────────────────
    triggers.push(
      ScrollTrigger.create({
        trigger: "#phase-01",
        start: "top 50%",
        onEnter:     () => { phaseCameraActive.current = true;  setCam("phase01"); },
        onLeaveBack: () => { phaseCameraActive.current = false; setCam("hero"); },
      })
    );

    // Orange sweep line per section boundary
    triggers.push(
      ScrollTrigger.create({
        trigger: "#phase-01",
        start: "top 80%",
        once: true,
        onEnter: () => {
          const sweepEls = document.querySelectorAll<HTMLElement>("#phase-01 .sweep-line");
          sweepEls.forEach((el) => {
            gsap.fromTo(el,
              { scaleX: 0, transformOrigin: "left" },
              { scaleX: 1, duration: 0.4, ease: "power2.inOut" }
            );
          });
        },
      })
    );

    // ── Phase 02 ──────────────────────────────────────────────────────────
    triggers.push(
      ScrollTrigger.create({
        trigger: "#phase-02",
        start: "top 50%",
        onEnter:     () => { setCam("phase02"); },
        onLeaveBack: () => { setCam("phase01"); },
      })
    );

    // ── Phase 03 ──────────────────────────────────────────────────────────
    triggers.push(
      ScrollTrigger.create({
        trigger: "#phase-03",
        start: "top 50%",
        onEnter:     () => { setCam("phase03"); },
        onLeaveBack: () => { setCam("phase02"); },
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [cameraPositionRef, fovTargetRef]);
}
