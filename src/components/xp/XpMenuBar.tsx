import { NavLink } from 'react-router-dom'
import { PAGES } from '@/lib/nav'
import { cn } from '@/lib/cn'

/**
 * The window's menu bar, doing the job a menu bar never actually did: this is
 * the site's primary navigation.
 *
 * Real routes with honest labels, styled as XP menus. Fake `File / Edit / Help`
 * items would have looked more authentic and been dead weight in the
 * accessibility tree — a menu bar is the first thing a screen-reader user
 * reaches here, so every item in it goes somewhere.
 *
 * XP's menus were about 20px tall. These are 44, because the touch target
 * floor in spec §8 is an acceptance criterion and the period reference is not.
 * It wraps rather than scrolls: five short labels fit one row from about 380px
 * up, and a second row is better than hiding half the site off-screen.
 */
export function XpMenuBar({ className }: { className?: string }) {
  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex flex-wrap items-center px-1">
        {PAGES.map((page) => (
          <li key={page.path}>
            <NavLink
              // `end` only on the index route: without it "Home" stays matched
              // on every page, since every path starts with "/".
              end={page.path === '/'}
              to={page.path}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-[44px] items-center px-3 font-body text-sm text-fg/85',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  // XP inverted the whole item on hover rather than tinting it.
                  'hover:bg-accent hover:text-bg',
                  isActive && 'bg-accent/20 text-accent',
                )
              }
            >
              {/* Underline on the first letter comes from CSS; see .xp-accesskey. */}
              <span className="xp-accesskey block">{page.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
