/**
 * VeloForge — Design Tokens
 *
 * Single source of truth for colors, easing, and timing.
 * Mirrors the CSS custom properties in globals.css.
 * Import here instead of hardcoding values in components.
 */

export const colors = {
  bg:      "#08080A",   // Void — part doesn't exist yet
  primary: "#E8E8E8",   // Machined aluminum
  accent:  "#FF6B00",   // Forge heat / FEA stress peak
  cyan:    "#00D4FF",   // Wireframe / computing state
} as const;

export const easings = {
  // Heavy and precise — like CNC machinery. No bounce.
  forge: "power4.out",
  forgeInOut: "power4.inOut",
} as const;

export const durations = {
  slow: 0.9,  // seconds
  med:  0.6,
  fast: 0.3,
} as const;

export const zLayers = {
  canvas:  0,
  overlay: 10,
  nav:     20,
  modal:   30,
} as const;

/** Heatmap gradient stops — von Mises stress visualization */
export const heatmapStops = [
  { stop: 0,   color: "#00D4FF" }, // cold / min stress
  { stop: 0.3, color: "#00FF8C" }, // low
  { stop: 0.6, color: "#FFD600" }, // medium
  { stop: 1,   color: "#FF6B00" }, // hot / max stress (accent)
] as const;

/** Performance budget constants */
export const perf = {
  maxDrawCallsMobile: 200,
  targetFPS:          60,
  mobileFPS:          30,
  maxModelSizeMB:     5,
  lcpBudgetMs:        2500,
} as const;
