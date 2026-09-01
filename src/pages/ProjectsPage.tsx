import { useMemo, useState } from 'react'
import { projects } from '@/data'
import { PageHeading } from '@/components/ui'
import { ProjectCard } from '@/components/ProjectCard'
import { FilterBar } from '@/components/FilterBar'
import { matchesTrack, TRACK_OPTIONS, type TrackFilterValue } from '@/lib/filters'

export function ProjectsPage() {
  const [filter, setFilter] = useState<TrackFilterValue>('all')

  // Featured first, then by year, newest down. `localeCompare` on the year
  // string is fine — they are all four-digit, or a range starting with one.
  const ordered = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return b.year.localeCompare(a.year)
      }),
    [],
  )

  const visible = ordered.filter((p) => matchesTrack(p.track, filter))

  const counts = {
    all: projects.length,
    swe: projects.filter((p) => matchesTrack(p.track, 'swe')).length,
    game: projects.filter((p) => matchesTrack(p.track, 'game')).length,
  }

  return (
    <>
      <PageHeading
        level="h1"
        lead="Systems work and games. Each one expands in place — nothing opens in a dialog."
      >
        Projects
      </PageHeading>

      <FilterBar
        value={filter}
        onChange={setFilter}
        label="Filter projects"
        options={TRACK_OPTIONS}
        counts={counts}
      />

      {/*
        aria-live so the count is announced when the filter changes: the list
        below it re-renders silently otherwise, and a keyboard user pressing
        "Software" gets no confirmation that anything happened.
      */}
      <p aria-live="polite" className="mb-4 font-mono text-[11px] text-muted">
        {visible.length} of {projects.length} shown
      </p>

      <ul className="space-y-4">
        {visible.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </>
  )
}
