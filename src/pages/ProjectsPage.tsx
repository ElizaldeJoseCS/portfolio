import { useMemo, useState } from 'react'
import type { Project } from '@/types'
import { projects } from '@/data'
import { PageHeading } from '@/components/ui'
import { ProjectCard } from '@/components/ProjectCard'
import { FilterBar } from '@/components/FilterBar'
import { matchesTrack, TRACK_OPTIONS, type TrackFilterValue } from '@/lib/filters'

/** A game-only project goes in the Games column; everything else, `both` included, in Software. */
const isGame = (project: Project) =>
  project.track.includes('game') &&
  !project.track.includes('swe') &&
  !project.track.includes('both')

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

  const columns = [
    { label: 'Software', items: visible.filter((p) => !isGame(p)) },
    { label: 'Games', items: visible.filter(isGame) },
  ]
  const single = columns.filter((c) => c.items.length > 0).length === 1

  const counts = {
    all: projects.length,
    swe: projects.filter((p) => matchesTrack(p.track, 'swe')).length,
    game: projects.filter((p) => matchesTrack(p.track, 'game')).length,
  }

  return (
    <>
      <PageHeading level="h1" lead="Systems work and games">
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

      {/*
        One column per track, side by side on wide screens and stacked below
        that. Picking a single track in the filter leaves just that column,
        full width.
      */}
      <div
        className={
          single ? 'grid grid-cols-1' : 'grid grid-cols-1 items-start gap-6 lg:grid-cols-2'
        }
      >
        {columns.map(
          (column) =>
            column.items.length > 0 && (
              <section
                key={column.label}
                aria-labelledby={`col-${column.label}`}
                className="min-w-0"
              >
                <h2
                  id={`col-${column.label}`}
                  className="mb-3 border-b-2 border-line/60 pb-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-accent"
                >
                  {column.label}
                </h2>
                <ul className="space-y-4">
                  {column.items.map((project) => (
                    <li key={project.id}>
                      <ProjectCard project={project} />
                    </li>
                  ))}
                </ul>
              </section>
            ),
        )}
      </div>
    </>
  )
}
