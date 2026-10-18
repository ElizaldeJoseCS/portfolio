import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { profile } from '@/data'
import { pageFor } from '@/lib/nav'
import { XpMenuBar, XpTaskbar, XpWindow } from './xp'
import { Footer } from './Footer'

/**
 * The frame every page renders into: one Windows XP window, in Cyberpunk 2077
 * colours, with a taskbar. Only the window body changes between routes.
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
      <div className="mx-auto w-full max-w-7xl px-2 pt-3 sm:px-5 sm:pt-6">
        <XpWindow
          title="jose.elizalde"
          subtitle={page ? `${page.label.toLowerCase()}` : undefined}
          menu={<XpMenuBar />}
          status={<StatusLine />}
        >
          <main id="main" className="min-w-0 p-3 sm:p-5">
            {/*
              Keyed on the route so the fade replays on every navigation.
              This is the entire animation budget for the site.
            */}
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </main>
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

/** The status bar: one static line, the way XP's status bars were. */
function StatusLine() {
  return (
    <p className="truncate px-3 py-1.5 font-mono text-[11px] text-muted">
      {profile.roles.join(' · ')} · {profile.location}
    </p>
  )
}
