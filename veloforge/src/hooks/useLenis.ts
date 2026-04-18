/**
 * useLenis — Smooth scroll driver
 *
 * Initializes Lenis on mount and synchronizes with GSAP ScrollTrigger.
 * Phase 4 will extend this with scroll position exports.
 *
 * GEMINI.md rule: Lenis handles smooth scroll.
 * GSAP ScrollTrigger is synced to Lenis. Never fight Lenis.
 */

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLenis(): void {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time: number) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time: number) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);
}
