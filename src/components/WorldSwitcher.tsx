import { motion } from 'framer-motion'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import type { World } from '@/types'
import { themes } from '@/lib/theme'

const WORLDS: World[] = ['game', 'engineer']

interface WorldSwitcherProps {
  className?: string
  /** `full` stretches to the container — used inside the mobile menu. */
  layout?: 'inline' | 'full'
}

/**
 * The signature interaction (spec §4.3): a two-state segmented control that
 * slides an accent pill between worlds. Implemented as a radiogroup so the
 * arrow keys work and screen readers announce the current world.
 */
export function WorldSwitcher({ className, layout = 'inline', ...rest }: WorldSwitcherProps) {
  const { world, setWorld, theme, reducedMotion } = useWorld()

  return (
    <div
      role="radiogroup"
      aria-label="Choose a world"
      className={cn(
        'relative flex items-center rounded-full border border-line/80 bg-surface/80 p-1 backdrop-blur',
        layout === 'full' && 'w-full',
        className,
      )}
      {...rest}
    >
      {WORLDS.map((w) => {
        const active = w === world
        return (
          <button
            key={w}
            role="radio"
            aria-checked={active}
            aria-label={`Switch to the ${themes[w].label}`}
            onClick={() => setWorld(w)}
            className={cn(
              'relative isolate min-h-[44px] flex-1 rounded-full px-4 font-display text-sm font-semibold',
              'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              active ? 'text-bg' : 'text-muted hover:text-fg',
              layout === 'inline' && 'whitespace-nowrap',
            )}
          >
            {active && (
              <motion.span
                layoutId="world-switcher-pill"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={reducedMotion ? { duration: 0.001 } : theme.motionSpring}
              />
            )}
            {w === 'game' ? 'Game' : 'Engineer'}
          </button>
        )
      })}
    </div>
  )
}
