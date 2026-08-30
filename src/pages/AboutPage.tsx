import { useMemo, useState } from 'react'
import { profile, skills } from '@/data'
import { PageHeading, Chip } from '@/components/ui'
import { SkillsList } from '@/components/SkillsList'
import { TrackFilter } from '@/components/TrackFilter'
import { matchesTrack, type TrackFilterValue } from '@/lib/track'

export function AboutPage() {
  const [filter, setFilter] = useState<TrackFilterValue>('all')

  // Filter inside each group, then drop groups the filter emptied — a
  // "Game engines" heading over nothing reads as a bug.
  const filtered = useMemo(
    () =>
      skills
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => matchesTrack(item.track, filter)),
        }))
        .filter((group) => group.items.length > 0),
    [filter],
  )

  const counts = useMemo(() => {
    const count = (f: TrackFilterValue) =>
      skills.reduce((n, g) => n + g.items.filter((i) => matchesTrack(i.track, f)).length, 0)
    return { all: count('all'), swe: count('swe'), game: count('game') }
  }, [])

  return (
    <>
      <PageHeading level="h1">About</PageHeading>

      <div className="xp-bevel-in space-y-4 bg-bg/40 p-4 text-[15px] leading-relaxed text-muted sm:p-5">
        {profile.bio.map((paragraph, i) => (
          <p key={i} className={i === 0 ? 'text-base text-fg/90' : undefined}>
            {paragraph}
          </p>
        ))}
      </div>

      {profile.interests && profile.interests.length > 0 && (
        <section className="mt-10">
          <PageHeading>Interests</PageHeading>
          <ul className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <li key={interest}>
                <Chip className="rounded-none">{interest}</Chip>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <PageHeading lead="Bars are a rough self-assessment, not a certification.">
          Skills
        </PageHeading>
        <TrackFilter value={filter} onChange={setFilter} label="Filter skills" counts={counts} />
        <SkillsList groups={filtered} />
      </section>
    </>
  )
}
