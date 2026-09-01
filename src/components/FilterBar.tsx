import { cn } from '@/lib/cn'
import type { FilterOption } from '@/lib/filters'

/**
 * A row of toggle buttons that narrows the list below it, as an XP toolbar.
 *
 * Generic over its options because the pages filter on different axes: the
 * Projects and About pages split by track (All / Software / Games), the
 * Experience page by area (All / Research / Education / Other). It used to
 * hardcode the track options, which meant a second axis needed a second
 * near-identical component.
 *
 * Whatever the axis, `All` is always first and always the default. Nothing is
 * hidden from someone who never touches the control.
 *
 * Buttons with `aria-pressed` rather than radios: these filter a list in place
 * rather than submitting a choice, and pressed-state buttons are what a
 * toolbar is.
 */
export function FilterBar<T extends string>({
  value,
  onChange,
  label,
  options,
  counts,
}: {
  value: T
  onChange: (next: T) => void
  /** Names the group for assistive tech, e.g. "Filter projects". */
  label: string
  options: readonly FilterOption<T>[]
  /** Optional per-option totals, shown in the button. */
  counts?: Partial<Record<T, number>>
}) {
  return (
    <div role="group" aria-label={label} className="mb-5 flex flex-wrap items-center gap-1.5">
      {options.map((option) => {
        const active = option.value === value
        const count = counts?.[option.value]
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
            {typeof count === 'number' && (
              <span aria-hidden="true" className="text-[11px] text-muted">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
