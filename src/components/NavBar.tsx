import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '@/data'
import { useWorld } from '@/lib/world-context'
import { useHub } from '@/lib/hub-context'
import { cn } from '@/lib/cn'
import { WorldSwitcher } from './WorldSwitcher'
import { LinkButton, Tooltip } from './ui'

const SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

const monogram = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function NavBar() {
  const { theme, reducedMotion, world, stage, goToLanding } = useWorld()
  const { arenaActive } = useHub()
  const inWorld = stage === 'world'
  const inDoor = stage === 'door'
  // Only the Game World's *list* view has scrollable sections; the landing, the
  // console and the arena would point the anchor list at elements that do not
  // exist.
  const showSectionLinks = inWorld && world === 'game' && !arenaActive
  const showConsoleHint = inWorld && world === 'engineer'
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section currently under the sticky nav.
  useEffect(() => {
    if (!showSectionLinks) return
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (!targets.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [showSectionLinks, world, stage, arenaActive])

  // Switching worlds from inside the mobile menu should reveal the world you
  // just picked, not leave the overlay covering it.
  useEffect(() => {
    setOpen(false)
  }, [world])

  // Lock body scroll and close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // The intro room is a threshold, not a page: no chrome over it.
  if (inDoor) return null

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-world focus:bg-accent focus:px-4 focus:py-3 focus:font-display focus:text-bg"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
          scrolled
            ? 'border-b border-line/60 bg-bg/80 backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 sm:px-8 md:h-20"
        >
          {/* In a world the monogram is the way back out to the landing hub. */}
          {inWorld ? (
            <button
              type="button"
              onClick={goToLanding}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-world px-2 font-display text-lg font-bold tracking-[0.2em] text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {monogram(profile.name)}
              <span
                aria-hidden="true"
                className="font-mono text-[10px] font-normal tracking-normal text-muted"
              >
                ← home
              </span>
              <span className="sr-only">Back to the landing page</span>
            </button>
          ) : (
            <span className="inline-flex min-h-[44px] items-center px-2 font-display text-lg font-bold tracking-[0.2em] text-fg">
              {monogram(profile.name)}
              <span className="sr-only">{profile.name}</span>
            </span>
          )}

          {showConsoleHint && (
            <p className="ml-4 hidden flex-1 font-mono text-xs text-muted lg:block">
              <span className="text-accent">console:</span> type{' '}
              <code className="text-accentAlt">help</code> to navigate
            </p>
          )}

          {showSectionLinks && (
            <ul className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={cn(
                      'inline-flex min-h-[44px] items-center rounded-world px-3 font-display text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      active === s.id ? 'text-accent' : 'text-muted hover:text-fg',
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="ml-auto flex items-center gap-3">
            {inWorld && <WorldSwitcher className="hidden sm:flex" />}
            {profile.resumeUrl && (
              <Tooltip label="PDF, opens in a new tab" className="hidden md:inline-flex">
                <LinkButton href={profile.resumeUrl} size="sm" variant="outline" external>
                  Resume
                </LinkButton>
              </Tooltip>
            )}
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-world border border-line/80 text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
            >
              <span aria-hidden="true" className="relative block h-4 w-5">
                <span
                  className={cn(
                    'absolute left-0 h-0.5 w-5 bg-current transition-transform duration-200',
                    open ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-opacity duration-200',
                    open && 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-0.5 w-5 bg-current transition-transform duration-200',
                    open ? 'top-1.5 -rotate-45' : 'top-3',
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.001 : 0.2 }}
            className="fixed inset-0 z-40 flex flex-col bg-bg/95 px-5 pb-10 pt-24 backdrop-blur-xl lg:hidden"
          >
            {showConsoleHint && (
              <p className="mb-6 font-mono text-sm leading-relaxed text-muted">
                <span className="text-accent">You are in the console world.</span> Close this menu
                and type <code className="text-accentAlt">help</code> at the prompt — or tap a
                command button and press Enter.
              </p>
            )}
            {!inWorld && (
              <p className="mb-6 font-mono text-sm leading-relaxed text-muted">
                <span className="text-accent">Pick a world</span> from the two cards on the page to
                get started.
              </p>
            )}

            {showSectionLinks && (
              <ul className="flex flex-col gap-1">
                {SECTIONS.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reducedMotion ? { duration: 0.1 } : { ...theme.motionSpring, delay: i * 0.04 }
                    }
                  >
                    <a
                      href={`#${s.id}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[56px] items-center border-b border-line/50 font-display text-2xl text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {s.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            )}

            <div className="mt-auto space-y-4 pt-8">
              {inWorld && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    goToLanding()
                  }}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-world border border-line/80 font-display text-base text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  ← Back to landing
                </button>
              )}
              {inWorld && <WorldSwitcher layout="full" />}
              {profile.resumeUrl && (
                <LinkButton href={profile.resumeUrl} variant="outline" className="w-full" external>
                  Resume
                </LinkButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
