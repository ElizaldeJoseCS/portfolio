import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { Project, WorldTag } from '@/types'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Chip } from './ui'

const WORLD_BADGE: Record<WorldTag, string> = {
  game: 'Game Dev',
  swe: 'Software',
  both: 'Both worlds',
}

interface ProjectCardProps {
  project: Project
  onOpen: (project: Project) => void
  /** Featured cards span two columns and show a taller media area. */
  featured?: boolean
}

/**
 * Forwards its ref: `AnimatePresence mode="popLayout"` in ProjectSection needs
 * to measure the exiting element, which requires a real ref on the child.
 */
export const ProjectCard = forwardRef<HTMLLIElement, ProjectCardProps>(function ProjectCard(
  { project, onOpen, featured = false },
  ref,
) {
  const { theme, reducedMotion } = useWorld()
  const cover = project.media.find((m) => m.type === 'image')
  const titleId = `project-${project.id}-title`

  return (
    <motion.li
      ref={ref}
      layout={!reducedMotion}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      // Explicit short tween on exit: AnimatePresence waits for the slowest
      // descendant animation, and a loose spring here would hold the whole
      // outgoing world in the DOM for seconds after a world switch.
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, transition: { duration: 0.18 } }}
      transition={reducedMotion ? { duration: 0.001 } : theme.motionSpring}
      className={cn('list-none', featured && 'sm:col-span-2')}
    >
      {/*
        The whole card is one button so keyboard users get a single stop per
        project rather than a nested-interactive maze.
      */}
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-labelledby={titleId}
        aria-haspopup="dialog"
        className={cn(
          'group flex h-full w-full flex-col overflow-hidden rounded-world border border-line/70',
          'bg-surface/70 text-left backdrop-blur-md transition-[border-color,transform,box-shadow] duration-200',
          'hover:-translate-y-1 hover:border-accent/70 hover:shadow-glow',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        )}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden border-b border-line/50 bg-surfaceAlt',
            featured ? 'aspect-[16/8]' : 'aspect-[16/10]',
          )}
        >
          {cover?.src ? (
            <img
              src={cover.src}
              alt={cover.alt ?? ''}
              loading="lazy"
              decoding="async"
              className={cn(
                'h-full w-full object-cover transition-transform duration-500',
                !reducedMotion && 'group-hover:scale-[1.04]',
              )}
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgb(var(--c-accent)/0.35),transparent_60%),radial-gradient(circle_at_75%_80%,rgb(var(--c-accent-alt)/0.3),transparent_55%)]"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full border border-line/70 bg-bg/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent backdrop-blur">
            {WORLD_BADGE[project.worlds[0] ?? 'both']}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              id={titleId}
              className={cn(
                'font-display font-bold tracking-tight text-fg transition-colors group-hover:text-accent',
                featured ? 'text-2xl sm:text-3xl' : 'text-xl',
              )}
            >
              {project.title}
            </h3>
            <span className="shrink-0 font-mono text-xs text-muted">{project.year}</span>
          </div>

          <p className="text-sm leading-relaxed text-muted">{project.tagline}</p>

          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.tags.slice(0, featured ? 5 : 3).map((tag) => (
              <li key={tag}>
                <Chip>{tag}</Chip>
              </li>
            ))}
          </ul>

          <p className="font-mono text-[11px] uppercase tracking-wider text-muted/70">
            {project.role} · {project.techStack.slice(0, 3).join(' / ')}
          </p>
        </div>
      </button>
    </motion.li>
  )
})
