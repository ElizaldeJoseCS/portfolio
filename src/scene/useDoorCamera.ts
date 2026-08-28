import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld, DOOR_SEQUENCE_MS } from '@/lib/world-context'

/** Fraction of the sequence before the camera starts moving through. */
const WALK_AT = 0.34

/** Camera path for the intro: hold, then walk through the opening. */
export function useDoorCamera() {
  const { doorState, stage } = useWorld()
  const progress = useRef(0)

  useFrame((state, delta) => {
    // Hard bail outside the intro. Without this the hook keeps writing the
    // camera every frame after the door is done, fighting CameraRig's own
    // write on the same frame — the camera then alternates between two
    // transforms at 60Hz, which reads as violent shaking and inverted
    // controls in both worlds.
    if (stage !== 'door') return

    if (doorState === 'opening') {
      progress.current = Math.min(1, progress.current + delta / (DOOR_SEQUENCE_MS / 1000))
    } else if (doorState === 'closed') {
      progress.current = 0
    }

    const p = progress.current
    // Wait for the door to be genuinely open before moving, or it reads as
    // walking into it.
    const walk = THREE.MathUtils.clamp((p - WALK_AT) / (1 - WALK_AT), 0, 1)
    const eased = walk * walk * (3 - 2 * walk)

    state.camera.position.set(0, -0.35, 3.4 - eased * 9.9)
    state.camera.lookAt(0, -0.5, -6.5)
  })
}
