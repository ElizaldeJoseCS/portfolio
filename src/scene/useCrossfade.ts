import { useEffect, useRef, useState } from 'react'
import type { Stage, World } from '@/types'
import { WORLD_TRANSITION_MS } from '@/lib/world-context'

interface Crossfade {
  gameOpacity: number
  engineerOpacity: number
  /**
   * Visibility, not mounting. Both scenes stay mounted for the life of the
   * canvas so their compiled shader programs are never released.
   */
  showGame: boolean
  showEngineer: boolean
  progress: number
  warming: boolean
}

/**
 * How long the inactive scene is left visible (at zero opacity) after load.
 *
 * three only compiles a material's program when it actually draws, so the
 * inactive scene has to be rendered once up front. Without this the first
 * world switch pays the whole compile cost mid-transition and visibly stalls.
 * It stays *mounted* afterwards so the programs are never disposed.
 */
const WARMUP_MS = 1200

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/**
 * Drives the world crossfade (spec §4.2 / §13: ~400ms).
 *
 * It re-renders on rAF *only* while a switch is in flight — roughly two dozen
 * renders per toggle — then settles to constant values so the idle scene costs
 * nothing on the React side.
 */
export function useCrossfade(world: World, stage: Stage, reducedMotion: boolean): Crossfade {
  const [progress, setProgress] = useState(world === 'engineer' ? 1 : 0)
  const [warming, setWarming] = useState(true)
  const target = world === 'engineer' ? 1 : 0
  const raf = useRef(0)
  // On the landing neither world scene is shown; only the hero particles are,
  // recoloured by the landing theme.
  const onLanding = stage === 'landing'

  useEffect(() => {
    const id = window.setTimeout(() => setWarming(false), WARMUP_MS)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setProgress(target)
      return
    }

    let start = 0
    let from = 0
    let cancelled = false

    setProgress((current) => {
      from = current
      return current
    })

    const tick = (now: number) => {
      if (cancelled) return
      if (!start) start = now
      const t = Math.min(1, (now - start) / WORLD_TRANSITION_MS)
      setProgress(from + (target - from) * easeInOut(t))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf.current)
    }
  }, [target, reducedMotion])

  return {
    gameOpacity: 1 - progress,
    engineerOpacity: progress,
    showGame: warming || (!onLanding && progress < 0.999),
    showEngineer: warming || (!onLanding && progress > 0.001),
    warming,
    progress,
  }
}
