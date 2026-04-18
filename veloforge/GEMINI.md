# GEMINI.md — VeloForge Project Rules

> These rules apply to every phase. Read this file BEFORE touching any code.

## Project Identity
- Product: **VeloForge** — Computational Engineering, Redefined
- Stack: Next.js 15 · React 19 · TypeScript strict · Tailwind CSS v4 · Three.js r171+ · R3F · GSAP · Lenis
- Color: BG `#08080A` · Primary `#E8E8E8` · Accent `#FF6B00` · Wireframe Cyan `#00D4FF`
- Fonts: BIERIKA (display) · IBM Plex Mono (body/data)

---

## TypeScript Rules
- **Strict mode is mandatory.** `any` is forbidden. No implicit returns on non-void functions.
- All components: explicit prop interfaces. No inferred props from JSX.
- `tsconfig.json` must have `"strict": true` — never soften it.

## Asset Rules
- **No asset goes uncompressed. Ever.**
- All 3D models: Draco-compressed glTF (`.glb`) — use `@gltf-transform/cli`
- All textures: KTX2 with basis compression or WebP
- Place models in `/src/assets/models/` and HDRI in `/src/assets/hdri/`
- Max model file size: 5MB. Target: <2MB.

## Canvas Architecture
- **Fixed canvas background. DOM layer on top.** Always.
- Canvas: `position: fixed`, `z-index: 0`, `width: 100vw`, `height: 100vh`
- HTML overlay: `position: relative`, `z-index: 10`, pointer-events managed per element
- Never put canvas inside a scroll container.

## Performance Budget
- **LCP < 2.5s** on 4G throttled mobile
- **60fps desktop**, **30–60fps mobile** target
- Max draw calls: 200 on mobile (use instancing if exceeded)
- Set up LOD before adding any geometry
- `dpr` must be capped: `Math.min(window.devicePixelRatio, 2)` on desktop, `1` on mobile
- Run Lighthouse (`performance >= 90`) after **EVERY** phase — not just Phase 7

## Animation Rules
- Motion character: **Heavy and precise — like CNC machinery. No bounce. No spring.**
- All easing: `power4.out` or `power4.inOut` — no elastic, no back
- Scroll: Lenis handles smooth scroll. GSAP ScrollTrigger is synced to Lenis.
- Never fight Lenis with native scroll events.
- `useFrame` must be correctly scoped — no global state mutations in render loop

## Visual Rules
- **Nothing fades. Everything constructs or deconstructs.**
- Transitions: wireframe draws itself → solid forms → heatmap bleeds in channel by channel
- No purple. No generic SaaS blue gradients. No floating glass cards.
- No particle fields. No Spline embeds with zero narrative.
- Every number shown must be a real pipeline output — no lorem ipsum data.

## Phase Order
```
Phase 1: SCAFFOLD       ← you are here
Phase 2: DIVERGE        ← 3 visual directions, stop for review
Phase 3: HERO SCENE     ← chosen direction built in full
Phase 4: SCROLL + MOTION
Phase 5: UI LAYER
Phase 6: POST-FX
Phase 7: FINAL AUDIT
```

## WebGL Fallback
- Always detect WebGL support at runtime
- Static image fallback for devices without WebGL
- Suspense with `useProgress` loader for 3D content

## Commit Hygiene
- One commit per phase completion
- Commit message format: `feat(phase-N): description`
