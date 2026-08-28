import { skills } from '@/data'
import type { SkillGroup } from '@/types'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Chip, Section } from './ui'

/**
 * Game World presentation only — the Engineer World lists skills through its
 * `skills` command. Groups are filtered to game-relevant items, and any group
 * left empty is dropped rather than rendered as an empty card.
 */
function useGameSkills(): SkillGroup[] {
  return skills
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (i) => !i.worlds || i.worlds.includes('game') || i.worlds.includes('both'),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function SkillsCloud() {
  return <SkillsMarquee />
}

function SkillsMarquee() {
  const { reducedMotion } = useWorld()
  const groups = useGameSkills()
  const flat = groups.flatMap((g) => g.items.map((i) => ({ ...i, category: g.category })))

  return (
    <Section
      id="skills"
      eyebrow="03 — Loadout"
      title="Skills"
      lead="What I bring to a game project. The full stack — systems, backend, tooling — is listed in the Engineer World."
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
        {groups.map((group) => (
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
