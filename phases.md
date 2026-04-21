Before executing read:
@gsap-core @gsap-scrolltrigger @gsap-react
@locomotive-scroll @frontend-design
@3d-style @algorithmic-art @brand-brief
@web-artifacts-builder

Read project-brief.yaml first.
Do NOT touch hero, nav, entry overlay,
cursor, stats HUD, or any existing code.
Add only new sections below existing hero.

══════════════════════════════════════
HARD RULES — GEMINI MUST FOLLOW THESE
BEFORE WRITING A SINGLE LINE OF CODE
══════════════════════════════════════

GSAP TRANSFORMS — NEVER raw transform:
✅ x, y, z, scale, rotation, xPercent
❌ NEVER transform: "translateX(100px)"

GSAP FADING — NEVER opacity alone:
✅ autoAlpha: 0
❌ NEVER opacity: 0

GSAP EASING — ONLY these strings:
"power1.out" "power2.out" "power3.out"
"power4.out" "power2.inOut" "expo.out"
"back.out(1.7)" "elastic.out(1,0.3)"
"none"
❌ NEVER invent ease names

GSAP STAGGER — correct pattern:
✅ gsap.to(".row", {
     autoAlpha: 1, y: 0,
     stagger: 0.15,
     ease: "power2.out",
     duration: 0.5
   })
❌ NEVER manual delay chaining

GSAP DEFAULTS — set once at top:
✅ gsap.defaults({
     duration: 0.6,
     ease: "power2.out"
   })

GSAP matchMedia — ALWAYS wrap animations:
✅ const mm = gsap.matchMedia()
   mm.add({
     isDesktop: "(min-width: 800px)",
     isMobile: "(max-width: 799px)",
     reduceMotion: "(prefers-reduced-motion: reduce)"
   }, (ctx) => {
     const { isDesktop, reduceMotion } = ctx.conditions
     // all ScrollTriggers and tweens go here
     return () => {} // cleanup
   })
❌ NEVER create animations outside matchMedia

LENIS + GSAP — ONLY correct integration:
✅ const lenis = new Lenis({
     duration: 1.2,
     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
     smoothTouch: false
   })
   lenis.on('scroll', ScrollTrigger.update)
   gsap.ticker.add((time) => lenis.raf(time * 1000))
   gsap.ticker.lagSmoothing(0)
❌ NEVER run Lenis in separate RAF loop
❌ NEVER two RAF loops simultaneously

SECTION ARCHITECTURE — NEVER fake sections:
✅ Each section: position relative · 100vh
   Canvas: position fixed · z-index 0
   Sections scroll OVER fixed canvas
   Each section has OWN distinct layout
   NO shared pinned UI between sections

HERO PIN — 100vh only:
✅ scrollTrigger: {
     trigger: "#hero",
     start: "top top",
     end: "bottom top",
     pin: true,
     anticipatePin: 1,
     scrub: false
   }
❌ NEVER end: "+=5000" or "+=500%"
❌ NEVER pin hero for entire page height

MULTIPLE from() ON SAME ELEMENT:
✅ set immediateRender: false on later tweens
❌ NEVER stack from() on same property
   without immediateRender: false

STORE TWEEN REFS:
✅ const tl = gsap.timeline({...})
   // store so you can kill on cleanup
❌ NEVER fire and forget tweens that
   need to be controlled or cleaned up

═══════════════════════════════════════
SECTION STRUCTURE
═══════════════════════════════════════

<main>
  <section id="hero">       100vh · pinned
  <section id="phase-01">   100vh · own layout
  <section id="phase-02">   100vh · own layout
  <section id="phase-03">   100vh · own layout
</main>

Three.js canvas:
  position: fixed
  top: 0 · left: 0
  width: 100vw · height: 100vh
  z-index: 0
  pointer-events: none

Phase sections:
  position: relative
  width: 100vw
  min-height: 100vh
  background: #0A0A0B
  z-index: 2

Camera onEnter per section:
  useFrame lerp factor: 0.035
  NEVER snap · always lerp
  Use ScrollTrigger onEnter callback
  to set target camera position
  useFrame lerps toward it each frame

Section transition sweep:
  On every section boundary:
  Thin orange line sweeps left → right
  gsap.fromTo(".sweep-line",
    { scaleX: 0, transformOrigin: "left" },
    { scaleX: 1, duration: 0.4,
      ease: "power2.inOut" }
  )

