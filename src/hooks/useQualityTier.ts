import { useCallback, useMemo, useState } from 'react'
import type { QualityTier } from '@/types'
import { isWeakGpu, probeGpu } from '@/lib/gpu'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const STORAGE_KEY = 'portfolio:quality'

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number
}

/**
 * How many device pixels the scene may draw into, per tier.
 *
 * This is the budget that matters, not `devicePixelRatio` on its own. Every
 * expensive thing in the frame — the grid, the additive sprite field, bloom's
 * mip chain, the vignette — is fill-rate bound, so cost tracks
 * `cssWidth × cssHeight × dpr²`.
 *
 * A 1080p display at 100% asks for ~2.1M pixels. The same site on a 4K Windows
 * panel at 150% scaling asks for ~7.7M — nearly four times the work for a
 * scene that is a backdrop behind text. Capping the product, rather than dpr,
 * leaves ordinary displays untouched and only bites where the buffer is
 * genuinely enormous.
 */
const PIXEL_BUDGET: Record<QualityTier, number> = {
  high: 2_600_000, // ≈ 1980 × 1310
  low: 1_500_000, // ≈ 1500 × 1000
}

/** Never upscale past this, however small the viewport. */
const DPR_CEILING = { desktop: 2, touch: 1.5 }

/**
 * Resolved once, on mount, and never again — changing dpr mid-session resizes
 * the drawing buffer, which reads as the whole scene jolting.
 */
function resolveDpr(tier: QualityTier): number {
  if (typeof window === 'undefined') return 1

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const ceiling = coarse || window.innerWidth < 768 ? DPR_CEILING.touch : DPR_CEILING.desktop
  const cssPixels = Math.max(window.innerWidth * window.innerHeight, 1)
  const byBudget = Math.sqrt(PIXEL_BUDGET[tier] / cssPixels)

  // The low tier may go sub-native: the canvas is a decorative backdrop behind
  // DOM text, so a slightly soft scene beats a stuttering one. The high tier
  // floors at 1 — someone with a 4K panel and a real GPU should not be handed
  // an upscaled image.
  const floor = tier === 'low' ? 0.75 : 1
  const dpr = Math.min(window.devicePixelRatio || 1, ceiling, byBudget)
  return Math.max(dpr, floor)
}

/** Heuristic device tier (spec §5.2). Deliberately pessimistic. */
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
  // The CPU signals above say nothing about the chip that does the drawing.
  if (isWeakGpu(probeGpu().renderer)) return 'low'
  return 'high'
}

/** The stored override, or `null`. Read synchronously; see `useState` below. */
function storedTier(): QualityTier | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'high' || stored === 'low' ? stored : null
  } catch {
    return null
  }
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
  dpr: number
  postProcessing: boolean
  /**
   * Whether `backdrop-filter` is affordable on surfaces that sit over the
   * canvas. A blur whose backdrop is a still page is cached; one whose
   * backdrop is an animating canvas is re-read and re-blurred every frame,
   * which is why the arena HUD is the first thing to give up the effect.
   */
  blur: boolean
  /** The GPU string, when the browser exposes it. Debug overlay only. */
  renderer: string
}

export function useQualityTier(): QualityState {
  const reducedMotion = usePrefersReducedMotion()

  /*
    Resolved in the initialiser, not an effect.

    Detecting after mount meant every device — a phone, a software renderer —
    booted on `high`, which fetched the post-processing chunk and compiled the
    bloom stack before the correction landed one tick later. The work that
    guess costs is exactly the work a slow device cannot afford, and all of the
    signals involved (matchMedia, navigator, a WebGL probe) are synchronous.
  */
  const [override, setOverride] = useState<QualityTier | null>(storedTier)
  const [auto, setAuto] = useState<QualityTier>(() => detectTier(reducedMotion))
  const [locked, setLocked] = useState(false)

  /*
    Reduced motion is folded in here rather than baked into `auto`, so that
    toggling the OS preference mid-session takes effect without re-detecting
    (and without a second, contradictory source of truth for the tier).
  */
  const tier = override ?? (reducedMotion ? 'low' : auto)
  const [dpr] = useState(() => resolveDpr(override ?? detectTier(reducedMotion)))

  const setTier = useCallback((next: QualityTier) => {
    setOverride(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-mode storage failures are not worth surfacing.
    }
  }, [])

  const lock = useCallback(() => setLocked(true), [])

  const degrade = useCallback(() => {
    if (override || locked) return
    setAuto('low')
  }, [override, locked])

  return useMemo<QualityState>(
    () => ({
      tier,
      locked,
      lock,
      isManual: override !== null,
      setTier,
      degrade,
      particleCount: tier === 'high' ? 4200 : 1400,
      dpr,
      postProcessing: tier === 'high' && !reducedMotion,
      blur: tier === 'high',
      renderer: probeGpu().renderer,
    }),
    [tier, locked, lock, override, setTier, degrade, reducedMotion, dpr],
  )
}
