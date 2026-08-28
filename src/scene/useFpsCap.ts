import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Returns a gate for expensive per-frame work. Call it inside `useFrame`:
 * heavy updates then run at most `fps` times a second while the render loop
 * still draws at full rate.
 */
export function useFpsCap(fps: number) {
  const acc = useRef(0)
  const interval = 1 / fps
  const ready = useRef(false)

  useFrame((_, delta) => {
    acc.current += delta
    if (acc.current >= interval) {
      acc.current %= interval
      ready.current = true
    } else {
      ready.current = false
    }
  })

  return () => ready.current
}
