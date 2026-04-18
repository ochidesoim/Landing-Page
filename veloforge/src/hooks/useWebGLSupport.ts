/**
 * useWebGLSupport — Detect WebGL availability
 *
 * Returns true if WebGL2 is available (preferred),
 * falls back to WebGL1 check, then false.
 *
 * Use this to render static fallback images on unsupported devices.
 */

"use client";

import { useState, useEffect } from "react";

export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    const t = setTimeout(() => setSupported(!!gl), 0);
    return () => clearTimeout(t);
  }, []);

  return supported;
}
