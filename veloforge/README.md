# VeloForge

**Computational Engineering, Redefined**

End-to-end parametric generative engineering + automated FEA pipeline. VeloForge designs 2-wheeler components (brake brackets, structural parts) from parameters alone — no manual CAD required. Designed for engineers, students, and R&D teams who want structurally validated parts fast.

## 🚀 The Experience

The VeloForge landing page is built around a central, scroll-driven narrative:
> *The 3D part doesn't exist at load. As you scroll, VeloForge thinks out loud — raw parameters become wireframe, wireframe becomes solid geometry, solid gets stress-mapped in a real-time heatmap, and then the optimized part locks in place. You watch the machine design itself.*

The user's scroll directly drives the computation pipeline. Scrolling down advances the pipeline; scrolling up reverses the assembly.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **3D Engine**: Three.js (v0.184) + React Three Fiber (R3F)
- **Animation**: GSAP + Lenis (for buttery smooth scroll-scrubbing)
- **Post-Processing**: `@react-three/postprocessing` (SMAA, Bloom, Chromatic Aberration)
- **Styling**: TailwindCSS v4 + Custom CSS
- **Typography**: Bierika (Display) + IBM Plex Mono (Data/Interface)

## 📦 Key Implementation Details

1. **Scroll-Driven Animation**: The timeline is controlled purely by Lenis scroll progress (`useScrollScene.ts`). We use a `gsap.timeline({ paused: true })` and directly manipulate `tl.progress(scrollRatio)` in `useFrame()`.
2. **Imperative Post-Processing**: To avoid performance bottlenecks and React reconciler crashes when mutating objects during the scroll, the `EffectComposer` is instantiated and updated imperatively.
3. **No Flashes of Unstyled Text (FOUC)**: Fonts are managed with a strict `FontsLoader` that blocks critical UI element visibility until `document.fonts.ready` confirms `Bierika` is loaded, falling back gracefully to matched Arial Black geometries.
4. **Cinematic PostFX**: Advanced shader setups drive the final look of the machined aluminum, blending realistic PBR attributes (metalness/roughness) synced to the 3D pipeline timeline.

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or pnpm

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd veloforge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

To create an optimized production build:
```bash
npm run build
npm start
```

## 📂 Project Structure

- `src/app/` - Next.js App Router setup and primary layout configurations.
- `src/components/3d/` - React Three Fiber components (`HeroScene.tsx`, `CameraController.tsx`).
- `src/components/ui/` - Interface overlays (`StatsHUD.tsx`, `Terminal.tsx`).
- `src/hooks/` - Custom React hooks (`useScrollScene.ts`, `useWebGLSupport.ts`).
- `src/fonts/` - Local font assets including `Bierika`.

---

*Designed and developed to emulate heavy, precise CNC machinery. No bounce. No spring. Objects move with mass and stop with intention.*
