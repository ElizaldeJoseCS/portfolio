import { useEffect, useRef, useState } from 'react'

/**
 * Samples frame rate on the main thread with rAF. Used by the debug overlay
 * (`?fps=1`) to verify the ≥45fps acceptance criterion in spec §13.
 * Pass `enabled: false` and it schedules nothing at all.
 */
export function useFps(enabled = true, sampleMs = 500): number {
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  const last = useRef(0)

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    last.current = performance.now()
    frames.current = 0

    const tick = (now: number) => {
      frames.current += 1
      const elapsed = now - last.current
      if (elapsed >= sampleMs) {
        setFps(Math.round((frames.current * 1000) / elapsed))
        frames.current = 0
        last.current = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled, sampleMs])

  return fps
}
