import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { profile } from '@/data'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'

/**
 * DOM half of the intro room. The 3D lives in `scene/DoorScene.tsx`; this is
 * the prompt, the name, and — importantly — the way out.
 *
 * The door is a gate in front of the whole portfolio, so it must never be the
 * only way through: E opens it, the prompt is a real button, and skipping is
 * always one click away.
 */
export function DoorRoom() {
  const { doorState, openDoor, skipDoor } = useWorld()
  const opening = doorState === 'opening'

  // E to open, matching the possession arena's verb. Enter and Space work too,
  // because the prompt is a focusable button.
  useEffect(() => {
    if (opening) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return
      if (e.code === 'KeyE') {
        e.preventDefault()
        openDoor()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opening, openDoor])

  // Lock scroll: there is nothing to scroll to yet.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <section
      id="door"
      aria-labelledby="door-heading"
      className="relative flex min-h-[100svh] flex-col items-center justify-between px-5 py-10 text-center"
    >
      <h1 id="door-heading" className="sr-only">
        {profile.name} — {profile.roles.join(' and ')}. Open the door to enter the portfolio.
      </h1>

      {/* Name, top. Fades as you walk through. */}
      <motion.div
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: opening ? 0.45 : 0.8, delay: opening ? 0 : 0.3 }}
        className="pointer-events-none pt-16"
      >
        <p className="font-display text-2xl font-bold tracking-[0.3em] text-fg/90 sm:text-3xl">
          {profile.name.toUpperCase()}
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
          {profile.roles.join(' · ')}
        </p>
      </motion.div>

      {/* Prompt, bottom. */}
      <motion.div
        animate={{ opacity: opening ? 0 : 1, y: opening ? 12 : 0 }}
        transition={{ duration: opening ? 0.3 : 0.6, delay: opening ? 0 : 0.9 }}
        className="flex flex-col items-center gap-4 pb-8"
      >
        <button
          type="button"
          onClick={openDoor}
          disabled={opening}
          className={cn(
            'flex min-h-[56px] items-center gap-3 rounded-world border border-fg/25 bg-fg/5 px-6',
            'backdrop-blur-sm transition-colors hover:border-fg/60 hover:bg-fg/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2',
            'focus-visible:ring-offset-bg disabled:pointer-events-none',
          )}
        >
          <kbd className="rounded border border-fg/40 bg-fg/10 px-2.5 py-1 font-mono text-sm font-bold text-fg">
            E
          </kbd>
          <span className="font-display text-base font-semibold text-fg">Open the door</span>
        </button>

        <button
          type="button"
          onClick={skipDoor}
          className="min-h-[44px] font-mono text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg"
        >
          Skip intro
        </button>
      </motion.div>
    </section>
  )
}
