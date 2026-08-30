import { AnimatePresence, motion } from 'framer-motion'
import { useHub } from '@/lib/hub-context'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'

/**
 * The arena's game UI: controls, the interact prompt, and a discovery counter.
 * It sits above the canvas but is deliberately thin — every piece of content it
 * points at is real DOM in the shell panel, not baked into the scene.
 */
export function GameHud({ onExitArena }: { onExitArena: () => void }) {
  const { shells, nearbyId, possessedId, possess, discovered, allFound } = useHub()
  const { reducedMotion, quality } = useWorld()

  /*
    The HUD is the one place in the site where a `backdrop-filter` sits over a
    canvas that repaints every frame. A blur whose backdrop is a static page is
    rasterised once and cached; this one cannot be, so the compositor re-reads
    and re-blurs three regions every frame for as long as the arena is up. It
    is the cheapest thing to give back on a weak GPU, and a more opaque plate
    reads almost identically over a dark scene.
  */
  const plate = quality.blur ? 'bg-bg/80 backdrop-blur-md' : 'bg-bg/95'

  const nearby = shells.find((s) => s.id === nearbyId) ?? null
  const showPrompt = nearby !== null && possessedId === null

  return (
    <>
      {/* Controls, top-left under the nav. */}
      <div className="pointer-events-none fixed left-4 top-20 z-30 max-w-[15rem] sm:left-6 md:top-24">
        <div
          className={cn(
            'pointer-events-auto rounded-world border border-line/70 p-3 text-left',
            plate,
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Controls</p>
          <dl className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed">
            <div className="flex gap-2">
              <dt className="text-fg">WASD / ↑↓←→</dt>
              <dd className="text-muted">move</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-fg">drag</dt>
              <dd className="text-muted">steer</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-fg">E</dt>
              <dd className="text-muted">possess a shell</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-fg">Esc</dt>
              <dd className="text-muted">let go</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onExitArena}
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-line/70 px-2 font-mono text-[11px] text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Read as a list instead
          </button>
        </div>
      </div>

      {/* Discovery counter, top-right. */}
      <div className="pointer-events-none fixed right-4 top-20 z-30 sm:right-6 md:top-24">
        <div className={cn('rounded-world border border-line/70 px-3 py-2 text-right', plate)}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Shells</p>
          <p className="font-display text-2xl font-bold leading-none text-fg" aria-live="polite">
            {discovered.size}
            <span className="text-muted">/{shells.length}</span>
            <span className="sr-only"> shells possessed</span>
          </p>
          {allFound && (
            <p className="mt-1 font-mono text-[10px] text-accentAlt">all shells taken</p>
          )}
        </div>
      </div>

      {/* Interact prompt. Also a button, so it works without a keyboard. */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            key={nearby.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: reducedMotion ? 0.001 : 0.18 }}
            className="fixed inset-x-0 bottom-8 z-30 mx-auto flex w-fit max-w-[92vw] justify-center px-4"
          >
            <button
              type="button"
              onClick={() => possess(nearby.id)}
              className={cn(
                'flex min-h-[56px] items-center gap-3 rounded-world border border-accent/70 px-5',
                quality.blur ? 'bg-bg/90 backdrop-blur-md' : 'bg-bg/95',
                'shadow-glow transition-colors hover:bg-surface',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              )}
            >
              <kbd className="rounded border border-accent/70 bg-accent/15 px-2 py-1 font-mono text-sm font-bold text-accent">
                E
              </kbd>
              <span className="text-left">
                <span className="block font-display text-base font-bold leading-tight text-fg">
                  Possess {nearby.label}
                </span>
                <span className="block font-mono text-[11px] text-muted">{nearby.subtitle}</span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
