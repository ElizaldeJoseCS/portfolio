import { lazy, Suspense, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { WorldProvider, useWorld, WORLD_TRANSITION_MS } from '@/lib/world-context'
import type { World } from '@/types'
import { useIsWebglSupported } from '@/hooks/useIsWebglSupported'
import { NavBar } from '@/components/NavBar'
import { FpsOverlay } from '@/components/FpsOverlay'
import { NoWebglNotice } from '@/components/NoWebglNotice'
import { GameWorld } from '@/worlds/GameWorld'
import { EngineerWorld } from '@/worlds/EngineerWorld'

// three.js + drei are ~150kB gzipped on their own; keep them off the critical
// path so the DOM content paints first (spec §10).
const SceneContainer = lazy(() =>
  import('@/scene/SceneContainer').then((m) => ({ default: m.SceneContainer })),
)

/**
 * One world layer. While the outgoing world fades it stays mounted on top of
 * the incoming one, so it is taken out of flow and made `inert`: without that,
 * the page briefly holds two `#projects` anchors and two copies of every
 * heading for screen readers.
 *
 * Positioning is applied through `style`, never through `exit` — animating
 * `top`/`position` from `auto` leaves the exit animation permanently pending
 * and the layer never unmounts.
 */
function WorldLayer({ world }: { world: World }) {
  const { reducedMotion } = useWorld()
  const isPresent = useIsPresent()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) el.inert = !isPresent
  }, [isPresent])

  return (
    <motion.div
      ref={ref}
      aria-hidden={isPresent ? undefined : true}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      // A plain tween keeps the crossfade pinned to WORLD_TRANSITION_MS, which
      // is the same budget the 3D scene fade uses (spec §13: ~400ms).
      transition={{
        duration: reducedMotion ? 0.001 : WORLD_TRANSITION_MS / 1000,
        ease: 'easeInOut',
      }}
      style={
        isPresent ? undefined : { position: 'absolute', top: 0, left: 0, right: 0 }
      }
      className={isPresent ? undefined : 'pointer-events-none'}
    >
      {world === 'game' ? <GameWorld /> : <EngineerWorld />}
    </motion.div>
  )
}

function WorldStage() {
  const { world } = useWorld()

  return (
    <main id="main" className="relative">
      {/*
        `mode="wait"` would blank the page mid-switch; overlapping the two
        layouts keeps the DOM crossfade in step with the 3D one (spec §4.2).
      */}
      <AnimatePresence initial={false}>
        <WorldLayer key={world} world={world} />
      </AnimatePresence>
    </main>
  )
}

function Shell() {
  const webgl = useIsWebglSupported()

  // No background on the wrapper on purpose: an opaque background here would
  // paint over the fixed canvas, which sits at a negative z-index. The page
  // background lives on <body> in styles/globals.css.
  return (
    <div className="relative min-h-screen text-fg">
      {/* `null` means "still detecting" — render nothing rather than flash. */}
      {webgl === true && (
        <Suspense fallback={null}>
          <SceneContainer />
        </Suspense>
      )}
      {webgl === false && <NoWebglNotice />}

      {/*
        Readability scrim. The 3D scene is bright and busy by design, and all
        body copy sits directly on top of it — without this the text drops well
        under the 4.5:1 contrast floor (spec §8).
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[4] bg-bg/60"
      />

      <NavBar />
      <WorldStage />
      <FpsOverlay />
    </div>
  )
}

export default function App() {
  return (
    <WorldProvider>
      <Shell />
    </WorldProvider>
  )
}
