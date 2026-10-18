import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The site's frame: one Windows XP window in Cyberpunk 2077 colours. Title
 * bar, menu bar, body and status bar.
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

          <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bg sm:text-xs">
            {title}
            {subtitle && <span className="hidden opacity-70 sm:inline"> — {subtitle}</span>}
          </span>

          {/*
            Minimise / maximise / close. Ornament, not controls — there is no
            window to minimise and nothing sane for "close" to do on a portfolio
            landing. They are inert spans rather than disabled buttons so they
            never take focus and never appear in the accessibility tree.
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

      <div>{children}</div>

      <div className="xp-bevel-in border-x-0 border-b-0 bg-surfaceAlt">{status}</div>
    </div>
  )
}
