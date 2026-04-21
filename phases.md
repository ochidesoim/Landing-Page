Before executing read:
@gsap-core @gsap-scrolltrigger @3d-style

Read PROJECT_CONTEXT.md first.

PROBLEM:
Sections scroll past immediately.
They should PIN in place while
animations play, THEN release.

NEVER touch canvas-root.
NEVER touch hero 500vh wrapper.
NEVER touch useScrollScene.ts.

══════════════════════════════════════
FIX — PIN ALL 3 SECTIONS
══════════════════════════════════════

Each phase section needs to:
  1. Stick to viewport when it enters
  2. Play its animation while pinned
  3. Release and scroll away when done

This is called a "scrubbed pin" in GSAP.

CRITICAL — this is why hero works:
  Hero uses 500vh scroll wrapper
  New sections must use ScrollTrigger pin
  They are DIFFERENT systems
  Do NOT mix them

══════════════════════════════════════
PHASE 01 PIN
══════════════════════════════════════

Section height in DOM: 300vh
  (gives scroll distance for animation)

ScrollTrigger config:
  ScrollTrigger.create({
    trigger: "#phase-01",
    start: "top top",
    end: "+=200%",
    pin: true,
    anticipatePin: 1,
    scrub: 1,
    onUpdate: (self) => {
      // self.progress 0→1
      // drives code typing
      // drives 3D construction events
      const p = self.progress

      // Code typing progress
      setCodeProgress(p)

      // 3D events at thresholds:
      if (p > 0.15) triggerBox()
      if (p > 0.30) triggerUnion()
      if (p > 0.50) triggerSubtractBore()
      if (p > 0.65) triggerSubtractPockets()
      if (p > 0.90) triggerExportStl()
    }
  })

What user experiences:
  Scroll down → section pins to screen
  Keep scrolling → code types itself
  Keep scrolling → 3D model builds
  Scroll enough → section unpins
  Next section enters

══════════════════════════════════════
PHASE 02 PIN
══════════════════════════════════════

Section height in DOM: 300vh

ScrollTrigger.create({
  trigger: "#phase-02",
  start: "top top",
  end: "+=200%",
  pin: true,
  anticipatePin: 1,
  scrub: 1,
  onUpdate: (self) => {
    const p = self.progress

    // Activate pipeline cards:
    if (p > 0.10) activateCard(1)
    if (p > 0.28) activateCard(2)
    if (p > 0.46) activateCard(3)
    if (p > 0.64) activateCard(4)
    if (p > 0.82) activateCard(5)

    // Particle flow phases:
    if (p < 0.40) setParticlePhase('chaos')
    if (p >= 0.40 && p < 0.70) 
      setParticlePhase('converging')
    if (p >= 0.70) 
      setParticlePhase('solved')

    // Terminal lines appear with cards
    setTerminalProgress(p)

    // Connector line fills:
    setConnectorHeight(p)
  }
})

What user experiences:
  Scroll → section pins
  Keep scrolling → cards activate one by one
  Keep scrolling → particles organize
  Keep scrolling → terminal fills
  Scroll enough → section unpins

══════════════════════════════════════
PHASE 03 PIN
══════════════════════════════════════

Section height in DOM: 350vh
(needs more scroll for 4 iterations)

ScrollTrigger.create({
  trigger: "#phase-03",
  start: "top top",
  end: "+=250%",
  pin: true,
  anticipatePin: 1,
  scrub: 1,
  onUpdate: (self) => {
    const p = self.progress

    // Table rows appear:
    if (p > 0.08) showRow(1)
    if (p > 0.20) showRow(2)
    if (p > 0.32) showRow(3)
    if (p > 0.44) showRow(4)
    if (p > 0.56) showRow('optimal')

    // 3D iterations:
    if (p < 0.20) setIteration(1) // thin · red · cracks
    if (p >= 0.20 && p < 0.35) setIteration(2)
    if (p >= 0.35 && p < 0.50) setIteration(3)
    if (p >= 0.50) setIteration(4) // pass · no cracks

    // Result box + pulse:
    if (p > 0.65) showResultBox()
    if (p > 0.72) triggerValidationPulse()
    if (p > 0.78) showStructurallySoundText()
    if (p > 0.90) showCTAButtons()
  }
})

What user experiences:
  Scroll → section pins
  Keep scrolling → table rows appear
  Keep scrolling → model changes thickness
  Keep scrolling → cracks appear and heal
  Keep scrolling → PASS · pulse · text
  Scroll enough → section unpins

══════════════════════════════════════
SECTION DOM HEIGHT SETUP
══════════════════════════════════════

In page.tsx update section heights:

  <section id="phase-01"
    style={{ minHeight: "300vh" }}>

  <section id="phase-02"
    style={{ minHeight: "300vh" }}>

  <section id="phase-03"
    style={{ minHeight: "350vh" }}>

The extra height = scroll distance
while pinned. Without this the pin
releases too fast.

══════════════════════════════════════
GSAP RULES — NON NEGOTIABLE
══════════════════════════════════════

✅ anticipatePin: 1 on every pin
   prevents jump when pin engages
✅ scrub: 1 ties animation to scroll
   not time-based
✅ store all ScrollTrigger refs
   kill them on component unmount
✅ autoAlpha not opacity on all reveals
✅ x y scale — never raw transform
✅ gsap.matchMedia() wrapping all:
   mobile: pin still works
   reduceMotion: skip animations
   show final states immediately

❌ NEVER pin: true without anticipatePin: 1
❌ NEVER use time-based animations
   inside scrubbed ScrollTrigger
   use progress thresholds instead
❌ NEVER touch hero 500vh wrapper
❌ NEVER touch canvas-root
❌ NEVER new Lenis()

══════════════════════════════════════
BROWSER AGENT VERIFICATION
══════════════════════════════════════

Record full scroll video:

Phase 01:
  ✓ Section PINS when it hits top
  ✓ Scrolling types the code
  ✓ 3D model builds with scroll
  ✓ Section releases after full animation
  ✓ Scrolls away cleanly

Phase 02:
  ✓ Section PINS when it hits top
  ✓ Cards activate one by one on scroll
  ✓ Particles organize through 3 phases
  ✓ Section releases after card 5

Phase 03:
  ✓ Section PINS when it hits top
  ✓ Table rows appear on scroll
  ✓ Model thickness changes each iteration
  ✓ Cracks appear iter 1-3
  ✓ NO cracks iter 4
  ✓ Pulse + text + CTAs appear
  ✓ Section releases after CTAs

✓ Hero still works correctly
✓ Canvas never goes black
✓ Camera moves on section enter

→ Save video as Artifact
→ Report fps desktop + mobile