/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, @typescript-eslint/no-unused-vars */
"use client";

/**
 * HeroScene — 5-stage build update
 *
 * Stages:
 *  1. Floating dots with sin-wave drift (0–1.2s)
 *  2. Edge connections draw in (1.2–2.8s)
 *  3. Black matte solid appears (2.8–3.6s)
 *  4. Metallic transition + lights fade in (3.6–4.4s)
 *  5. Stress map color overlay (4.4–5.8s)
 *  → Slow rotation begins
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

export type ScenePhase = 0 | 1 | 2 | 3;

/* ─── Camera Controller ────────────────────────────────────────────────────── */

interface CameraControllerProps {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  fovRef:      React.MutableRefObject<number>;
}

function CameraController({ positionRef, fovRef }: CameraControllerProps) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.lerp(positionRef.current, 0.05);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov += (fovRef.current - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/* ─── Light Controller ─────────────────────────────────────────────────────── */

interface LightControllerProps {
  scrollRef: React.MutableRefObject<number>;
  keyRef:    React.MutableRefObject<THREE.DirectionalLight | null>;
  rimRef:    React.MutableRefObject<THREE.DirectionalLight | null>;
  fillRef:   React.MutableRefObject<THREE.DirectionalLight | null>;
  hotRef:    React.MutableRefObject<THREE.PointLight | null>;
}

function LightController({ scrollRef, keyRef, rimRef, fillRef, hotRef }: LightControllerProps) {
  // We manage the fill light intensity purely through GSAP in the BracketMesh now,
  // but we provide it here as a baseline
  return (
    <>
      {/* Studio Environment Map for natural metal reflections */}
      <ambientLight intensity={0.1} />
      
      {/* 
        Key light (main)
        color: #FFFFFF · intensity: 3.5 · position: (5, 8, 5)
        Fades in during Stage 4
      */}
      <directionalLight 
        ref={keyRef}  
        position={[5, 8, 5]}   
        intensity={0} 
        color="#FFFFFF" 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
      
      {/* 
        Rim light (orange edge traces back)
        color: #FF6B00 · intensity: 2.0 · position: (-6, 2, -4)
      */}
      <directionalLight 
        ref={rimRef} 
        position={[-6, 2, -4]} 
        intensity={0} 
        color="#FF6B00" 
      />

      {/* 
        Fill light (cool blue under-fill)
        color: #1A2AFF · intensity: 0.3 · position: (0, -5, 3)
      */}
      <directionalLight 
        ref={fillRef} 
        position={[0, -5, 3]} 
        intensity={0} 
        color="#1A2AFF" 
      />

      {/* 
        Point light (hot spot specular)
        color: #FFFFFF · intensity: 1.5 · position: (2, 4, 2)
      */}
      <pointLight       
        ref={hotRef} 
        position={[2, 4, 2]} 
        intensity={0} 
        color="#FFFFFF"
        distance={15}
        decay={2}
      />
    </>
  );
}

/* ─── Bracket Geometry ─────────────────────────────────────────────────────── */

function createBracketGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.6, -0.8);
  shape.lineTo(0.9, -0.8);
  shape.quadraticCurveTo(1.1, -0.8, 1.1, -0.6);
  shape.lineTo(1.1, -0.1);
  shape.lineTo(0.4, -0.1);
  shape.lineTo(0.4, 0.3);
  shape.lineTo(0.7, 0.3);
  shape.quadraticCurveTo(0.8, 0.3, 0.8, 0.4);
  shape.lineTo(0.8, 0.9);
  shape.quadraticCurveTo(0.8, 1.1, 0.6, 1.1);
  shape.lineTo(-0.1, 1.1);
  shape.quadraticCurveTo(-0.3, 1.1, -0.3, 0.9);
  shape.lineTo(-0.3, 0.4);
  shape.lineTo(0.0, 0.4);
  shape.lineTo(0.0, -0.1);
  shape.lineTo(-0.6, -0.1);
  shape.quadraticCurveTo(-0.8, -0.1, -0.8, -0.3);
  shape.lineTo(-0.8, -0.6);
  shape.quadraticCurveTo(-0.8, -0.8, -0.6, -0.8);
  shape.closePath();

  [
    { cx: -0.4, cy: -0.45, rx: 0.18, ry: 0.18 },
    { cx:  0.7, cy: -0.45, rx: 0.15, ry: 0.15 },
    { cx:  0.25, cy: 0.70, rx: 0.16, ry: 0.16 },
  ].forEach(({ cx, cy, rx, ry }) => {
    const h = new THREE.Path();
    h.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false);
    shape.holes.push(h);
  });

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.35, bevelEnabled: true,
    bevelThickness: 0.015, bevelSize: 0.015,
    bevelSegments: 3, curveSegments: 24,
  });
}

