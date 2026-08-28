/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { QualityTier, Theme, World } from '@/types'
import { applyThemeVars, otherWorld, themes } from './theme'
import { useQualityTier, type QualityState } from '@/hooks/useQualityTier'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const WORLD_STORAGE_KEY = 'portfolio:world'
/** Must stay in step with the crossfade duration in SceneContainer (spec §13). */
export const WORLD_TRANSITION_MS = 400

interface WorldContextValue {
  world: World
  theme: Theme
  /** The world the switcher would take you to. */
  next: World
  nextTheme: Theme
  setWorld: (w: World) => void
  toggleWorld: () => void
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
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Restore the visitor's last world after mount (keeps first paint static).
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

  // Push tokens to :root, and clear the transition flag once the crossfade ends.
  useEffect(() => {
    applyThemeVars(themes[world])
    if (!isTransitioning) return
    const t = window.setTimeout(() => setIsTransitioning(false), WORLD_TRANSITION_MS)
    return () => window.clearTimeout(t)
  }, [world, isTransitioning])

  const value = useMemo<WorldContextValue>(() => {
    const next = otherWorld(world)
    return {
      world,
      theme: themes[world],
      next,
      nextTheme: themes[next],
      setWorld,
      toggleWorld,
      isTransitioning,
      reducedMotion,
      quality,
    }
  }, [world, setWorld, toggleWorld, isTransitioning, reducedMotion, quality])

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
