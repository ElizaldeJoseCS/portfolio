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
  /** True when the user picked the tier by hand; auto-degrade then stops. */
  isManual: boolean
  setTier: (tier: QualityTier) => void
  /** Called by drei's PerformanceMonitor when sustained FPS drops. */
  degrade: () => void
  restore: () => void
  /** Derived budgets consumed by the scenes. */
  particleCount: number
  dpr: [number, number]
  postProcessing: boolean
  shadows: boolean
}

export function useQualityTier(): QualityState {
  const reducedMotion = usePrefersReducedMotion()
  const [isManual, setIsManual] = useState(false)
  const [tier, setTierState] = useState<QualityTier>('high')

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

  const degrade = useCallback(() => {
    setTierState((prev) => (isManual ? prev : 'low'))
  }, [isManual])

  const restore = useCallback(() => {
    setTierState((prev) => (isManual ? prev : detectTier(reducedMotion) === 'high' ? 'high' : prev))
  }, [isManual, reducedMotion])

  return useMemo<QualityState>(
    () => ({
      tier,
      isManual,
      setTier,
      degrade,
      restore,
      particleCount: tier === 'high' ? 4200 : 1400,
      dpr: tier === 'high' ? [1, 2] : [1, 1.4],
      postProcessing: tier === 'high' && !reducedMotion,
      shadows: tier === 'high',
    }),
    [tier, isManual, setTier, degrade, restore, reducedMotion],
  )
}
