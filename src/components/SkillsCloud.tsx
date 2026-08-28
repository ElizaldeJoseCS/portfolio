import { motion } from 'framer-motion'
import { skills } from '@/data'
import { useWorld } from '@/lib/world-context'
import { useIsInView } from '@/hooks/useIsInView'
import { cn } from '@/lib/cn'
import { Chip, Section } from './ui'

/**
 * Two presentations of the same data (spec §6.5):
 * - Game world: a scrolling marquee of chips, arcade-attract-mode energy.
 * - Engineer world: a precise grid with level meters, like a stats panel.
 */
export function SkillsCloud() {
  const { world } = useWorld()
  return world === 'game' ? <SkillsMarquee /> : <SkillsGrid />
}

function SkillsGrid() {
  const { theme, reducedMotion } = useWorld()

  return (
    <Section
      id="skills"
      eyebrow="03 — Toolkit"
      title="Skills"
      lead="Grouped by where they get used. The bar is self-assessed depth, not a certification."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group, gi) => (
          <SkillGroupCard key={group.category} index={gi} group={group} theme={theme} reduced={reducedMotion} />
        ))}
      </div>
    </Section>
  )
}

function SkillGroupCard({
  group,
  index,
  theme,
  reduced,
}: {
  group: (typeof skills)[number]
  index: number
  theme: ReturnType<typeof useWorld>['theme']
  reduced: boolean
}) {
  const { ref, inView } = useIsInView<HTMLDivElement>()

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={reduced ? { duration: 0.2 } : { ...theme.motionSpring, delay: index * 0.05 }}
      className="rounded-world border border-line/70 bg-surface/70 p-5 backdrop-blur-md"
    >
      <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{group.category}</h3>
      <ul className="mt-4 space-y-3">
        {group.items.map((item) => (
          <li key={item.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-sm text-fg">{item.name}</span>
              {typeof item.level === 'number' && (
                <span className="font-mono text-[10px] text-muted">
                  {Math.round(item.level * 100)}
                  <span className="sr-only"> percent proficiency</span>
                </span>
              )}
            </div>
            {typeof item.level === 'number' && (
              <div
                className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surfaceAlt"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(item.level * 100)}
                aria-label={`${item.name} proficiency`}
              >
                <motion.span
                  className="block h-full rounded-full bg-gradient-to-r from-accent to-accentAlt"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${item.level * 100}%` } : undefined}
                  transition={reduced ? { duration: 0.2 } : { duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function SkillsMarquee() {
  const { reducedMotion } = useWorld()
  const flat = skills.flatMap((g) => g.items.map((i) => ({ ...i, category: g.category })))

  return (
    <Section
      id="skills"
      eyebrow="03 — Loadout"
      title="Skills"
      lead="The kit I bring to a project. Engines and graphics up front; the systems work is right behind it."
    >
      {/* Marquee is decorative motion over a list that is fully readable statically. */}
      <div
        className={cn(
          'relative -mx-5 overflow-hidden py-2 sm:-mx-8',
          '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        )}
      >
        <ul
          className={cn(
            'flex w-max gap-3 px-5 sm:px-8',
            !reducedMotion && 'animate-marquee hover:[animation-play-state:paused]',
          )}
        >
          {(reducedMotion ? flat : [...flat, ...flat]).map((item, i) => (
            <li key={`${item.name}-${i}`} aria-hidden={!reducedMotion && i >= flat.length}>
              <Chip tone={i % 3 === 0 ? 'accent' : 'default'} level={item.level} className="text-sm">
                {item.name}
              </Chip>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <div
            key={group.category}
            className="rounded-world border border-line/70 bg-surface/70 p-5 backdrop-blur-md"
          >
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              {group.category}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item.name}>
                  <Chip>{item.name}</Chip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
