import { cn } from '@/lib/cn'

export interface XpMenuItem {
  id: string
  label: string
}

/**
 * The window's menu bar, doing the job a menu bar never actually did: this is
 * the landing's primary navigation.
 *
 * Real anchors with honest labels, styled as XP menus. Fake `File / Edit /
 * Help` items would have looked more authentic and been dead weight in the
 * accessibility tree — a menu bar is the first thing a screen-reader user
 * reaches here, so every item in it goes somewhere.
 *
 * XP's menus were about 20px tall. These are 44, because the touch target
 * floor in spec §8 is an acceptance criterion and the period reference is not.
 */
export function XpMenuBar({
  items,
  active,
  className,
}: {
  items: XpMenuItem[]
  active?: string
  className?: string
}) {
  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex flex-wrap items-center px-1">
        {items.map((item) => {
          const isActive = active === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'inline-flex min-h-[44px] items-center px-3 font-body text-sm text-fg/85',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  // XP inverted the whole item on hover rather than tinting it.
                  'hover:bg-accent hover:text-bg',
                  isActive && 'bg-accent/20 text-accent',
                )}
              >
                {/* Underline on the first letter comes from CSS; see .xp-accesskey. */}
                <span className="xp-accesskey block">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
