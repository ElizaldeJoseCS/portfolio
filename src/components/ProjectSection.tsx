import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects as allProjects } from '@/data'
import type { Project } from '@/types'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Section } from './ui'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'

/**
 * Only rendered in the Game World — the Engineer World lists its own
 * (software-only) projects through the console. So this section is game work
 * plus anything tagged `both`; software projects are deliberately absent.
 */
export function ProjectSection() {
  const { theme, reducedMotion } = useWorld()
  const [openProject, setOpenProject] = useState<Project | null>(null)

  const visible = useMemo(() => {
    const list = allProjects.filter((p) => p.worlds.includes('game') || p.worlds.includes('both'))
    return [...list].sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        // parseInt so a range like "2024 — Present" still sorts on its year.
        parseInt(b.year, 10) - parseInt(a.year, 10),
    )
  }, [])

  // The 2-wide "bento" treatment only reads well once there are enough cards to
  // fill the row it leaves open; below that, an even grid looks deliberate.
  const bento = visible.length > 2

  return (
    <>
      <Section
        id="projects"
        eyebrow="01 — Selected work"
        title="Projects"
        lead="Games I have shipped and games still in the shop. Open any card for the long version — role, stack, and links."
      >
        <p className="mb-8 font-mono text-xs text-muted">
          Showing {visible.length} game project{visible.length === 1 ? '' : 's'}. My software
          engineering work lives in the Engineer World — switch worlds in the nav to browse it in a
          console.
        </p>

        <motion.ul
          layout={!reducedMotion}
          transition={reducedMotion ? { duration: 0.001 } : theme.motionSpring}
          // `grid-flow-row-dense` lets standard cards backfill the column a
          // featured (2-wide) card leaves empty, so the bento has no holes.
          className={cn(
            'grid grid-flow-row-dense grid-cols-1 gap-5 sm:grid-cols-2',
            bento && 'lg:grid-cols-3',
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                featured={bento && project.featured}
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
