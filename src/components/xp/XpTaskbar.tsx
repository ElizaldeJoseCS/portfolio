import { useEffect, useState } from 'react'
import { useWorld } from '@/lib/world-context'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/cn'
import type { World } from '@/types'

const TASKS: { world: World; label: string }[] = [
  { world: 'game', label: 'game_world.exe' },
  { world: 'engineer', label: 'engineer_world.exe' },
]

/**
 * The taskbar. Fixed to the bottom of the viewport for the whole landing.
 *
 * It is not decoration: it is the landing's persistent way into the two
 * worlds, and it replaces the "Two worlds to explore — pick one ↓" link the
 * old landing needed because its doors were below the fold. A taskbar is
 * exactly the right metaphor for "these two things are always running and you
 * can switch to either one".
 *
 * Start is the only genuinely XP-shaped joke here, and it still does something
 * real — it jumps to the worlds section, which is what a start button is for.
 */
export function XpTaskbar() {
  const { enterWorld } = useWorld()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div aria-hidden="true" className="xp-hazard h-1.5 opacity-80" />
      <div className="xp-bevel flex items-center gap-1 border-x-0 border-b-0 bg-surfaceAlt px-1.5 py-1 sm:gap-2 sm:px-2">
        <a
          href="#worlds"
          className={cn(
            'xp-notch inline-flex min-h-[44px] shrink-0 items-center gap-1.5 bg-accent px-3 sm:px-4',
            'font-display text-sm font-bold italic tracking-wide text-bg',
            'transition-colors hover:bg-accentAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg',
          )}
        >
          <span aria-hidden="true" className="text-base not-italic">
            ▚
          </span>
          start
        </a>

        <div aria-hidden="true" className="h-7 w-px shrink-0 bg-line/60" />

        {/*
          The two worlds as running tasks. `overflow-x-auto` rather than wrap:
          a taskbar that grows to two rows on a phone stops being a taskbar,
          and these are the only two buttons that will ever be in it.
        */}
        <nav aria-label="Enter a world" className="min-w-0 flex-1">
          <ul className="flex min-w-0 gap-1 overflow-x-auto sm:gap-2">
            {TASKS.map((task) => (
              <li key={task.world} className="min-w-0">
                <button
                  type="button"
                  onClick={() => enterWorld(task.world)}
                  className={cn(
                    'xp-bevel inline-flex min-h-[44px] w-full items-center gap-2 bg-surface px-2 sm:px-3',
                    'font-mono text-[11px] text-fg/85 transition-colors',
                    'hover:border-accent/60 hover:bg-accent/15 hover:text-accent',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-2 w-2 shrink-0 bg-accentAlt',
                      !reducedMotion && 'animate-blink',
                    )}
                  />
                  <span className="truncate">{task.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* System tray. */}
        <div className="xp-bevel-in hidden shrink-0 items-center gap-2 bg-bg/60 px-3 py-1 sm:flex">
          <span aria-hidden="true" className="font-mono text-[11px] text-accentAlt">
            ◈
          </span>
          <TrayClock />
        </div>
      </div>
    </div>
  )
}

/**
 * The tray clock, ticking on the minute.
 *
 * It renders empty on the first paint and fills in from an effect, because a
 * clock rendered during the initial render is wrong the moment the tab has
 * been open for a minute, and because the static HTML fallback in index.html
 * would otherwise ship a baked-in time.
 */
function TrayClock() {
  const [now, setNow] = useState<string>('')

  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  if (!now) return null
  // A clock that announces itself every minute is a screen-reader nuisance and
  // nobody navigates by it.
  return (
    <span aria-hidden="true" className="font-mono text-[11px] tabular-nums text-fg/80">
      {now}
    </span>
  )
}