/* ─── Bracket Mesh with 5-Stage Build Animation ───────────────────────────── */

function BracketMesh({
  phaseRef,
  scrollRef,
  lightRefs,
}: {
  phaseRef: React.MutableRefObject<ScenePhase>;
  scrollRef: React.MutableRefObject<number>;
  lightRefs: { 
    key: React.MutableRefObject<THREE.DirectionalLight | null>; 
    rim: React.MutableRefObject<THREE.DirectionalLight | null>; 
    fill: React.MutableRefObject<THREE.DirectionalLight | null>; 
    hot: React.MutableRefObject<THREE.PointLight | null>; 
  };
}) {
  const meshRef   = useRef<THREE.Mesh>(null);
  const edgesRef  = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef  = useRef<THREE.Group>(null);
  const lastPhase = useRef<ScenePhase>(-1 as ScenePhase);
  const buildTriggered = useRef(false);
  const timeRef = useRef(0);

  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const geometry = useMemo(() => createBracketGeometry(), []);
  const edges    = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry]);

  // Subsample vertices for floating dots — ~200 pts
  const pointsGeo = useMemo(() => {
    const pos = geometry.attributes.position;
    const stride = Math.max(1, Math.floor(pos.count / 200));
    const positions: number[] = [];
    for (let i = 0; i < pos.count; i += stride) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    // Store original positions for float animation
    geo.setAttribute("origPosition", new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
    return geo;
  }, [geometry]);

  // 4-stop stress color map: blue → cyan → UI orange → red-orange
  const stressColors = useMemo(() => {
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const stops = [
      { t: 0.00, color: new THREE.Color("#1A3AFF") },
      { t: 0.33, color: new THREE.Color("#00CFFF") },
      { t: 0.66, color: new THREE.Color("#FF6B00") },
      { t: 1.00, color: new THREE.Color("#FF2200") },
    ];
    // Use Y position as stress proxy (bottom=low, top/holes=high)
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const yRange = maxY - minY || 1;
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - minY) / yRange;
      // Blend between stops
      let s0 = stops[0], s1 = stops[1];
      for (let j = 0; j < stops.length - 1; j++) {
        if (t >= stops[j].t && t <= stops[j + 1].t) { s0 = stops[j]; s1 = stops[j + 1]; break; }
      }
      const localT = (t - s0.t) / (s1.t - s0.t + 0.0001);
      c.copy(s0.color).lerp(s1.color, Math.max(0, Math.min(1, localT)));
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    return colors;
  }, [geometry]);

  useEffect(() => {
    geometry.setAttribute("color", new THREE.BufferAttribute(stressColors, 3));
  }, [geometry, stressColors]);

  useEffect(() => {
    const pts  = pointsRef.current;
    const mesh = meshRef.current;
    const edg  = edgesRef.current;
    if (!pts || !mesh || !edg) return;

    const pm = pts.material as THREE.PointsMaterial;
    const mm = mesh.material as THREE.MeshStandardMaterial;
    const em = edg.material as THREE.LineBasicMaterial;

    // Set absolute starting state for reliable scrubbing
    pm.opacity = 0;
    em.opacity = 0;
    mm.opacity = 0;
    mm.metalness = 0.0;
    mm.roughness = 1.0;
    mm.color.set("#0A0A0B");
    mm.emissive.set("#000000");
    mm.emissiveIntensity = 0;
    mm.vertexColors = false;

    if (lightRefs.key.current)  lightRefs.key.current.intensity  = 0;
    if (lightRefs.rim.current)  lightRefs.rim.current.intensity  = 0;
    if (lightRefs.fill.current) lightRefs.fill.current.intensity = 0;
    if (lightRefs.hot.current)  lightRefs.hot.current.intensity  = 0;

    const tl = gsap.timeline({ paused: true });

    tl.to(pm, { opacity: 1, duration: 0.8 }, 0);
    tl.to(em, { opacity: 0.5, duration: 1.6 }, 1.2);
    tl.to(pm, { opacity: 0.25, duration: 0.8 }, 1.2);
    
    tl.to(mm, { opacity: 1, duration: 0.8 }, 2.8);
    tl.to(pm, { opacity: 0, duration: 0.4 }, 2.8);

    const dummyMat = { m: 0.0, r: 1.0, eI: 0 };
    tl.to(dummyMat, {
      m: 0.95,
      r: 0.05,
      eI: 0.2, // Target emissive intensity
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        mm.metalness = dummyMat.m;
        mm.roughness = dummyMat.r;
        mm.envMapIntensity = 1.0 + (dummyMat.m * 0.2); // Up to 1.2
        mm.emissiveIntensity = dummyMat.eI;
        // Interpolate emissive color up to #100808 (RGB: 16, 8, 8)
        const factor = dummyMat.eI / 0.2;
        mm.emissive.setRGB((16/255) * factor, (8/255) * factor, (8/255) * factor);
      }
    }, 3.6);

    if (lightRefs.key.current)  tl.to(lightRefs.key.current,  { intensity: 3.5, duration: 0.8 }, 3.6);
    if (lightRefs.rim.current)  tl.to(lightRefs.rim.current,  { intensity: 2.0, duration: 0.8 }, 3.6);
    if (lightRefs.fill.current) tl.to(lightRefs.fill.current, { intensity: 0.3, duration: 0.8 }, 3.6);
    if (lightRefs.hot.current)  tl.to(lightRefs.hot.current,  { intensity: 1.5, duration: 0.8 }, 3.6);

    tl.to(em, { opacity: 0.35, duration: 1.4 }, 4.4);

    tlRef.current = tl;

    return () => { tl.kill(); };
  }, [geometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    // Calculate scrub progress based on scroll from 0.02 to 0.35
    const p = scrollRef.current;
    const progress = Math.min(Math.max((p - 0.02) / 0.33, 0), 1);

    if (tlRef.current) {
      tlRef.current.progress(progress);
    }

    // Slow Y rotation only when fully built
    if (progress >= 0.95) {
      groupRef.current.rotation.y += 0.003;
    }

    // Gentle x tilt regardless
    groupRef.current.rotation.x = Math.sin(timeRef.current * 0.2) * 0.06;

    // LOCKED scale + position
    groupRef.current.scale.set(0.5, 0.5, 0.5);
    groupRef.current.position.set(1.2, 0.0, 0);

    // ── Floating dot animation (Stage 1) ──
    const pts = pointsRef.current;
    if (pts && progress < 0.3) {
      const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
      const origAttr = pts.geometry.attributes.origPosition as THREE.BufferAttribute;
      const amp = 0.03, freq = 0.8;
      for (let i = 0; i < posAttr.count; i++) {
        const ox = origAttr.getX(i), oy = origAttr.getY(i), oz = origAttr.getZ(i);
        posAttr.setXYZ(
          i,
          ox + Math.sin(timeRef.current * freq + i * 0.3) * amp,
          oy + Math.sin(timeRef.current * freq + i * 0.7) * amp,
          oz + Math.sin(timeRef.current * freq + i * 1.1) * amp,
        );
      }
      posAttr.needsUpdate = true;
    }

    // Manually toggle vertexColors
    const mm = meshRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mm) {
      const shouldHaveVertexColors = progress > 0.95;
      if (mm.vertexColors !== shouldHaveVertexColors) {
        mm.vertexColors = shouldHaveVertexColors;
        mm.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef} position={[1.2, 0.0, 0]} scale={[0.5, 0.5, 0.5]}>
      <points ref={pointsRef} geometry={pointsGeo}>
        <pointsMaterial color="#FF6B00" size={0.02} transparent opacity={0} sizeAttenuation />
      </points>
      <lineSegments ref={edgesRef} geometry={edges}>
        <lineBasicMaterial color="#FF6B00" transparent opacity={0} linewidth={1} />
      </lineSegments>
      <mesh ref={meshRef} geometry={geometry} castShadow>
        <meshStandardMaterial color="#0A0A0B" metalness={0.0} roughness={1.0} transparent opacity={0} vertexColors={false} />
      </mesh>
    </group>
  );
}


