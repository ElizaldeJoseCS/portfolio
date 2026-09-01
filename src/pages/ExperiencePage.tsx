import { useState } from 'react'
import { experience, profile, publications } from '@/data'
import type { ExperienceArea, Publication } from '@/types'
import { InstitutionMark, LinkButton, PageHeading } from '@/components/ui'
import { ExperienceTimeline } from '@/components/ExperienceTimeline'
import { FilterBar } from '@/components/FilterBar'
import { AREA_OPTIONS, matchesArea, type AreaFilterValue } from '@/lib/filters'

/** The entry a paper came out of. Papers reference it by id, never inline it. */
const roleForPaper = (experienceId?: string) =>
  experienceId ? experience.find((e) => e.id === experienceId) : undefined

/**
 * A paper's filter category is the category of the role that produced it, so
 * the two can never disagree — the same reason one filter drives both blocks.
 * A paper with no linked role is research by nature.
 */
const areaForPaper = (paper: Publication): ExperienceArea =>
  roleForPaper(paper.experienceId)?.area ?? 'research'

export function ExperiencePage() {
  const [filter, setFilter] = useState<AreaFilterValue>('all')

  const entries = experience.filter((e) => matchesArea(e.area, filter))
  const papers = publications.filter((p) => matchesArea(areaForPaper(p), filter))

  const counts = {
    all: experience.length,
    research: experience.filter((e) => e.area === 'research').length,
    education: experience.filter((e) => e.area === 'education').length,
    other: experience.filter((e) => e.area === 'other').length,
  }

  return (
    <>
      <PageHeading level="h1" lead="Roles, school, and the papers that came out of them.">
        Experience
      </PageHeading>

      {/* One filter drives both blocks: a paper belongs to the role it came
          out of, so splitting them would let the two disagree. */}
      <FilterBar
        value={filter}
        onChange={setFilter}
        label="Filter experience and papers"
        options={AREA_OPTIONS}
        counts={counts}
      />

      {/*
        The timeline needs a heading of its own, or the page steps straight
        from its h1 to the h3 on the first role.
      */}
      <PageHeading>Roles &amp; education</PageHeading>
      <ExperienceTimeline entries={entries} />

      <section className="mt-10">
        <PageHeading>Published research</PageHeading>
        {papers.length === 0 ? (
          <p className="xp-bevel-in bg-bg/40 px-4 py-6 text-sm text-muted">
            No papers under this filter.
          </p>
        ) : (
          <ul className="space-y-4">
            {papers.map((paper) => (
              <li key={paper.id} className="xp-bevel bg-surfaceAlt p-4">
                <div className="flex gap-4">
                  {(() => {
                    const logo = roleForPaper(paper.experienceId)?.logo
                    return logo ? <InstitutionMark logo={logo} className="mt-1" /> : null
                  })()}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold leading-snug text-fg">
                      {paper.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {/* The author's own name is marked so a reader can see the
                          co-authorship without reading the whole list. */}
                      {paper.authors.map((author, i) => (
                        <span key={author}>
                          {i > 0 && ', '}
                          <span className={author === profile.name ? 'text-fg/90' : undefined}>
                            {author}
                          </span>
                        </span>
                      ))}
                    </p>
                    <p className="mt-1 font-mono text-xs text-accentAlt">
                      {paper.venue} · {paper.year}
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-muted">{paper.abstract}</p>

                    <p className="xp-bevel-in mt-3 bg-bg/50 px-3 py-2 text-sm leading-relaxed text-fg/85">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                        My part:{' '}
                      </span>
                      {paper.contribution}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <LinkButton href={paper.pdf} size="sm" variant="outline" external>
                        Read the PDF
                      </LinkButton>
                      {paper.doi && (
                        <LinkButton href={paper.doi} size="sm" variant="ghost" external>
                          DOI
                        </LinkButton>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
