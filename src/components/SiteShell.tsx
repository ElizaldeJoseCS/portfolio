import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { profile } from '@/data'
import { pageFor } from '@/lib/nav'
import { XpMenuBar, XpPanel, XpTaskbar, XpVisitorCounter, XpWindow } from './xp'
import { SocialIcon } from './ui'
import { Footer } from './Footer'

/**
 * The frame every page renders into: one Windows XP window, in Cyberpunk 2077
 * colours, with a persistent sidebar and a taskbar.
 *
 * Only the main column changes between routes. The sidebar is the blogroll —
 * the things that are true on every page — and keeping it mounted across
 * navigations is what makes this read as one application window rather than
 * five separate documents.
 */
/** Head tags for a path that matches no route. Mirrors the emitted 404.html. */
const NOT_FOUND_META = {
  title: 'Not found — Jose Elizalde',
  description: 'That page does not exist on this site.',
}

export function SiteShell() {
  const { pathname } = useLocation()
  const page = pageFor(pathname)

  /*
    Each route ships its own HTML file with the right head tags already in it
    (see `staticRoutes` in vite.config.ts), so this only has to keep up with
    *client-side* navigation, where the document never reloads.

    The unknown-path case is spelled out rather than falling back to PAGES[0]:
    doing that overwrote 404.html's correct "Not found" title with the home
    page's the moment React booted.
  */
  useEffect(() => {
    const meta = page ?? NOT_FOUND_META
    document.title = meta.title
    const tag = document.querySelector('meta[name="description"]')
    if (tag) tag.setAttribute('content', meta.description)
  }, [page])

  /*
    Browsers restore scroll on back/forward, but a client-side navigation to a
    new route keeps the old offset — you click "Projects" from halfway down
    "About" and land halfway down Projects. Reset on every push.
  */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative">
      {/*
        The desktop the window sits on. Yellow bloom from above, cyan from the
        lower left, over a faint engineering grid — 2077's palette doing the
        job XP's Bliss wallpaper did. Two fixed layers, so it does not repaint
        as the page scrolls.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_-10%,rgb(var(--c-accent)/0.16),transparent_55%),radial-gradient(ellipse_at_10%_100%,rgb(var(--c-accent-alt)/0.13),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgb(var(--c-accent-alt))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--c-accent-alt))_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.07]"
      />

      <div className="mx-auto w-full max-w-6xl px-2 pt-3 sm:px-5 sm:pt-6">
        <XpWindow
          title="jose.elizalde"
          subtitle={page ? `${page.label.toLowerCase()}` : undefined}
          menu={<XpMenuBar />}
          status={<StatusTicker />}
        >
          <div className="p-3 sm:p-5">
            {/*
              Source order is content-then-sidebar, and the grid moves the
              sidebar back to the left on wide screens. Laid out in visual
              order, a phone got the whole sidebar before the first line of any
              page.
            */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6">
              <main id="main" className="min-w-0 lg:order-2">
                {/*
                  Keyed on the route so the fade replays on every navigation.
                  This is the entire animation budget for the site.
                */}
                <div key={pathname} className="page-enter">
                  <Outlet />
                </div>
              </main>
              <div className="min-w-0 lg:order-1">
                <Sidebar />
              </div>
            </div>
          </div>
        </XpWindow>
      </div>

      {/* pb clears the fixed taskbar, which would otherwise sit on the footer. */}
      <div className="mt-6 pb-28">
        <Footer />
      </div>

      <XpTaskbar />
    </div>
  )
}

function Sidebar() {
  return (
    <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[7.5rem] lg:self-start">
      {profile.today && (
        <XpPanel title="Currently">
          <p className="text-[13px] leading-relaxed text-fg/85">{profile.today}</p>
        </XpPanel>
      )}

      <XpPanel title="Links">
        <ul className="space-y-1">
          {profile.socials.map((social) => (
            <li key={social.url}>
              <a
                href={social.url}
                {...(social.url.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noreferrer noopener' })}
                className="flex min-h-[44px] items-center gap-2.5 px-1 text-[13px] text-fg/85 transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          {profile.resumes?.map((resume) => (
            <li key={resume.url}>
              <a
                href={resume.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex min-h-[44px] items-center gap-2.5 px-1 text-[13px] text-fg/85 transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-center">
                  ▤
                </span>
                {resume.label}
                <span aria-hidden="true" className="ml-auto text-[10px] opacity-60">
                  ↗
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </XpPanel>

      <XpPanel title="Counter">
        <XpVisitorCounter />
      </XpPanel>
    </div>
  )
}

/**
 * The status bar ticker. Every 2003 blog had a marquee; 2077 has news crawls
 * at the bottom of every screen. Same element, twenty years apart.
 *
 * The strip is duplicated because the `marquee` keyframe translates by -50% —
 * the copy is what makes the loop seamless — and the duplicate is hidden from
 * assistive tech so the sentence is not announced twice. The blanket
 * reduced-motion rule in globals.css freezes it on the first copy.
 */
function StatusTicker() {
  const items = [
    profile.today,
    `${profile.roles.join(' · ')} — ${profile.location}`,
    'Every page is one document; the window never closes.',
  ].filter(Boolean) as string[]

  const strip = (
    <span className="flex shrink-0 items-center gap-8 pr-8 font-mono text-[11px] text-muted">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-8">
          <span aria-hidden="true" className="text-accent">
            ◆
          </span>
          {item}
        </span>
      ))}
    </span>
  )

  return (
    <div className="flex items-stretch">
      <div className="flex min-w-0 flex-1 items-center overflow-hidden py-1.5 pl-3">
        <div className="flex w-max animate-marquee items-center">
          {strip}
          <span aria-hidden="true" className="contents">
            {strip}
          </span>
        </div>
      </div>
      <p className="hidden shrink-0 items-center border-l-2 border-bg px-3 font-mono text-[11px] text-muted sm:flex">
        <span aria-hidden="true" className="mr-1.5 text-accentAlt">
          ●
        </span>
        online
      </p>
    </div>
  )
}