/* ─── Post-Processing Controller (Imperative) ──────────────────────────────── */
// We intentionally bypass R3F's JSX reconciler here.
// R3F v9 serialises all JSX props; any Three.js object passed as a prop gets
// __r3f:{parent,children} circular state attached, causing "Converting circular
// structure to JSON" crashes. Building the EffectComposer imperatively avoids
// any prop-serialisation of Three.js objects.

import {
  EffectComposer as PPEffectComposer,
  RenderPass,
  BloomEffect,
  NoiseEffect,
  ChromaticAberrationEffect,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  EffectPass,
  BlendFunction,
} from "postprocessing";

function PostProcessFx({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<PPEffectComposer | null>(null);
  const chromRef    = useRef<ChromaticAberrationEffect | null>(null);
  const lastScroll  = useRef(0);

  useEffect(() => {
    const composer = new PPEffectComposer(gl, { multisampling: 4 });
    composerRef.current = composer;

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloom = new BloomEffect({
      luminanceThreshold: 0.75,
      luminanceSmoothing: 0.1,
      intensity: 0.8,
      mipmapBlur: true,
      radius: 0.6
    });

    const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY });
    noise.blendMode.opacity.value = 0.04;

    const chrom = new ChromaticAberrationEffect();
    chrom.offset.set(0.002, 0.002);
    chromRef.current = chrom;

    const smaa = new SMAAEffect({
      preset: SMAAPreset.HIGH,
      edgeDetectionMode: EdgeDetectionMode.COLOR,
    });

    const smaaPass = new EffectPass(camera, smaa);
    composer.addPass(smaaPass);

    const fxPass = new EffectPass(camera, bloom, noise, chrom);
    composer.addPass(fxPass);

    composer.setSize(size.width, size.height);

    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size]);

  useFrame((_, delta) => {
    const chrom = chromRef.current;
    if (!chrom) return;

    const ds = Math.abs(scrollRef.current - lastScroll.current);
    lastScroll.current = scrollRef.current;
    const speed = Math.min(ds / (delta || 0.016), 2.0);
    const target = 0.002 + speed * 0.005;
    const curr = chrom.offset.x;
    const next = curr + (target - curr) * 0.15;
    chrom.offset.set(next, next);

    composerRef.current?.render(delta);
  }, 1);

  return null;
}

