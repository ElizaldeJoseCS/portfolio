import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects as allProjects } from '@/data'
import type { Project, WorldTag } from '@/types'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Section } from './ui'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'

type Filter = 'all' | 'game' | 'swe'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Game Dev' },
  { id: 'swe', label: 'Software' },
]

const matches = (worlds: WorldTag[], filter: Filter) =>
  filter === 'all' || worlds.includes(filter) || worlds.includes('both')

export function ProjectSection() {
  const { world, theme, reducedMotion } = useWorld()
  // Default the filter to the world you're standing in; still user-overridable.
  const [filter, setFilter] = useState<Filter>('all')
  const [openProject, setOpenProject] = useState<Project | null>(null)

  const visible = useMemo(() => {
    const list = allProjects.filter((p) => matches(p.worlds, filter))
    // Surface the current world's work first without hiding anything.
    const bias: WorldTag = world === 'game' ? 'game' : 'swe'
    return [...list].sort((a, b) => {
      const score = (p: Project) =>
        (p.featured ? 2 : 0) + (p.worlds.includes(bias) || p.worlds.includes('both') ? 1 : 0)
      return score(b) - score(a) || Number(b.year) - Number(a.year)
    })
  }, [filter, world])

  return (
    <>
      <Section
        id="projects"
        eyebrow="01 — Selected work"
        title="Projects"
        lead="Games, tools, and the systems underneath them. Open any card for the long version — stack, role, and links."
      >
        <div
          role="group"
          aria-label="Filter projects by discipline"
          className="mb-8 flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  'min-h-[44px] rounded-full border px-4 font-display text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  active
                    ? 'border-accent bg-accent text-bg'
                    : 'border-line/80 text-muted hover:border-accent/60 hover:text-fg',
                )}
              >
                {f.label}
              </button>
            )
          })}
          <p className="ml-auto self-center font-mono text-xs text-muted" aria-live="polite">
            {visible.length} project{visible.length === 1 ? '' : 's'}
          </p>
        </div>

        <motion.ul
          layout={!reducedMotion}
          transition={reducedMotion ? { duration: 0.001 } : theme.motionSpring}
          // `grid-flow-row-dense` lets standard cards backfill the column a
          // featured (2-wide) card leaves empty, so the bento has no holes.
          className="grid grid-flow-row-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                featured={project.featured}
                onOpen={setOpenProject}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </Section>

      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
    </>
  )
}
