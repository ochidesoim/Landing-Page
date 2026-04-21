import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

export type PhaseEvent = 'idle' | 'p1-construct' | 'p2-fea' | 'p3-optimize' | 'p3-pass'

export interface PhaseEventRefs {
  event: React.MutableRefObject<PhaseEvent>
  p1Progress: React.MutableRefObject<number>   // 0-1 code typing progress
  p2Progress: React.MutableRefObject<number>   // 0-1 FEA pipeline progress
  p3Progress: React.MutableRefObject<number>   // 0-1 iteration progress
}

export function usePhaseEvents(): PhaseEventRefs {
  const event     = useRef<PhaseEvent>('idle')
  const p1Progress = useRef(0)
  const p2Progress = useRef(0)
  const p3Progress = useRef(0)

  useEffect(() => {
    const triggers = [
      ScrollTrigger.create({
        trigger: '#phase-01',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onEnter: () => { event.current = 'p1-construct' },
        onLeaveBack: () => { event.current = 'idle' },
        onUpdate: (self) => { p1Progress.current = self.progress },
      }),
      ScrollTrigger.create({
        trigger: '#phase-02',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onEnter: () => { event.current = 'p2-fea' },
        onLeaveBack: () => { event.current = 'p1-construct'; p2Progress.current = 0 },
        onUpdate: (self) => { p2Progress.current = self.progress },
      }),
      ScrollTrigger.create({
        trigger: '#phase-03',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onEnter: () => { event.current = 'p3-optimize' },
        onLeaveBack: () => { event.current = 'p2-fea'; p3Progress.current = 0 },
        onUpdate: (self) => {
          p3Progress.current = self.progress
          if (self.progress >= 0.75) event.current = 'p3-pass'
          else if (event.current === 'p3-pass') event.current = 'p3-optimize'
        },
      }),
    ]
    return () => triggers.forEach(t => t.kill())
  }, [])

  return { event, p1Progress, p2Progress, p3Progress }
}
