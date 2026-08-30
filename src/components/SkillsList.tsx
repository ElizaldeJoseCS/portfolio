import type { SkillGroup } from '@/types'
import { Chip } from './ui'

/**
 * The skill groups, as XP list boxes.
 *
 * The old version was a "cloud" with per-skill strength bars animating in on
 * scroll. The bars are kept — `level` is real data and the bar is drawn behind
 * the label by `Chip` — but nothing animates, and the layout is a plain grid.
 */
export function SkillsList({ groups }: { groups: SkillGroup[] }) {
  const populated = groups.filter((group) => group.items.length > 0)

  if (populated.length === 0) {
    return (
      <p className="xp-bevel-in bg-bg/40 px-4 py-6 text-sm text-muted">
        Nothing here under this filter.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {populated.map((group) => (
        <section key={group.category} className="xp-bevel bg-surfaceAlt p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            {group.category}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <li key={item.name}>
                <Chip className="rounded-none" level={item.level}>
                  {item.name}
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
