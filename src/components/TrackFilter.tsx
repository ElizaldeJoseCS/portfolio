import { cn } from '@/lib/cn'
import type { TrackFilterValue } from '@/lib/track'

const OPTIONS: { value: TrackFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'swe', label: 'Software' },
  { value: 'game', label: 'Games' },
]

/**
 * All / Software / Games, as an XP toolbar of toggle buttons.
 *
 * This is what is left of the two worlds: the split was a wall between them,
 * and it is a filter now. Nothing is ever hidden from someone who does not
 * touch it — "All" is the default and every item stays reachable — but a
 * reader who only cares about the systems work can say so in one click.
 *
 * Buttons with `aria-pressed` rather than radios: these filter a list in place
 * rather than submitting a choice, and pressed-state buttons are what a
 * toolbar is.
 */
export function TrackFilter({
  value,
  onChange,
  label,
  counts,
}: {
  value: TrackFilterValue
  onChange: (next: TrackFilterValue) => void
  /** Names the group for assistive tech, e.g. "Filter projects". */
  label: string
  /** Optional per-option totals, shown in the button. */
  counts?: Record<TrackFilterValue, number>
}) {
  return (
    <div role="group" aria-label={label} className="mb-5 flex flex-wrap items-center gap-1.5">
      {OPTIONS.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 px-3.5 font-mono text-xs uppercase tracking-[0.14em]',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              active
                ? 'xp-bevel-in bg-accent/20 text-accent'
                : 'xp-bevel bg-surfaceAlt text-fg/80 hover:bg-accent/10 hover:text-accent',
            )}
          >
            {option.label}
            {counts && (
              <span aria-hidden="true" className="text-[11px] text-muted">
                {counts[option.value]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
