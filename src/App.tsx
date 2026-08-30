import { lazy, Suspense, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { WorldProvider, useWorld, WORLD_TRANSITION_MS } from '@/lib/world-context'
import { HubProvider } from '@/lib/hub-context'
import type { World } from '@/types'
import { useIsWebglSupported } from '@/hooks/useIsWebglSupported'
import { NavBar } from '@/components/NavBar'
import { FpsOverlay } from '@/components/FpsOverlay'
import { NoWebglNotice } from '@/components/NoWebglNotice'
import { GameWorld } from '@/worlds/GameWorld'
import { EngineerWorld } from '@/worlds/EngineerWorld'
import { Landing } from '@/components/Landing'
import { DoorRoom } from '@/components/DoorRoom'
import { Footer } from '@/components/Footer'

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
type Layer = World | 'landing' | 'door'

function WorldLayer({ layer }: { layer: Layer }) {
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
      {layer === 'door' ? (
        <DoorRoom />
      ) : layer === 'landing' ? (
        <>
          <Landing />
          <Footer />
        </>
      ) : layer === 'game' ? (
        <GameWorld />
      ) : (
        <EngineerWorld />
      )}
    </motion.div>
  )
}

function WorldStage() {
  const { world, stage } = useWorld()
  const layer: Layer = stage === 'world' ? world : stage

  return (
    <main id="main" className="relative">
      {/*
        `mode="wait"` would blank the page mid-switch; overlapping the layers
        keeps the DOM crossfade in step with the 3D one (spec §4.2).
      */}
      <AnimatePresence initial={false}>
        <WorldLayer key={layer} layer={layer} />
      </AnimatePresence>
    </main>
  )
}

function Shell() {
  const webgl = useIsWebglSupported()
  const { stage } = useWorld()

  // No background on the wrapper on purpose: an opaque background here would
  // paint over the fixed canvas, which sits at a negative z-index. The page
  // background lives on <body> in styles/globals.css.
  return (
    <div className="relative min-h-screen text-fg">
      {/*
        Lives here rather than in `NavBar`, which returns null in the door room
        and on the landing (that stage renders its own window chrome). A skip
        link that disappears on two of the three stages is worse than none.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-world focus:bg-accent focus:px-4 focus:py-3 focus:font-display focus:text-bg"
      >
        Skip to content
      </a>

      {/* `null` means "still detecting" — render nothing rather than flash. */}
      {webgl === true && (
        <Suspense fallback={null}>
          <SceneContainer />
        </Suspense>
      )}
      {webgl === false && <NoWebglNotice />}

      {/*
        Readability scrim — worlds only. Inside a world the 3D scene is bright
        and busy and all body copy sits on top of it, so without this the text
        drops under the 4.5:1 contrast floor (spec §8).

        It must NOT apply to the door room or the landing: the door room has no
        body copy over the scene and the scrim was washing the white door out to
        grey, and the landing draws no 3D at all, so the scrim only muted its
        gradients.
      */}
      {stage === 'world' && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[4] bg-bg/60" />
      )}

      <NavBar />
      <WorldStage />
      <FpsOverlay />
    </div>
  )
}

export default function App() {
  return (
    <WorldProvider>
      {/* Above <Canvas> so both the scene and the DOM overlay share hub state. */}
      <HubProvider>
        <Shell />
      </HubProvider>
    </WorldProvider>
  )
}
