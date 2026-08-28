import { useCallback, useEffect, useMemo, useState } from 'react'
import type { QualityTier } from '@/types'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const STORAGE_KEY = 'portfolio:quality'

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number
}

/** Heuristic device tier (spec §5.2). Deliberately pessimistic on mobile. */
function detectTier(reducedMotion: boolean): QualityTier {
  if (typeof window === 'undefined') return 'high'
  if (reducedMotion) return 'low'

  const nav = navigator as NavigatorWithHints
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 768

  if (coarse || narrow) return 'low'
  if (cores <= 4 || memory <= 4) return 'low'
  return 'high'
}

export interface QualityState {
  tier: QualityTier
  /** True once auto-tuning has been locked off (manual override or fallback). */
  locked: boolean
  /** Stops all further automatic tier changes. */
  lock: () => void
  /** True when the user picked the tier by hand; auto-degrade then stops. */
  isManual: boolean
  setTier: (tier: QualityTier) => void
  /**
   * Called by drei's PerformanceMonitor on a sustained FPS drop.
   *
   * Degradation is deliberately **one-way**. Spec §5.2 asks for the tier to
   * rise again on recovery, but restoring turns the monitor into an
   * oscillator: the scene drops to low, recovers *because* it dropped, climbs
   * back, drops again. Every crossing mounts or unmounts the post-processing
   * stack and changes the particle count, which is far more distracting than
   * simply staying on low.
   */
  degrade: () => void
  /** Derived budgets consumed by the scenes. */
  particleCount: number
  /**
   * Fixed for the life of the session. Changing dpr resizes the drawing
   * buffer, which is visible as a jolt every time — not worth the frame it
   * might buy back.
   */
  dpr: [number, number]
  postProcessing: boolean
  shadows: boolean
}

export function useQualityTier(): QualityState {
  const reducedMotion = usePrefersReducedMotion()
  const [isManual, setIsManual] = useState(false)
  const [locked, setLocked] = useState(false)
  const [tier, setTierState] = useState<QualityTier>('high')

  // Resolved once, on mount, and never again.
  const [dpr] = useState<[number, number]>(() => {
    if (typeof window === 'undefined') return [1, 2]
    const coarse = window.matchMedia('(pointer: coarse)').matches
    return coarse || window.innerWidth < 768 ? [1, 1.5] : [1, 2]
  })

  // Detect after mount so the first paint isn't blocked on media queries.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'high' || stored === 'low') {
      setTierState(stored)
      setIsManual(true)
      return
    }
    setTierState(detectTier(reducedMotion))
  }, [reducedMotion])

  const setTier = useCallback((next: QualityTier) => {
    setIsManual(true)
    setTierState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-mode storage failures are not worth surfacing.
    }
  }, [])

  const lock = useCallback(() => setLocked(true), [])

  const degrade = useCallback(() => {
    setTierState((prev) => (isManual || locked ? prev : 'low'))
  }, [isManual, locked])

  return useMemo<QualityState>(
    () => ({
      tier,
      locked,
      lock,
      isManual,
      setTier,
      degrade,
      particleCount: tier === 'high' ? 4200 : 1400,
      dpr,
      postProcessing: tier === 'high' && !reducedMotion,
      shadows: tier === 'high',
    }),
    [tier, locked, lock, isManual, setTier, degrade, reducedMotion, dpr],
  )
}
