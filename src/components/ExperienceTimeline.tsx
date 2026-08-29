import { motion } from 'framer-motion'
import { experience } from '@/data'
import type { ExperienceEntry } from '@/types'
import { useWorld } from '@/lib/world-context'
import { useIsInView } from '@/hooks/useIsInView'
import { cn } from '@/lib/cn'
import { Chip, InstitutionMark, Section } from './ui'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** "2023-06" → "Jun 2023"; "Present" passes through. */
function formatDate(value: string): string {
  if (value === 'Present') return 'Present'
  const [year, month] = value.split('-')
  const idx = Number(month) - 1
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : (year ?? value)
}

const KIND_LABEL: Record<ExperienceEntry['kind'], string> = {
  work: 'Work',
  internship: 'Internship',
  education: 'Education',
}

function TimelineItem({ entry, index }: { entry: ExperienceEntry; index: number }) {
  const { theme, reducedMotion } = useWorld()
  const { ref, inView } = useIsInView<HTMLLIElement>()
  const left = index % 2 === 0

  return (
    <motion.li
      ref={ref}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={reducedMotion ? { duration: 0.2 } : theme.motionSpring}
      className={cn(
        'relative pl-12 md:w-1/2 md:pl-0',
        // Desktop: alternate sides around the centre rail.
        left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12',
      )}
    >
      {/* Node on the rail. Decorative — the date text carries the meaning. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-6 h-3 w-3 rounded-full border-2 border-accent bg-bg',
          'left-[18px] -translate-x-1/2 md:left-auto',
          left ? 'md:-right-[6px]' : 'md:-left-[6px]',
        )}
      />

      <article className="rounded-world border border-line/70 bg-surface/70 p-5 backdrop-blur-md transition-colors hover:border-accent/60">
        {/* The mark leads the header, and swaps to the outside edge on the
            left-hand column so it stays against the rail on both sides. */}
        <div className={cn('flex items-start gap-3', left && 'md:flex-row-reverse')}>
          {entry.logo && <InstitutionMark logo={entry.logo} />}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              {KIND_LABEL[entry.kind]} · {formatDate(entry.start)} — {formatDate(entry.end)}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-fg">{entry.role}</h3>
            <p className="mt-1 text-sm text-muted">
              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                >
                  {entry.company}
                </a>
              ) : (
                entry.company
              )}
              {entry.location && <span className="text-muted/70"> · {entry.location}</span>}
            </p>
          </div>
        </div>

        <ul className={cn('mt-4 space-y-2 text-sm leading-relaxed text-muted', left && 'md:text-right')}>
          {entry.description.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <ul className={cn('mt-4 flex flex-wrap gap-1.5', left && 'md:justify-end')}>
          {entry.skills.map((skill) => (
            <li key={skill}>
              <Chip>{skill}</Chip>
            </li>
          ))}
        </ul>
      </article>
    </motion.li>
  )
}

export function ExperienceTimeline() {
  // Game World only: research and software roles are listed by the Engineer
  // World's `experience` command instead.
  const entries = experience.filter(
    (e) => e.worlds.includes('game') || e.worlds.includes('both'),
  )

  return (
    <Section
      id="experience"
      eyebrow="02 — Timeline"
      title="Experience"
      lead="Studio work and school. My research and software roles are in the Engineer World — run `experience` there."
    >
      <div className="relative">
        {/* Centre rail (desktop) / left rail (mobile). */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-[18px] w-px bg-gradient-to-b from-transparent via-line to-transparent md:left-1/2"
        />
        <ol className="space-y-8 md:space-y-4">
          {entries.map((entry, i) => (
            <TimelineItem key={entry.id} entry={entry} index={i} />
          ))}
        </ol>
      </div>
    </Section>
  )
}