/* ─── HeroScene ────────────────────────────────────────────────────────────── */

export interface HeroSceneProps {
  phaseRef:          React.MutableRefObject<ScenePhase>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
  fovTargetRef:      React.MutableRefObject<number>;
  scrollProgressRef: React.MutableRefObject<number>;
  isFrontLayer?:     boolean;
}

export default function HeroScene({
  phaseRef, cameraPositionRef, fovTargetRef, scrollProgressRef
}: HeroSceneProps) {
  const isMobile = typeof window !== "undefined"
    ? /iPhone|iPad|Android/i.test(navigator.userAgent) : false;

  // Shared light refs — created outside Canvas so BracketMesh can GSAP-animate them
  const keyLightRef  = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef  = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hotLightRef  = useRef<THREE.PointLight | null>(null);
  
  const lightRefs = useMemo(() => ({ 
    key: keyLightRef, 
    rim: rimLightRef, 
    fill: fillLightRef, 
    hot: hotLightRef 
  }), []);

  return (
    <Canvas
      dpr={isMobile ? 1 : [1, 2]}
      camera={{ position: [0, 0, 4.5], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4, outputColorSpace: THREE.SRGBColorSpace }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", background: "#08080A" }}
      performance={{ min: 0.5 }}
    >
      <CameraController positionRef={cameraPositionRef} fovRef={fovTargetRef} />
      <LightController  scrollRef={scrollProgressRef} keyRef={keyLightRef} rimRef={rimLightRef} fillRef={fillLightRef} hotRef={hotLightRef} />
      <BracketMesh      phaseRef={phaseRef} scrollRef={scrollProgressRef} lightRefs={lightRefs} />
      <PostProcessFx    scrollRef={scrollProgressRef} />
    </Canvas>
  );
}
