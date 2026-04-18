"use client";

/**
 * FontsLoader — FOUC prevention for Bierika
 * 
 * Waits for document.fonts.ready, then adds `fonts-loaded`
 * class to <html>. CSS uses this to fade in .wordmark elements
 * only after Bierika has loaded — user never sees the fallback.
 */

import { useEffect } from "react";

export default function FontsLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.fonts.ready.then(() => {
      document.documentElement.classList.add("fonts-loaded");
    });
  }, []);

  return null;
}
