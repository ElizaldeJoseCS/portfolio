import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useIsInView } from '@/hooks/useIsInView'
import { useWorld } from '@/lib/world-context'

interface SectionProps {
  id: string
  title: string
  /** Small line above the heading, e.g. "02 — Work". */
  eyebrow?: string
  lead?: string
  children: ReactNode
  className?: string
  /** Hide the visible heading but keep it for screen readers. */
  visuallyHiddenTitle?: boolean
}

/**
 * Semantic section wrapper with the default scroll reveal (spec §6.8) and the
 * `aria-labelledby` pairing required by spec §8.
 */
export function Section({
  id,
  title,
  eyebrow,
  lead,
  children,
  className,
  visuallyHiddenTitle = false,
}: SectionProps) {
  const { ref, inView } = useIsInView<HTMLElement>()
  const { reducedMotion, theme } = useWorld()
  const headingId = `${id}-heading`

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn('relative mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 md:py-28', className)}
    >
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={reducedMotion ? { duration: 0.2 } : theme.motionSpring}
      >
        <header className={cn('mb-10 md:mb-14', visuallyHiddenTitle && 'sr-only')}>
          {eyebrow && (
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-accent">
              {eyebrow}
            </p>
          )}
          <h2
            id={headingId}
            className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-5xl"
          >
            {title}
          </h2>
          {lead && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{lead}</p>}
        </header>
        {children}
      </motion.div>
    </section>
  )
}
