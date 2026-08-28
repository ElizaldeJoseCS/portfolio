import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Project } from '@/types'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Chip, LinkButton } from './ui'
import { ProjectEmbed } from './ProjectEmbed'

// The WebGL demo viewer pulls three.js in — only loaded if a project uses it.
const ProjectWebglDemo = lazy(() =>
  import('./ProjectWebglDemo').then((m) => ({ default: m.ProjectWebglDemo })),
)

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { theme, reducedMotion } = useWorld()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const [mediaIndex, setMediaIndex] = useState(0)

  useEffect(() => setMediaIndex(0), [project?.id])

  // Focus management + trap: required for the a11y pass in spec §8.
  useEffect(() => {
    if (!project) return
    restoreFocusTo.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    panel?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (!items.length) return
      const first = items[0]!
      const last = items[items.length - 1]!
      const activeEl = document.activeElement
      if (e.shiftKey && (activeEl === first || activeEl === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      restoreFocusTo.current?.focus?.()
    }
  }, [project, onClose])

  const step = useCallback(
    (delta: number) => {
      if (!project) return
      setMediaIndex((i) => (i + delta + project.media.length) % project.media.length)
    },
    [project],
  )

  return (
    <AnimatePresence>
      {project && (
        // The outer element must be a motion component with a key: AnimatePresence
        // only runs exit animations on direct children it can animate, and exit
        // propagates from here down to the panel below.
        <motion.div
          key="project-modal"
          role="presentation"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.001 : 0.2 }}
        >
          <div
            className="absolute inset-0 bg-bg/85 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            tabIndex={-1}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={reducedMotion ? { duration: 0.15 } : theme.motionSpring}
            className={cn(
              'relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden',
              'rounded-t-world border border-line/70 bg-surface/95 shadow-2xl backdrop-blur-xl',
              'sm:rounded-world focus-visible:outline-none',
            )}
          >
            <header className="flex items-start gap-4 border-b border-line/60 p-5 sm:p-6">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                  {project.role} · {project.year}
                </p>
                <h2
                  id="project-modal-title"
                  className="mt-2 font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl"
                >
                  {project.title}
                </h2>
                <p className="mt-2 text-sm text-muted">{project.tagline}</p>
                {project.status && (
                  <p className="mt-2 font-mono text-[11px] text-accentAlt">{project.status}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close project details"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-world border border-line/70 text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ×
                </span>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {project.media.length > 0 && (
                <figure className="mb-6">
                  <div className="relative overflow-hidden rounded-world border border-line/60 bg-surfaceAlt">
                    <MediaFrame project={project} index={mediaIndex} />
                    {project.media.length > 1 && (
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-bg/90 to-transparent p-2">
                        <button
                          type="button"
                          onClick={() => step(-1)}
                          aria-label="Previous media"
                          className="h-11 w-11 rounded-world text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span aria-hidden="true">‹</span>
                        </button>
                        <p className="font-mono text-[11px] text-muted" aria-live="polite">
                          {mediaIndex + 1} / {project.media.length}
                        </p>
                        <button
                          type="button"
                          onClick={() => step(1)}
                          aria-label="Next media"
                          className="h-11 w-11 rounded-world text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span aria-hidden="true">›</span>
                        </button>
                      </div>
                    )}
                  </div>
                </figure>
              )}

              <p className="whitespace-pre-line text-base leading-relaxed text-muted">
                {project.description}
              </p>

              {/* The long form. Sections come from `details` in src/data, so a
                  project gets more verbose without this component changing. */}
              {project.details?.map((section) => (
                <section key={section.heading} className="mt-8">
                  <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                    {section.heading}
                  </h3>
                  {section.body && (
                    <p className="mt-3 text-base leading-relaxed text-muted">{section.body}</p>
                  )}
                  {section.bullets && (
                    <ul className="mt-3 space-y-2">
                      {section.bullets.map((b) => (
                        <li key={b} className="flex gap-3 text-base leading-relaxed text-muted">
                          <span aria-hidden="true" className="select-none text-accent">
                            —
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-accent">
                Tech stack
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <li key={tech}>
                    <Chip tone="alt">{tech}</Chip>
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-accent">Tags</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Chip>{tag}</Chip>
                  </li>
                ))}
              </ul>
            </div>

            {project.links.length > 0 && (
              <footer className="flex flex-wrap gap-3 border-t border-line/60 p-5 sm:p-6">
                {project.links.map((link, i) => (
                  <LinkButton
                    key={link.url + link.label}
                    href={link.url}
                    external
                    variant={i === 0 ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {link.label}
                  </LinkButton>
                ))}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MediaFrame({ project, index }: { project: Project; index: number }) {
  const media = project.media[index]
  if (!media) return null

  if (media.type === 'video' && media.src) {
    return (
      <video
        src={media.src}
        poster={media.poster}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
      >
        <track kind="captions" />
      </video>
    )
  }

  if (media.type === 'embed') {
    return <ProjectEmbed media={media} title={project.title} />
  }

  if (media.type === 'webgl') {
    return (
      <Suspense
        fallback={
          <div className="flex aspect-video w-full items-center justify-center font-mono text-xs text-muted">
            Loading demo…
          </div>
        }
      >
        <ProjectWebglDemo glb={media.glb} />
      </Suspense>
    )
  }

  return (
    <img
      src={media.src}
      alt={media.alt ?? `${project.title} screenshot ${index + 1}`}
      loading="lazy"
      decoding="async"
      className="aspect-video w-full object-cover"
    />
  )
}
