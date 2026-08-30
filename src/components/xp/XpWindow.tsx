import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * The landing's frame: one Windows XP window, painted in Cyberpunk 2077.
 *
 * The geometry is Luna's — gradient title bar, bevelled edges, a menu bar, a
 * status bar along the bottom — and everything inside it is 2077's: hazard
 * yellow, a cyan scanline wash, clipped corners. The two agree more than they
 * look like they should, because both are fundamentally *chrome-forward*: XP
 * frames its content in visible machinery, and so does 2077's HUD.
 *
 * The title bar and menu bar stick to the top of the viewport, which is why
 * `NavBar` renders nothing on the landing — this is the navigation now, and
 * stacking a second bar above it was three rows of chrome before any content.
 */
export function XpWindow({
  title,
  subtitle,
  menu,
  status,
  children,
}: {
  title: string
  /** Shown after the title in the bar, the way XP appended a document name. */
  subtitle?: string
  menu: ReactNode
  status: ReactNode
  children: ReactNode
}) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className="xp-bevel bg-surface">
      {/*
        Sticky as one unit. Splitting them so only the menu bar stuck left the
        title bar scrolling away and the menu bar landing against the content
        with no top edge, which read as a rendering bug.
      */}
      <div className="sticky top-0 z-40">
        <div className="xp-titlebar relative flex items-center gap-2 px-2 py-1.5 sm:px-3">
          {/* The window icon. XP put one here; this is the monogram plate. */}
          <span
            aria-hidden="true"
            className="grid h-6 w-6 shrink-0 place-items-center border border-bg/40 bg-bg/80 font-display text-[10px] font-bold tracking-tight text-accent"
          >
            JE
          </span>

          <span className="relative min-w-0 flex-1 truncate font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bg sm:text-xs">
            {title}
            {subtitle && <span className="hidden opacity-70 sm:inline"> — {subtitle}</span>}
            {/*
              Two colour ghosts of the same string, offset on a rare cycle. They
              are aria-hidden duplicates of text that is already in the DOM, so
              nothing is announced twice.
            */}
            {!reducedMotion && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 truncate text-accentAlt mix-blend-screen"
                  style={{ animation: 'xp-glitch 7s steps(1) infinite' }}
                >
                  {title}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 truncate text-fg mix-blend-difference"
                  style={{ animation: 'xp-glitch 7s steps(1) 0.06s infinite' }}
                >
                  {title}
                </span>
              </>
            )}
          </span>

          {/*
            Minimise / maximise / close. Ornament, not controls — there is no
            window to minimise and nothing sane for "close" to do on a portfolio
            landing. They are inert spans rather than disabled buttons so they
            never take focus and never appear in the accessibility tree, exactly
            like the traffic lights on the Engineer console's terminal.
          */}
          <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
            {['–', '□', '✕'].map((glyph, i) => (
              <span
                key={glyph}
                className={cn(
                  'grid h-5 w-5 place-items-center border border-bg/50 font-mono text-[10px] leading-none text-bg',
                  i === 2 ? 'bg-bg/25' : 'bg-bg/10',
                )}
              >
                {glyph}
              </span>
            ))}
          </span>
        </div>

        {/* The tell. XP had a plain 1px border here. */}
        <div aria-hidden="true" className="xp-hazard h-1.5 opacity-90" />

        <div className="border-b-2 border-bg bg-surfaceAlt">{menu}</div>
      </div>

      {/*
        `relative` is load-bearing: the scanline wash is an ::after pinned to
        this box. `isolate` keeps the title bar's mix-blend ghosts from
        compositing against the page background behind the window.
      */}
      <div className="xp-scanlines relative isolate">{children}</div>

      <div className="xp-bevel-in border-x-0 border-b-0 bg-surfaceAlt">{status}</div>
    </div>
  )
}
