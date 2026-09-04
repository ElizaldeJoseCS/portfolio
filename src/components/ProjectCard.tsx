import { useId, useState } from 'react'
import type { Project, Track } from '@/types'
import { cn } from '@/lib/cn'
import { Chip, LinkButton } from './ui'
import { ProjectVideo } from './ProjectVideo'
import { ProjectEmbed } from './ProjectEmbed'

/**
 * Portrait clips need a width cap. `ProjectVideo` is `w-full` with an
 * aspect-ratio, so a 9:16 phone capture at the panel's full width renders
 * about 1,200px tall and pushes the rest of the write-up off screen.
 */
function isPortrait(aspect?: string) {
  if (!aspect) return false // the default is 16 / 9
  const [w, h] = aspect.split('/').map((n) => Number(n.trim()))
  return Boolean(w && h) && w < h
}

const TRACK_BADGE: Record<Track, string> = {
  game: 'Game dev',
  swe: 'Software',
  both: 'Both',
}

/**
 * One project, as an XP window that expands in place.
 *
 * This replaces a modal dialog, which is the main thing the rewrite bought:
 * no focus trap, no scroll lock, no `aria-modal`, no restoring focus to the
 * trigger, no `AnimatePresence` choreography holding an exiting tree in the
 * DOM. A disclosure is a button, a region, and `aria-expanded` — and the
 * expanded copy is real page content that Ctrl+F can find.
 *
 * The summary stays visible while the detail is open, so expanding never moves
 * the thing you just clicked out from under you.
 */
export function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const titleId = `${panelId}-title`

  const cover = project.media.find((m) => m.type === 'image')
  const clips = project.media.filter((m) => m.type === 'video' && m.src)
  const embeds = project.media.filter((m) => m.type === 'embed' && m.src)

  return (
    <article className="xp-bevel bg-surfaceAlt">
      {/* Each project gets its own little title bar. */}
      <div className="xp-titlebar flex items-center gap-2 px-2 py-1">
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-bg">
          {project.id}.exe
        </span>
        {/*
          /85 rather than /75. Dark ink on the accent field is the one place an
          alpha'd foreground lands near the floor: at /75 over the dim stop of
          the header gradient it measured 4.91 against a 4.5 floor, which is
          not margin. Ten percent more ink is invisible here and buys 5.97.
        */}
        <span className="shrink-0 font-mono text-[10px] text-bg/85">{project.year}</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {cover?.src && (
            <img
              src={cover.src}
              alt={cover.alt ?? ''}
              loading="lazy"
              decoding="async"
              className="xp-bevel-in aspect-[16/10] w-full shrink-0 object-cover sm:w-52"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="xp-bevel-in bg-bg/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-accentAlt">
                {TRACK_BADGE[project.track[0] ?? 'both']}
              </span>
              {project.status && (
                <span className="font-mono text-[11px] text-muted">{project.status}</span>
              )}
            </div>

            {/*
              h2, not h3: on the Projects page these are the top-level items
              under the page's h1, and the write-up headings inside the panel
              are the h3s below them.
            */}
            <h2
              id={titleId}
              className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-fg"
            >
              {project.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{project.tagline}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              {project.role} · {project.techStack.slice(0, 4).join(' / ')}
            </p>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.slice(0, 4).map((tag) => (
                <li key={tag}>
                  <Chip className="rounded-none">{tag}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'xp-notch inline-flex min-h-[44px] items-center gap-2 px-4',
              'font-display text-sm font-bold uppercase tracking-wide text-bg',
              'bg-accent transition-colors hover:bg-accentAlt',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            )}
          >
            {open ? 'Close' : 'Read more'}
            <span aria-hidden="true">{open ? '▲' : '▼'}</span>
          </button>

          {project.links.map((link) => (
            <LinkButton key={link.url} href={link.url} size="sm" variant="outline" external>
              {link.label}
            </LinkButton>
          ))}
        </div>

        {/*
          `hidden` rather than unmounting: an <iframe> or a playing <video>
          inside would restart on every toggle otherwise, and the expanded copy
          stays in the DOM for in-page search either way.
        */}
        <div id={panelId} hidden={!open} aria-labelledby={titleId} className="mt-5">
          <div className="xp-bevel-in bg-bg/40 p-4">
            <p className="text-[15px] leading-relaxed text-fg/85">{project.description}</p>

            {embeds.length > 0 && (
              <div className="mt-4 space-y-3">
                {embeds.map((embed) => (
                  <div key={embed.src} className="xp-bevel overflow-hidden">
                    <ProjectEmbed media={embed} title={project.title} />
                  </div>
                ))}
              </div>
            )}

            {clips.length > 0 && (
              <div className="mt-4 space-y-3">
                {clips.map((clip) => (
                  <figure
                    key={clip.src}
                    className={cn(
                      'xp-bevel overflow-hidden',
                      isPortrait(clip.aspect) && 'mx-auto max-w-[20rem]',
                    )}
                  >
                    <ProjectVideo media={clip} />
                    {clip.alt && (
                      <figcaption className="border-t-2 border-bg bg-surfaceAlt px-3 py-2 font-mono text-[11px] leading-relaxed text-muted">
                        {clip.alt}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {project.details?.map((detail) => (
              <section key={detail.heading} className="mt-5">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                  {detail.heading}
                </h3>
                {detail.body && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{detail.body}</p>
                )}
                {detail.bullets && (
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                    {detail.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span aria-hidden="true" className="text-accentAlt">
                          ·
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {project.techStack.length > 0 && (
              <div className="mt-5">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                  Built with
                </h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <li key={tech}>
                      <Chip className="rounded-none">{tech}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
