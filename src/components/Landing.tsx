import { motion } from 'framer-motion'
import { experience, profile, publications } from '@/data'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Chip, InstitutionMark, LinkButton } from './ui'
import type { World } from '@/types'

interface Door {
  world: World
  kicker: string
  title: string
  blurb: string
  how: string
  bullets: string[]
}

/**
 * Each door states its interaction model up front. Both worlds are unusual
 * enough that dropping someone into one unannounced would read as broken
 * rather than deliberate.
 */
const DOORS: Door[] = [
  {
    world: 'game',
    kicker: 'Game development',
    title: 'The Game World',
    blurb:
      'A 3D arena you actually move around in. You start as a shell-less test subject; every piece of my game work is a shell standing on the grid, and you take them over to read it.',
    how: 'Drive with WASD or the arrow keys, then press E to possess.',
    bullets: ['Shellscape', 'Jump the Gun', 'Studio work & jams'],
  },
  {
    world: 'engineer',
    kicker: 'Software engineering',
    title: 'The Engineer World',
    blurb:
      'A console. Nothing scrolls — you navigate by typing commands, the way you would explore any unfamiliar machine you had just been handed a shell on.',
    how: 'Type `help` at the prompt, or click a command and press Enter.',
    bullets: ['DailyCodeforce', 'Robinhood Portfolio Bot', 'Research & systems work'],
  },
]

/**
 * The mark for the position a paper came out of. Papers carry `experienceId`
 * rather than their own logo so the institution is defined once, in
 * `experience.ts`.
 */
const logoForPaper = (experienceId?: string) =>
  experienceId ? experience.find((e) => e.id === experienceId)?.logo : undefined

export function Landing() {
  const { enterWorld, reducedMotion, theme } = useWorld()

  const fade = (delay: number) =>
    reducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { ...theme.motionSpring, delay },
        }

  return (
    <div className="relative" data-world="landing">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] bg-[radial-gradient(ellipse_at_50%_-10%,rgb(var(--c-accent)/0.18),transparent_55%),radial-gradient(ellipse_at_15%_100%,rgb(var(--c-accent-alt)/0.14),transparent_50%)]"
      />

      <section
        id="landing"
        aria-labelledby="landing-heading"
        className="mx-auto w-full max-w-5xl px-5 pb-24 pt-28 sm:px-8 md:pt-32"
      >
        <motion.p
          {...fade(0)}
          className="mb-5 font-mono text-xs uppercase tracking-[0.35em] text-accent"
        >
          {profile.location} · {profile.roles.join(' · ')}
        </motion.p>

        <motion.h1
          {...fade(0.05)}
          id="landing-heading"
          className="font-display text-[clamp(2.5rem,9vw,5.5rem)] font-bold leading-[1] tracking-tight text-fg"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          {...fade(0.1)}
          className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-fg/80 sm:text-xl"
        >
          {profile.tagline}
        </motion.p>

        {/* The doors are below the bio, so signpost them from the first screen. */}
        <motion.div {...fade(0.13)} className="mt-8">
          <a
            href="#worlds"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-world border border-accent/50 bg-accent/10 px-5 font-display text-sm font-semibold text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Two worlds to explore — pick one
            <span aria-hidden="true">↓</span>
          </a>
        </motion.div>

        {/* About me — the landing is the only place the full bio lives. */}
        <motion.div {...fade(0.15)} id="about-me" className="mt-12 max-w-3xl scroll-mt-24">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">About me</h2>

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,180px)_1fr] sm:gap-8">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={`Portrait of ${profile.name}`}
                width={400}
                height={400}
                /* Above the fold on the landing, so it is not lazy. */
                decoding="async"
                className="aspect-square w-full max-w-[180px] rounded-world border border-line/70 object-cover"
              />
            )}
            <div className="space-y-4 text-base leading-relaxed text-muted">
              {profile.bio.map((paragraph, i) => (
                <p key={i} className={i === 0 ? 'text-lg text-fg/90' : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {profile.today && (
            <p className="mt-5 border-l-2 border-accent/60 pl-4 text-base leading-relaxed text-fg/85">
              {profile.today}
            </p>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <li key={interest}>
                  <Chip>{interest}</Chip>
                </li>
              ))}
            </ul>
          )}

          {/* Papers sit on the landing rather than inside a world: they are a
              credential like the resume, so they should be reachable before
              anyone commits to the console or the arena. The console has a
              `papers` command as well. */}
          {publications.length > 0 && (
            <div id="research" className="mt-8 scroll-mt-24">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                Published research
              </h3>
              <ul className="mt-4 space-y-5">
                {publications.map((paper) => (
                  <li key={paper.id} className="flex gap-4 border-l-2 border-line pl-4">
                    {(() => {
                      const logo = logoForPaper(paper.experienceId)
                      return logo ? <InstitutionMark logo={logo} className="mt-1" /> : null
                    })()}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-semibold leading-snug text-fg">
                        {paper.title}
                      </p>
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
                      <p className="mt-1 font-mono text-xs text-muted">
                        {paper.venue} · {paper.year}
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
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {profile.resumeUrl && (
              <LinkButton href={profile.resumeUrl} size="sm" variant="ghost" external>
                Resume
              </LinkButton>
            )}
            {profile.socials.map((social) => (
              <LinkButton
                key={social.url}
                href={social.url}
                size="sm"
                variant="ghost"
                external={!social.url.startsWith('mailto:')}
              >
                {social.label}
              </LinkButton>
            ))}
          </div>
        </motion.div>

        {/* The two doors. */}
        <motion.div {...fade(0.2)} id="worlds" className="mt-16 scroll-mt-24">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Pick a world</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            My work is split across two of them. Same person, two very different ways to look around
            — and you can switch between them at any time from the nav.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {DOORS.map((door, i) => (
              <motion.li key={door.world} {...fade(0.25 + i * 0.06)}>
                <button
                  type="button"
                  onClick={() => enterWorld(door.world)}
                  className={cn(
                    'group flex h-full w-full flex-col rounded-world border border-line/70 bg-surface/70 p-6 text-left',
                    'backdrop-blur-md transition-[border-color,transform,box-shadow] duration-200',
                    'hover:-translate-y-1 hover:border-accent/70 hover:shadow-glow',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  )}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                    {door.kicker}
                  </span>
                  <span className="mt-3 font-display text-2xl font-bold tracking-tight text-fg transition-colors group-hover:text-accent sm:text-3xl">
                    {door.title}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">{door.blurb}</span>

                  <span className="mt-4 rounded-md border border-line/60 bg-bg/50 px-3 py-2 font-mono text-xs leading-relaxed text-fg/80">
                    <span className="text-accentAlt">How:</span> {door.how}
                  </span>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {door.bullets.map((b) => (
                      <li key={b}>
                        <Chip>{b}</Chip>
                      </li>
                    ))}
                  </ul>

                  <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-accent">
                    Enter
                    <span
                      aria-hidden="true"
                      className={cn(
                        'transition-transform duration-200',
                        !reducedMotion && 'group-hover:translate-x-1',
                      )}
                    >
                      →
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>
    </div>
  )
}
