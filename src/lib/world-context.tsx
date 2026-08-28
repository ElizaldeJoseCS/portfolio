/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { DoorState, QualityTier, Stage, Theme, World } from '@/types'
import { applyThemeVars, otherWorld, themes } from './theme'
import { useQualityTier, type QualityState } from '@/hooks/useQualityTier'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const WORLD_STORAGE_KEY = 'portfolio:world'
const ENTERED_KEY = 'portfolio:entered'
/** Door swing + walk-through. Kept short; it sits in front of the content. */
export const DOOR_SEQUENCE_MS = 1700

/**
 * Whether to play the door intro at all. Checked synchronously in a state
 * initialiser so the door never flashes for someone who should skip it.
 */
function shouldShowDoor(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (window.sessionStorage.getItem(ENTERED_KEY) === '1') return false
  } catch {
    // Storage blocked; fall through and decide on the other signals.
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // A dark room with a door is pointless without WebGL to draw it.
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as
      | WebGLRenderingContext
      | null
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    return false
  }
  return true
}
/** Must stay in step with the crossfade duration in SceneContainer (spec §13). */
export const WORLD_TRANSITION_MS = 400

interface WorldContextValue {
  /** 'door' → 'landing' → 'world'. */
  stage: Stage
  doorState: DoorState
  /** Plays the door sequence, then lands. */
  openDoor: () => void
  /** Jumps straight to the landing, skipping the intro. */
  skipDoor: () => void
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
  // First visit of a session opens on the door room; everyone else lands.
  const [stage, setStage] = useState<Stage>(() => (shouldShowDoor() ? 'door' : 'landing'))
  const [doorState, setDoorState] = useState<DoorState>('closed')
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

  const markEntered = useCallback(() => {
    try {
      window.sessionStorage.setItem(ENTERED_KEY, '1')
    } catch {
      // Nothing to do; the intro simply plays again next time.
    }
  }, [])

  const skipDoor = useCallback(() => {
    markEntered()
    setDoorState('done')
    setIsTransitioning(true)
    setStage('landing')
  }, [markEntered])

  const openDoor = useCallback(() => {
    setDoorState((prev) => (prev === 'closed' ? 'opening' : prev))
  }, [])

  // The scene animates the swing and the walk-through; this just lands the
  // visitor when it is over.
  useEffect(() => {
    if (doorState !== 'opening') return
    const t = window.setTimeout(() => {
      markEntered()
      setDoorState('done')
      setIsTransitioning(true)
      setStage('landing')
    }, DOOR_SEQUENCE_MS)
    return () => window.clearTimeout(t)
  }, [doorState, markEntered])

  // Push tokens to :root, and clear the transition flag once the crossfade ends.
  useEffect(() => {
    applyThemeVars(stage === 'world' ? themes[world] : themes.landing)
    if (!isTransitioning) return
    const t = window.setTimeout(() => setIsTransitioning(false), WORLD_TRANSITION_MS)
    return () => window.clearTimeout(t)
  }, [world, stage, isTransitioning])

  const value = useMemo<WorldContextValue>(() => {
    const next = otherWorld(world)
    return {
      stage,
      doorState,
      openDoor,
      skipDoor,
      world,
      theme: stage === 'world' ? themes[world] : themes.landing,
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
    doorState,
    openDoor,
    skipDoor,
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
