import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

interface AutoRotateOptions {
  speed?: number
  /** Set false to freeze (reduced motion, or while the user is driving). */
  enabled?: boolean
  axis?: 'x' | 'y' | 'z'
}

/** Attach the returned ref to a <group> to spin it in place. */
export function useAutoRotate({ speed = 0.15, enabled = true, axis = 'y' }: AutoRotateOptions = {}) {
  const ref = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!enabled || !ref.current) return
    // Clamp delta so a backgrounded tab doesn't return and snap the rotation.
    ref.current.rotation[axis] += speed * Math.min(delta, 0.1)
  })

  return ref
}
