import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

export function usePhaseCamera() {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0,0,4.5))
  const targetFov = useRef(42)

  useEffect(() => {
    const triggers = [
      ScrollTrigger.create({
        trigger: "#phase-01",
        start: "top 50%",
        onEnter: () => {
          targetPos.current.set(1.5, 1.2, 3.5)
          targetFov.current = 48
        },
        onLeaveBack: () => {
          targetPos.current.set(0, 0, 4.5)
          targetFov.current = 42
        }
      }),
      ScrollTrigger.create({
        trigger: "#phase-02",
        start: "top 50%",
        onEnter: () => {
          targetPos.current.set(-1.5, 0.3, 3.2)
          targetFov.current = 44
        },
        onLeaveBack: () => {
          targetPos.current.set(1.5, 1.2, 3.5)
          targetFov.current = 48
        }
      }),
      ScrollTrigger.create({
        trigger: "#phase-03",
        start: "top 50%",
        onEnter: () => {
          targetPos.current.set(0, 0.5, 5.0)
          targetFov.current = 38
        },
        onLeaveBack: () => {
          targetPos.current.set(-1.5, 0.3, 3.2)
          targetFov.current = 44
        }
      })
    ]
    return () => triggers.forEach(t => t.kill())
  }, [])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.035)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov += (targetFov.current - camera.fov) * 0.035
      camera.updateProjectionMatrix()
    }
  })
}