═══════════════════════════════════════
SECTION 2 — "CODE AS SCULPTURE"
PHASE 01: GENERATIVE GEOMETRY
═══════════════════════════════════════

LAYOUT:
  position: relative · 100vh
  display: grid
  grid-template-columns: 45% 55%
  background: #0A0A0B
  z-index: 2

  NO hero logo visible here
  NO stats bar visible here
  Completely distinct from hero

LEFT COLUMN (45%):
  padding: 80px 60px
  display: flex · flex-direction: column
  justify-content: center

  Label:
    "PHASE 01 — GENERATIVE GEOMETRY"
    color: #FF6B00 · font-size: 10px
    font-weight: 300
    letter-spacing: 0.25em · uppercase

  Heading (Bierika · white · 48px):
    "Programmatic Construction"

  Body (#FF6B00 · 60% opacity · 13px):
    "No CAD software. No manual modeling.
     VeloForge builds geometry by defining
     analytical volumes in pure code."

  CODE BLOCK COMPONENT:
    background: rgba(10,10,11,0.7)
    border: 1px solid rgba(255,107,0,0.2)
    border-left: 2px solid #FF6B00
    padding: 20px 24px
    font-family: JetBrains Mono · 12px
    line-height: 1.8

    Code content:
    ─────────────────────────
    // Phase 1: Generative Geometry
    var body = new Box(
      width:  54.0f,
      height: 38.0f,
      dep:    bodyDep        // 22.0mm
    );
    var mount = new Cylinder(
      r: 14.0f, h: bodyDep
    );
    geo = geo.Union(mount);
    var axleBore = new Cylinder(
      r: 8.5f, h: bodyDep + 2f
    );
    geo = geo.Subtract(axleBore);
    for (int i = 0; i < 9; i++) {
      var pocket = new Cylinder(
        r: pocketDep, h: bodyDep
      );
      geo = geo.Subtract(pocket);
    }
    mesh.ExportStl(
      "brake_bracket_v1.stl"
    );
    ─────────────────────────

    Syntax colors:
      // comments   → #FF6B00 · 40% opacity
      keywords      → #FF6B00 · 80% opacity
      var new for   → #00CFFF · 70% opacity
      numbers       → #FFFFFF · 90%
      .Union .Sub   → #FF4500 · 90%

    TYPING BEHAVIOR:
      Tied to scroll position via ScrollTrigger
      scrub: true so scroll drives typing

      Use ScrollTrigger onUpdate callback:
        progress 0→1 maps to
        character 0→totalChars

      When progress hits KEY LINE thresholds:
        "geo.Union(mount)"      → trigger EVENT 2
        "geo.Subtract(axleBore)"→ trigger EVENT 3
        "geo.Subtract(pocket)"  → trigger EVENT 4
        "ExportStl"             → trigger EVENT 5

      Each key line: flash white
        gsap.to(keyLine, {
          color: "#FFFFFF",
          duration: 0.1,
          yoyo: true,
          repeat: 1
        })

  Bottom label:
    "Powered by Leap71 ShapeKernel + PicoGK"
    color: #FF6B00 · 9px · opacity 35%

  PHASE PROGRESS indicator:
    Bottom of left column
    "PHASE 01 / 03"
    Thin orange line · fills with scroll
    gsap.to(".progress-line", {
      scaleX: 1,
      transformOrigin: "left",
      ease: "none",
      scrollTrigger: {
        trigger: "#phase-01",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    })

RIGHT COLUMN (55%):
  background: transparent
  Shows fixed 3D canvas through it

SCROLLTRIGGER FOR THIS SECTION:
  scrollTrigger: {
    trigger: "#phase-01",
    start: "top top",
    end: "bottom top",
    pin: true,
    anticipatePin: 1,
    scrub: true,
    onEnter: () => {
      // set camera target to phase-01 position
      targetCameraPos.set(1.5, 1.2, 3.5)
      targetFov = 48
    },
    onLeaveBack: () => {
      // return camera to hero position
      targetCameraPos.set(0, 0, 4.5)
      targetFov = 42
    }
  }

3D SCENE — SECTION 2:

Camera target: pos(1.5, 1.2, 3.5) · fov 48°
Lerp factor: 0.035 in useFrame

CONSTRUCTION EVENTS:

EVENT 1 — "new Box(...)":
  Box geometry fades in:
  gsap.fromTo(boxMesh, 
    { scale: 0.85 },  // ✅ GSAP alias
    { scale: 1.0,     // ✅ GSAP alias
      duration: 0.4,
      ease: "power2.out",
      immediateRender: false
    }
  )
  Orange wireframe on all edges
  autoAlpha: 0 → 1 on mesh

EVENT 2 — "geo.Union(mount)":
  Cylinder rises: y: -2 → 0
    gsap.fromTo(cylinder,
      { y: -2 },
      { y: 0, duration: 0.5,
        ease: "power2.out",
        immediateRender: false }
    )
  At merge point:
    THREE.Points burst · 40 particles
    size: 0.015 · color: #FF6B00/#FF4500
    velocity: random sphere · 0.3
    gravity: -0.002/frame
    lifetime: 0.6s
    THREE.AdditiveBlending

EVENT 3 — "geo.Subtract(axleBore)":
  Red ghost cylinder:
    color: #FF2200 · opacity 0.4
    punches through geometry
  60 spark particles from cut path
    color: #FF6B00 + #FF2200 mix
    velocity: 0.1-0.4 random
    fade over 0.8s

EVENT 4 — "geo.Subtract(pocket)" ×9:
  9 cuts · 120ms stagger between each
  20 particles per cut
  Use THREE.Points pool (reuse objects)
  Max 200 particles active at once
  Recycle pool — dispose after 1.5s

EVENT 5 — "ExportStl(...)":
  Model pulse white:
    gsap.to(modelMaterial, {
      emissiveIntensity: 1,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    })
  Wireframe opacity → 0.8
  Terminal line appears:
    [OUT] brake_bracket_v1.stl · 34,000 nodes
  Slow rotation begins: 0.002 rad/frame

═══════════════════════════════════════
SECTION 3 — "THE INVISIBLE FORCE"
PHASE 02: FEA PIPELINE
═══════════════════════════════════════

LAYOUT:
  position: relative · 100vh
  background: #0A0A0B · z-index: 2
  NO hero elements · own layout

  TOP BAR (full width):
    "PHASE 02 — AUTOMATED FEA PIPELINE"
    border-bottom: 1px solid rgba(255,107,0,0.2)
    padding: 24px 60px

  MAIN AREA: two columns
    LEFT 40%: heading · body · terminal
    RIGHT 60%: 5-step pipeline cards

LEFT COLUMN:
  Heading (Bierika · white · 48px):
    "Headless Simulation"

  Body:
    "Zero human interaction. VeloForge
     pipes the geometry through a full
     structural solver automatically."

  Terminal feed below heading:
  Lines appear one by one as cards activate:
    [MESH]  fTetWild converting surface...
    [MESH]  Elements: 4,847 · Nodes: 8,547
    [INP]   Serializing Abaqus input deck...
    [INP]   Material: E=71.7GPa · ν=0.33
    [INP]   BC: 6000N axle · bolt fixed
    [SOLVE] CalculiX invoked · ccx running
    [SOLVE] Iteration 1/8 · res: 2.53e-3
    [SOLVE] Iteration 3/8 · res: 4.17e-4
    [SOLVE] Iteration 8/8 · res: 8.96e-7
    [CONV]  Solver converged ✓
    [PARSE] Peak stress: 148.9 MPa
    [PARSE] Max displacement: 0.23mm

  Terminal line entrance:
    gsap.fromTo(line,
      { autoAlpha: 0, x: -10 },
      { autoAlpha: 1, x: 0,
        duration: 0.3,
        ease: "power2.out",
        immediateRender: false }
    )

RIGHT COLUMN — 5 PIPELINE CARDS:

  Card entrance on scroll:
    gsap.fromTo(cards,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0,
        stagger: 0.12,
        ease: "power2.out",
        duration: 0.4,
        immediateRender: false,
        scrollTrigger: {
          trigger: "#phase-02",
          start: "top 80%"
        }
      }
    )

  Cards:
  ┌─────────────────────────────────────┐
  │ 01  VOLUMETRIC MESHING              │
  │     fTetWild · .stl → .mesh         │
  │     4,847 C3D10 tet elements        │
  ├─────────────────────────────────────┤
  │ 02  SETUP SERIALIZATION             │
  │     InpSerializer · Abaqus .inp     │
  │     E=71.7GPa · ν=0.33             │
  ├─────────────────────────────────────┤
  │ 03  FEA SOLVER                      │
  │     CalculiX (ccx) invoked          │
  │     6000N bump · bolt holes fixed   │
  ├─────────────────────────────────────┤
  │ 04  DATA CONVERSION                 │
  │     ccx2paraview · .frd → .vtu      │
  ├─────────────────────────────────────┤
  │ 05  RESULT PARSING                  │
  │     Peak Von Mises: 148.9 MPa       │
  │     Max Disp: 0.23mm               │
  └─────────────────────────────────────┘

  Inactive card:
    border: 1px solid rgba(255,107,0,0.2)
    background: rgba(10,10,11,0.5)
    left bar: 2px solid rgba(255,107,0,0.2)
    step number: #FF6B00 · 30% opacity

  Active card:
    border: 1px solid rgba(255,107,0,0.8)
    background: rgba(255,107,0,0.04)
    left bar: 2px solid #FF6B00
    Step number pulse:
      gsap.to(stepNum, {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })

  Completed card:
    step number: white · "✓" prefix
    border: 1px solid rgba(255,107,0,0.4)

  Connecting vertical line:
    height: 0 → 100%
    gsap.to(".connector", {
      scaleY: 1,
      transformOrigin: "top",
      ease: "none",
      scrollTrigger: {
        trigger: "#phase-02",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    })

SCROLLTRIGGER FOR SECTION 3:
  scrollTrigger: {
    trigger: "#phase-02",
    start: "top top",
    end: "bottom top",
    pin: true,
    anticipatePin: 1,
    scrub: true,
    onEnter: () => {
      targetCameraPos.set(-1.5, 0.3, 3.2)
      targetFov = 44
    },
    onLeaveBack: () => {
      targetCameraPos.set(1.5, 1.2, 3.5)
      targetFov = 48
    }
  }

3D SCENE — SECTION 3:

Camera target: pos(-1.5, 0.3, 3.2) · fov 44°

PARTICLE SYSTEM:
  Count: 6000 · THREE.Points + custom shader
  Use InstancedMesh NOT individual objects
  THREE.AdditiveBlending for glow

  Emitter: at axle bore · cone 15° down

  Particle zones:
    HIGH stress (bore + bolt holes):
      color: #FF2200 → #FF6B00
      speed: 2.5× · size: 0.025
    MED stress (body):
      color: #FF6B00 → #FFAA00
      speed: 1.5× · size: 0.018
    LOW stress (base):
      color: #00CFFF → #1A3AFF
      speed: 0.8× · size: 0.012

  PHASE A (cards 01-02 active):
    Particles chaotic · all orange
    Random paths · swirling

  PHASE B (card 03 active):
    Paths organizing
    Red clusters at bore + bolts
    Blue calming at base

  PHASE C (cards 04-05 active):
    Full stress-mapped flow
    Particles calm · ordered
    Stress map appears on model surface

  Tetrahedral overlay:
    color: #00CFFF · opacity 0.15
    Appears on card 01
    Fades to 0.05 as stress map arrives

  Load arrows at axle bore:
    3 arrows · #FF2200 · pointing down
    Pulse animation:
      gsap.to(arrows, {
        scaleY: 1.15,
        duration: 0.75,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    Label: "6000N" · orange · 8px

  Bolt hole constraints:
    ⊥ symbols · #FF6B00 · static
    Label: "FIXED BC" · 8px

  Mobile performance:
    Reduce particle count 60%
    Disable bloom · keep stress map
    Pause particles outside frustum

═══════════════════════════════════════
SECTION 4 — "THE MACHINE THAT DOUBTS"
PHASE 03: AUTONOMOUS OPTIMIZATION
═══════════════════════════════════════

LAYOUT:
  position: relative · 100vh
  background: #0A0A0B · z-index: 2
  NO hero elements · own layout

  LEFT 50%:
    Heading · body · iteration table
    Result box · CTA buttons

  RIGHT 50%:
    Transparent · shows 3D model

LEFT COLUMN:
  Label: "PHASE 03 — AUTONOMOUS OPTIMIZATION"
  Heading (Bierika · white · 48px):
    "Design to Constraint"
  Body:
    "VeloForge iterates automatically.
     No engineer in the loop until
     a validated design is found."

  ITERATION TABLE:
  Row entrance with stagger:
    gsap.fromTo(rows,
      { autoAlpha: 0, x: -20 },
      { autoAlpha: 1, x: 0,
        stagger: 0.15,
        ease: "power2.out",
        duration: 0.4,
        immediateRender: false,
        scrollTrigger: {
          trigger: "#phase-03",
          start: "top 70%"
        }
      }
    )

  Table content:
    ITER  THICKNESS  SF      STATUS
    ──────────────────────────────
    01    18.0mm     1.241   ✗ FAIL
    02    20.0mm     1.547   ✗ FAIL
    03    22.0mm     1.623   ✗ FAIL
    04    24.0mm     1.782   ✓ PASS
    ──────────────────────────────
    OPT   22.0mm     1.847   ✓ SAVED

  FAIL row: opacity 0.5 · SF: #FF2200
  PASS row: opacity 1.0 · SF: #FF6B00
  OPTIMAL:
    background: rgba(255,107,0,0.06)
    border: 1px solid rgba(255,107,0,0.5)
    Pulse:
      gsap.to(optRow, {
        "--bg-opacity": 0.12,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })

  RESULT BOX — after OPTIMAL row:
    Appears with:
      gsap.fromTo(resultBox,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0,
          duration: 0.6,
          ease: "power2.out",
          immediateRender: false,
          delay: 0.8
        }
      )

    border: 1px solid #FF6B00
    background: rgba(255,107,0,0.04)
    padding: 24px

    "brake_bracket_optimized.stl"
    Bierika · white · 16px

    Stats count up with Anime.js:
      anime({
        targets: statValues,
        innerHTML: [0, finalValue],
        round: 1,
        easing: 'easeOutExpo',
        duration: 1200
      })

    WEIGHT REDUCTION   SAFETY FACTOR
    −11.3%             1.847×
    PEAK VON MISES     ITERATIONS
    148.9 MPa          N: 23

    Buttons:
    [ DOWNLOAD .STL ]  [ RUN YOUR PART → ]
      Sharp corners · no border-radius
      Primary: #FF6B00 bg · #0A0A0B text
      Secondary: transparent ·
                 #FF6B00 border + text
      letter-spacing: 0.1em · uppercase

SCROLLTRIGGER FOR SECTION 4:
  scrollTrigger: {
    trigger: "#phase-03",
    start: "top top",
    end: "bottom top",
    pin: true,
    anticipatePin: 1,
    scrub: true,
    onEnter: () => {
      targetCameraPos.set(0, 0.5, 5.0)
      targetFov = 38
    },
    onLeaveBack: () => {
      targetCameraPos.set(-1.5, 0.3, 3.2)
      targetFov = 44
    }
  }

3D SCENE — SECTION 4:

Camera target: pos(0, 0.5, 5.0) · fov 38°

ITERATION ANIMATIONS:

ITERATION 1 — FAIL:
  Model Y scale compressed (thinner):
    gsap.to(model.scale,
      { y: 0.75, duration: 0.4,
        ease: "power2.out" }
    )
  Stress map: full red #FF2200
  Cracks appear (THREE.Line):
    3 at axle bore · 2 at each bolt hole
    color: #FF2200 · opacity: 0.8
    Animate length 0 → full · 0.4s
    Bloom on crack lines
  Hold 0.8s
  Terminal: [FAIL] SF: 1.241 < 1.5 ✗
  HEAL: cracks autoAlpha 1 → 0 · 0.3s

ITERATION 2 — FAIL:
  Model slightly thicker:
    gsap.to(model.scale, { y: 0.85 })
  Stress: orange-red mix
  2 cracks at bore only · shorter
  Terminal: [FAIL] SF: 1.547 < 1.5 ✗
  Heal

ITERATION 3 — FAIL:
  gsap.to(model.scale, { y: 0.92 })
  Stress: orange dominant
  1 hairline crack · barely visible
  Terminal: [FAIL] SF: 1.623 < 1.5 ✗
  Heal

ITERATION 4 — PASS:
  gsap.to(model.scale,
    { y: 1.0, duration: 0.5,
      ease: "power2.out" }
  )
  NO CRACKS
  Stress map: full gradient
    Base: #1A3AFF · Mid: #00CFFF
    Body: #FF6B00 · Peak: #FF4500
  Terminal: [PASS] SF: 1.847 ≥ 1.5 ✓

  VALIDATION PULSE:
    Ring 1 (white):
      THREE.RingGeometry
      gsap.fromTo(ring1.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: 3, y: 3, z: 3,
          duration: 1.2,
          ease: "power2.out",
          immediateRender: false }
      )
      gsap.fromTo(ring1.material,
        { opacity: 0.8 },
        { opacity: 0, duration: 1.2,
          ease: "power2.out",
          immediateRender: false }
      )

    Ring 2 (orange) · delayed 0.2s:
      Same animation · color #FF6B00
      gsap.fromTo with delay: 0.2
      immediateRender: false on both

  "STRUCTURALLY SOUND" TEXT:
    Bierika · white · clamp(32px,4vw,56px)
    letter-spacing: 0.2em
    position: fixed · centered on screen
    z-index: 100

    gsap.timeline()
      .fromTo(text,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5,
          ease: "power2.out",
          immediateRender: false }
      )
      .to(text,
        { autoAlpha: 0, duration: 0.5,
          ease: "power2.in",
          delay: 2.0 }
      )

  After text fades: CTAs autoAlpha 0 → 1

  Terminal final:
    [SAVE] brake_bracket_optimized.stl ✓
    [DONE] Optimal design found · iter 4
    [OUT]  Safety factor: 1.847 · VALIDATED

═══════════════════════════════════════
PERFORMANCE RULES — ALL SECTIONS
═══════════════════════════════════════

Section 2 particles:
  Max 200 active · recycle pool
  Dispose after 1.5s lifetime
  THREE.Points NOT individual meshes

Section 3 particles:
  6000 via InstancedMesh NOT individuals
  Custom GLSL shader for zone colors
  THREE.AdditiveBlending
  Frustum culling: enabled
  Pause when outside camera view

Section 4 cracks:
  THREE.Line reused · NOT remounted
  Heal via opacity NOT remove/add
  Ring: single geometry · scale animated

All sections matchMedia:
  Mobile (max-width 799px):
    Particle count × 0.4 (60% reduction)
    Disable bloom (EffectComposer)
    Keep stress map colors
    Reduce ScrollTrigger scrub smoothness

  reduceMotion:
    duration: 0 on all tweens
    Skip particle animations
    Show final states immediately

═══════════════════════════════════════
BROWSER AGENT VERIFICATION
═══════════════════════════════════════

Record full scroll video top → bottom:

Section 2:
  ✓ Distinct layout from hero (no logo)
  ✓ Code types in sync with scroll
  ✓ KEY LINES flash white when hit
  ✓ Box appears on "new Box"
  ✓ Sparks on Union operation
  ✓ Red sparks on Subtract operations
  ✓ 9 pocket cuts visible
  ✓ Pulse on ExportStl

Section 3:
  ✓ Distinct layout (top bar visible)
  ✓ Pipeline cards stagger in
  ✓ Cards activate as scroll progresses
  ✓ Connector line fills downward
  ✓ Particles flow through model
  ✓ Red at bore · blue at base
  ✓ Flow organizes through 3 phases
  ✓ Terminal lines match card activation

Section 4:
  ✓ Distinct layout (no hero elements)
  ✓ Table rows stagger in
  ✓ FAIL rows dim · red SF
  ✓ Cracks appear iter 1 · 2 · 3
  ✓ Cracks smaller each iteration
  ✓ NO cracks on iter 4
  ✓ Double ring pulse on PASS
  ✓ "STRUCTURALLY SOUND" appears
  ✓ Holds 2s · fades out
  ✓ CTAs visible after text fades
  ✓ Stats count up in result box

Camera:
  ✓ Hero → Phase01: moves to (1.5,1.2,3.5)
  ✓ Phase01 → Phase02: moves to (-1.5,0.3,3.2)
  ✓ Phase02 → Phase03: moves to (0,0.5,5.0)
  ✓ All transitions lerp · never snap
  ✓ Orange sweep line on each boundary

Performance:
  ✓ Report draw call count
  ✓ Report mobile fps
  ✓ Report desktop fps
  ✓ Flag any drops below 55fps

→ Save full video as Artifact
→ Save mobile recording as Artifact
→ Report anything broken before
  asking for next task