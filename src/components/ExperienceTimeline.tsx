import type { ExperienceEntry } from '@/types'
import { cn } from '@/lib/cn'
import { Chip, InstitutionMark } from './ui'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

/**
 * The roles, on a single left rail.
 *
 * It used to alternate around a centre rail with each card revealing on scroll.
 * The alternating version reads badly beside a sidebar — the column is roughly
 * half as wide as the one it was designed for — and the scroll reveal is the
 * kind of motion this rebuild set out to remove. One rail, everything present
 * on load.
 */
export function ExperienceTimeline({ entries }: { entries: ExperienceEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="xp-bevel-in bg-bg/40 px-4 py-6 text-sm text-muted">
        Nothing here under this filter.
      </p>
    )
  }

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-[7px] w-px bg-gradient-to-b from-transparent via-line to-transparent"
      />
      <ol className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.id} className="relative pl-8">
            {/* Node on the rail. Decorative — the date text carries the meaning. */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-[3px] top-6 h-2.5 w-2.5 border-2 border-accent',
                entry.kind === 'education' ? 'bg-bg' : 'bg-accent',
              )}
            />

            <article className="xp-bevel bg-surfaceAlt p-4 transition-colors hover:border-accent/50">
              <div className="flex items-start gap-3">
                {entry.logo && <InstitutionMark logo={entry.logo} />}
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                    {KIND_LABEL[entry.kind]} · {formatDate(entry.start)} — {formatDate(entry.end)}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-tight text-fg">
                    {entry.role}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                      >
                        {entry.company}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      entry.company
                    )}
                    {entry.location && <span className="text-muted"> · {entry.location}</span>}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                {entry.description.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              {entry.skills.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {entry.skills.map((skill) => (
                    <li key={skill}>
                      <Chip className="rounded-none">{skill}</Chip>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
