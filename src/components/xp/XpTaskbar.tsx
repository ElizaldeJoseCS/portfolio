import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { profile } from '@/data'
import { PAGES } from '@/lib/nav'
import { cn } from '@/lib/cn'
import { SocialIcon } from '../ui'

/**
 * The taskbar, fixed to the bottom of every page.
 *
 * Start opens a real menu of every page plus the off-site links — which makes
 * it the whole navigation on a narrow screen, where the menu bar wraps to two
 * rows and stops being scannable. Beside it is XP's Quick Launch strip, and
 * the tray clock on the right.
 *
 * None of it is ornament: Start is the mobile nav, Quick Launch is the fastest
 * path to the resumes, and between them they mean no page needs its own set of
 * "where to next" links at the bottom.
 */
export function XpTaskbar() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()

  // A route change means the visitor picked something; the menu has done its job.
  useEffect(() => setOpen(false), [pathname])

  // Escape closes and returns focus to Start; a click outside just closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      startRef.current?.focus()
    }
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const quickLaunch = profile.socials.filter((s) => s.icon === 'github' || s.icon === 'linkedin')

  return (
    <div ref={rootRef} className="fixed inset-x-0 bottom-0 z-50">
      {open && <StartMenu id={menuId} />}

      <div aria-hidden="true" className="xp-hazard h-1.5 opacity-80" />
      <div className="xp-bevel flex items-center gap-1.5 border-x-0 border-b-0 bg-surfaceAlt px-1.5 py-1 sm:gap-2 sm:px-2">
        <button
          ref={startRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'xp-notch inline-flex min-h-[44px] shrink-0 items-center gap-1.5 px-3 sm:px-4',
            'font-display text-sm font-bold italic tracking-wide text-bg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg',
            open ? 'bg-accentAlt' : 'bg-accent hover:bg-accentAlt',
          )}
        >
          <span aria-hidden="true" className="text-base not-italic">
            ▚
          </span>
          start
        </button>

        <div aria-hidden="true" className="h-7 w-px shrink-0 bg-line/60" />

        {/* Quick Launch. Icon-only, so each carries its own accessible name. */}
        <nav aria-label="Quick links" className="min-w-0">
          <ul className="flex items-center gap-1">
            {profile.resumes?.map((resume) => (
              <li key={resume.url}>
                <a
                  href={resume.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="xp-bevel inline-flex h-11 items-center gap-2 bg-surface px-2.5 font-mono text-[11px] text-fg/85 transition-colors hover:border-accent/60 hover:bg-accent/15 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-3"
                >
                  <span aria-hidden="true">▤</span>
                  <span aria-hidden="true" className="hidden xs:inline">
                    {resume.url.split('/').pop()}
                  </span>
                  <span className="sr-only">{resume.label}, PDF (opens in a new tab)</span>
                </a>
              </li>
            ))}
            {quickLaunch.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  aria-label={`${social.label} (opens in a new tab)`}
                  title={social.label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="xp-bevel inline-flex h-11 w-11 items-center justify-center bg-surface text-fg/85 transition-colors hover:border-accent/60 hover:bg-accent/15 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <SocialIcon name={social.icon} className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto" />

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

/** The Start menu panel. Rendered above the bar, anchored to its left edge. */
function StartMenu({ id }: { id: string }) {
  return (
    <div
      id={id}
      className="xp-bevel absolute bottom-full left-1.5 mb-1.5 w-[16rem] bg-surfaceAlt sm:left-2"
    >
      <p className="xp-titlebar px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bg">
        {profile.name}
      </p>
      <nav aria-label="All pages">
        <ul className="p-1">
          {PAGES.map((page) => (
            <li key={page.path}>
              <Link
                to={page.path}
                className="flex min-h-[44px] items-center gap-2.5 px-2 font-body text-sm text-fg/90 transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span aria-hidden="true" className="w-4 text-center text-accentAlt">
                  ▸
                </span>
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div aria-hidden="true" className="mx-2 border-t border-line/50" />
      <nav aria-label="Elsewhere">
        <ul className="p-1">
          {profile.socials.map((social) => (
            <li key={social.url}>
              <a
                href={social.url}
                {...(social.url.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noreferrer noopener' })}
                className="flex min-h-[44px] items-center gap-2.5 px-2 font-body text-sm text-fg/80 transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <SocialIcon name={social.icon} className="h-4 w-4 shrink-0" />
                {social.label}
                {!social.url.startsWith('mailto:') && (
                  <>
                    <span aria-hidden="true" className="ml-auto text-[10px] opacity-60">
                      ↗
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/**
 * The tray clock, ticking on the minute.
 *
 * Renders empty on the first paint and fills in from an effect: a clock
 * rendered during the initial render is wrong the moment the tab has been open
 * for a minute, and the static HTML fallback would otherwise ship a baked-in
 * time.
 */
function TrayClock() {
  const [now, setNow] = useState('')

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
