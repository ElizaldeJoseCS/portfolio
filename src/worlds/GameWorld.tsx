import { useEffect, useState } from 'react'
import { Footer } from '@/components/Footer'
import { GameHud } from '@/components/GameHud'
import { ShellPanel } from '@/components/ShellPanel'
import { useWorld } from '@/lib/world-context'
import { useHub } from '@/lib/hub-context'
import { cn } from '@/lib/cn'
import { useIsWebglSupported } from '@/hooks/useIsWebglSupported'
import { useIsTouch } from '@/hooks/useIsMobile'
import { WorldSections, type SectionKey } from './sharedWorldSections'

const ORDER: readonly SectionKey[] = ['hero', 'projects', 'skills', 'experience', 'about', 'contact']

type Mode = 'arena' | 'list'

/**
 * Game World.
 *
 * Two ways to read the same content:
 *
 * - **arena** — the possession hub. You drive a shell-less rover around the
 *   grid and press E to take over the shells holding each piece of the
 *   portfolio. This is the Shellscape mechanic, and it is the default on
 *   pointer devices.
 * - **list** — the scrolling page. The fallback whenever driving would be a
 *   barrier (touch, reduced motion, no WebGL) and always reachable by choice.
 *
 * Both read the same `src/data`; neither hides content the other shows.
 */
export function GameWorld() {
  const { reducedMotion } = useWorld()
  const webgl = useIsWebglSupported()
  const isTouch = useIsTouch()
  const [mode, setMode] = useState<Mode>('list')
  const [chosen, setChosen] = useState(false)

  // Pick a default once detection settles, but never override a explicit choice.
  useEffect(() => {
    if (chosen || webgl === null) return
    const drivable = webgl === true && !reducedMotion && !isTouch
    setMode(drivable ? 'arena' : 'list')
  }, [chosen, webgl, reducedMotion, isTouch])

  const choose = (next: Mode) => {
    setChosen(true)
    setMode(next)
  }

  return (
    <div className="relative" data-world="game">
      {/* Decorative CRT wash. Kept behind content and out of the a11y tree. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5] opacity-[0.07] [background-image:repeating-linear-gradient(0deg,rgb(var(--c-accent)/0.6)_0px,rgb(var(--c-accent)/0.6)_1px,transparent_1px,transparent_3px)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--c-accent)/0.18),transparent_55%),radial-gradient(ellipse_at_20%_100%,rgb(var(--c-accent-alt)/0.14),transparent_50%)]"
      />

      {mode === 'arena' ? (
        <ArenaView onExit={() => choose('list')} />
      ) : (
        <>
          {webgl === true && !reducedMotion && (
            <EnterArenaBanner onEnter={() => choose('arena')} touch={isTouch} />
          )}
          <WorldSections order={ORDER} />
          <Footer />
        </>
      )}
    </div>
  )
}

/**
 * The arena is a viewport-height stage over the canvas rather than a scrolling
 * document — scrolling while driving would fight the controls.
 */
function ArenaView({ onExit }: { onExit: () => void }) {
  const { setArenaActive, hasMoved } = useHub()

  // The 3D scene lives in the shared <Canvas>; this is only the overlay.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setArenaActive(true)
    return () => {
      document.body.style.overflow = prev
      setArenaActive(false)
    }
  }, [setArenaActive])

  return (
    <section
      id="arena"
      aria-labelledby="arena-heading"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 text-center"
    >
      <h2 id="arena-heading" className="sr-only">
        Possession arena — drive to a shell and press E to read it
      </h2>

      {/* Explains the verb, then gets out of the way once they are driving. */}
      <div
        className={cn(
          'pointer-events-none max-w-md transition-opacity duration-700',
          hasMoved ? 'opacity-0' : 'opacity-100',
        )}
      >
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          You have no shell
        </p>
        <p className="mt-4 text-balance text-lg leading-relaxed text-fg/85">
          Drive out to a shell and take it over. Each one holds a piece of my game work.
        </p>
        <p className="mt-3 font-mono text-xs text-muted">
          WASD or arrow keys to move · E to possess
        </p>
      </div>

      <GameHud onExitArena={onExit} />
      <ShellPanel />
    </section>
  )
}

function EnterArenaBanner({ onEnter, touch }: { onEnter: () => void; touch: boolean }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8">
      <div className="flex flex-col gap-4 rounded-world border border-accent/40 bg-surface/70 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
            Optional
          </p>
          <p className="mt-2 text-sm leading-relaxed text-fg/85">
            This world has a playable version: drive a shell-less rover around an arena and press{' '}
            <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-xs">E</kbd> to
            possess the shells holding each project.
            {touch && ' Best with a keyboard — on touch you steer by dragging.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onEnter}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-world bg-accent px-5 font-display text-sm font-semibold text-bg shadow-glow transition-colors hover:bg-accentAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Enter the arena
        </button>
      </div>
    </div>
  )
}
