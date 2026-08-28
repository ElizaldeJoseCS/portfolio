/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { QualityTier, Stage, Theme, World } from '@/types'
import { applyThemeVars, otherWorld, themes } from './theme'
import { useQualityTier, type QualityState } from '@/hooks/useQualityTier'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const WORLD_STORAGE_KEY = 'portfolio:world'
/** Must stay in step with the crossfade duration in SceneContainer (spec §13). */
export const WORLD_TRANSITION_MS = 400

interface WorldContextValue {
  /** 'landing' until the visitor picks a world. */
  stage: Stage
  /** The world they are in, or would enter. Meaningless while on the landing. */
  world: World
  /** Landing theme while on the landing, otherwise the world's theme. */
  theme: Theme
  /** The world the switcher would take you to. */
  next: World
  nextTheme: Theme
  setWorld: (w: World) => void
  toggleWorld: () => void
  /** Leaves the landing for a world. */
  enterWorld: (w: World) => void
  /** Returns to the landing hub. */
  goToLanding: () => void
  /** True for the duration of the crossfade; drives the transition-only effects. */
  isTransitioning: boolean
  reducedMotion: boolean
  quality: QualityState
}

const WorldContext = createContext<WorldContextValue | null>(null)

export function WorldProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion()
  const quality = useQualityTier()
  const [world, setWorldState] = useState<World>('game')
  // Everyone starts on the landing, including returning visitors — the choice
  // between worlds is the point of the front door.
  const [stage, setStage] = useState<Stage>('landing')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // A stored world only pre-selects which door is highlighted; it never skips
  // the landing.
  useEffect(() => {
    const stored = window.localStorage.getItem(WORLD_STORAGE_KEY)
    if (stored === 'game' || stored === 'engineer') setWorldState(stored)
  }, [])

  const setWorld = useCallback((next: World) => {
    setWorldState((prev) => {
      if (prev === next) return prev
      setIsTransitioning(true)
      try {
        window.localStorage.setItem(WORLD_STORAGE_KEY, next)
      } catch {
        // Ignore storage failures — the world still switches.
      }
      return next
    })
  }, [])

  const toggleWorld = useCallback(
    () => setWorld(world === 'game' ? 'engineer' : 'game'),
    [setWorld, world],
  )

  const enterWorld = useCallback(
    (next: World) => {
      setIsTransitioning(true)
      setStage('world')
      setWorldState(next)
      try {
        window.localStorage.setItem(WORLD_STORAGE_KEY, next)
      } catch {
        // Ignore storage failures — entering still works.
      }
    },
    [],
  )

  const goToLanding = useCallback(() => {
    setIsTransitioning(true)
    setStage('landing')
  }, [])

  // Push tokens to :root, and clear the transition flag once the crossfade ends.
  useEffect(() => {
    applyThemeVars(stage === 'landing' ? themes.landing : themes[world])
    if (!isTransitioning) return
    const t = window.setTimeout(() => setIsTransitioning(false), WORLD_TRANSITION_MS)
    return () => window.clearTimeout(t)
  }, [world, stage, isTransitioning])

  const value = useMemo<WorldContextValue>(() => {
    const next = otherWorld(world)
    return {
      stage,
      world,
      theme: stage === 'landing' ? themes.landing : themes[world],
      next,
      nextTheme: themes[next],
      setWorld,
      toggleWorld,
      enterWorld,
      goToLanding,
      isTransitioning,
      reducedMotion,
      quality,
    }
  }, [
    stage,
    world,
    setWorld,
    toggleWorld,
    enterWorld,
    goToLanding,
    isTransitioning,
    reducedMotion,
    quality,
  ])

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
}

function useWorldContext(): WorldContextValue {
  const ctx = useContext(WorldContext)
  if (!ctx) throw new Error('useTheme/useWorld must be used inside <WorldProvider>')
  return ctx
}

/** Primary hook for DOM components — tokens, never raw world checks. */
export function useTheme(): Theme {
  return useWorldContext().theme
}

/** Full world state, for the switcher, the scenes, and layout-level branching. */
export function useWorld(): WorldContextValue {
  return useWorldContext()
}

/** Convenience for motion props that must collapse under reduced motion. */
export function useMotionSpring() {
  const { theme, reducedMotion } = useWorldContext()
  return reducedMotion ? { duration: 0.001 } : theme.motionSpring
}

export type { QualityTier }
