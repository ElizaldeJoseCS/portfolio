import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { experience, profile, publications } from '@/data'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import { Chip, InstitutionMark, LinkButton, SocialIcon } from './ui'
import { XpMenuBar, XpPanel, XpTaskbar, XpVisitorCounter, XpWindow } from './xp'
import type { XpMenuItem } from './xp'
import type { World } from '@/types'

interface Door {
  world: World
  kicker: string
  title: string
  file: string
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
    file: 'game_world.exe',
    blurb:
      'A 3D arena you actually move around in. You start as a shell-less test subject; every piece of my game work is a shell standing on the grid, and you take them over to read it.',
    how: 'Drive with WASD or the arrow keys, then press E to possess.',
    bullets: ['Shellscape', 'Jump the Gun', 'Studio work & jams'],
  },
  {
    world: 'engineer',
    kicker: 'Software engineering',
    title: 'The Engineer World',
    file: 'engineer_world.exe',
    blurb:
      'A console. Nothing scrolls — you navigate by typing commands, the way you would explore any unfamiliar machine you had just been handed a shell on.',
    how: 'Type `help` at the prompt, or click a command and press Enter.',
    bullets: ['DailyCodeforce', 'Robinhood Portfolio Bot', 'Research & systems work'],
  },
]

const MENU: XpMenuItem[] = [
  { id: 'about-me', label: 'About' },
  { id: 'research', label: 'Research' },
  { id: 'worlds', label: 'Worlds' },
  { id: 'elsewhere', label: 'Links' },
]

/**
 * Only the main column's sections drive the highlight.
 *
 * `elsewhere` is a sidebar panel, and the sidebar is sticky — its heading sits
 * in the middle of the viewport almost permanently, so including it meant
 * "Links" lit up while you were reading the worlds section. A jump target is
 * not a scroll position.
 */
const TRACKED_IDS = ['about-me', 'research', 'worlds']

/**
 * The mark for the position a paper came out of. Papers carry `experienceId`
 * rather than their own logo so the institution is defined once, in
 * `experience.ts`.
 */
const logoForPaper = (experienceId?: string) =>
  experienceId ? experience.find((e) => e.id === experienceId)?.logo : undefined

/** Which menu item to light up, from whichever section is under the bar. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!targets.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [ids])

  return active
}

/** Section heading in the main column, as a 2077 data-shard label. */
function ShardHeading({ id, children }: { id?: string; children: string }) {
  return (
    <h2
      id={id}
      className="xp-notch mb-5 bg-gradient-to-r from-accent/25 to-transparent px-3 py-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-accent"
    >
      <span aria-hidden="true" className="mr-2 text-accentAlt">
        &gt;&gt;
      </span>
      {children}
    </h2>
  )
}

export function Landing() {
  const { enterWorld, reducedMotion, theme } = useWorld()
  const active = useActiveSection(TRACKED_IDS)

  const fade = (delay: number) =>
    reducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { ...theme.motionSpring, delay },
        }

  return (
    <div className="relative" data-world="landing">
      {/*
        The desktop the window sits on. Yellow bloom from above, cyan from the
        lower left, over a faint engineering grid — 2077's palette doing the
        job XP's Bliss wallpaper did.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] bg-[radial-gradient(ellipse_at_50%_-10%,rgb(var(--c-accent)/0.16),transparent_55%),radial-gradient(ellipse_at_10%_100%,rgb(var(--c-accent-alt)/0.13),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] opacity-[0.07] bg-[linear-gradient(rgb(var(--c-accent-alt))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--c-accent-alt))_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      {/* pb: clearance for the fixed taskbar. */}
      <div className="mx-auto w-full max-w-6xl px-2 pb-24 pt-3 sm:px-5 sm:pt-6">
        <XpWindow
          title="jose.elizalde"
          subtitle="netrunner_blog"
          menu={<XpMenuBar items={MENU} active={active} />}
          status={<StatusTicker />}
        >
          <div className="p-3 sm:p-5">
            <Masthead fade={fade} />

            {/*
              Source order is content-then-sidebar, and the grid moves the
              sidebar back to the left on wide screens. Laying it out in visual
              order instead put five sidebar panels between the masthead and
              the first paragraph of the bio on a phone — about 1,500px of
              scrolling before the page said anything.
            */}
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6">
              <main className="min-w-0 lg:order-2">
                <MainColumn fade={fade} onEnter={enterWorld} reducedMotion={reducedMotion} />
              </main>
              <div className="min-w-0 lg:order-1">
                <Sidebar />
              </div>
            </div>
          </div>
        </XpWindow>
      </div>

      <XpTaskbar />
    </div>
  )
}

/* ------------------------------------------------------------------ sidebar */

function Sidebar() {
  return (
    <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[7.5rem] lg:self-start">
      {profile.today && (
        <XpPanel title="Currently">
          <p className="text-[13px] leading-relaxed text-fg/85">{profile.today}</p>
        </XpPanel>
      )}

      {profile.interests && profile.interests.length > 0 && (
        <XpPanel title="Interests">
          <ul className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <li key={interest}>
                {/* Square, like everything else on this landing. */}
                <Chip className="rounded-none">{interest}</Chip>
              </li>
            ))}
          </ul>
        </XpPanel>
      )}

      {/*
        Named "Links" to match the menu item that targets it. It was "Elsewhere",
        which collided with the footer's own "Elsewhere" heading and left the
        page with two identically named sections and an sr-only third.
      */}
      <XpPanel title="Links" id="elsewhere">
        <ul className="space-y-1">
          {profile.socials.map((social) => (
            <li key={social.url}>
              <a
                href={social.url}
                {...(social.url.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noreferrer noopener' })}
                className="flex min-h-[44px] items-center gap-2.5 px-1 text-[13px] text-fg/85 transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <SocialIcon name={social.icon} className="h-4 w-4 shrink-0" />
                {social.label}
                {!social.url.startsWith('mailto:') && (
                  <span aria-hidden="true" className="ml-auto text-[10px] opacity-60">
                    ↗
                  </span>
                )}
              </a>
            </li>
          ))}
          {profile.resumeUrl && (
            <li>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex min-h-[44px] items-center gap-2.5 px-1 text-[13px] text-fg/85 transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-center">
                  ▤
                </span>
                Resume (PDF)
                <span aria-hidden="true" className="ml-auto text-[10px] opacity-60">
                  ↗
                </span>
              </a>
            </li>
          )}
        </ul>
      </XpPanel>

      <XpPanel title="Counter">
        <XpVisitorCounter />
      </XpPanel>
    </div>
  )
}

/* ----------------------------------------------------------------- masthead */

/**
 * The blog's masthead, spanning the full width of the window under the menu
 * bar — which is where a 2003 personal site put its banner, above the split
 * into sidebar and posts.
 *
 * The portrait lives here rather than in the sidebar so that it stays next to
 * the name at every width. In the sidebar it was either beside the bio (fine)
 * or a thousand pixels above it (not).
 */
function Masthead({ fade }: { fade: Fade }) {
  return (
    <motion.div
      {...fade(0)}
      className="xp-bevel-in flex flex-col gap-5 bg-bg/50 px-4 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-6 sm:py-8"
    >
      {profile.avatarUrl && (
        <img
          src={profile.avatarUrl}
          alt={`Portrait of ${profile.name}`}
          width={400}
          height={400}
          /* Above the fold on the landing, so it is not lazy. */
          decoding="async"
          className="xp-bevel mx-auto aspect-square w-full max-w-[11rem] shrink-0 object-cover sm:mx-0 sm:w-40"
        />
      )}

      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accentAlt">
          {profile.location} · {profile.roles.join(' · ')}
        </p>
        <h1
          id="landing-heading"
          className="mt-3 font-display text-[clamp(1.9rem,6.5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-fg"
        >
          {profile.name}
        </h1>
        <div aria-hidden="true" className="xp-hazard mt-4 h-1.5 w-28 opacity-90" />
        <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-fg/85 sm:text-lg">
          {profile.tagline}
        </p>
      </div>
    </motion.div>
  )
}

/* -------------------------------------------------------------- main column */

type Fade = (delay: number) => Record<string, unknown>

function MainColumn({
  fade,
  onEnter,
  reducedMotion,
}: {
  fade: Fade
  onEnter: (w: World) => void
  reducedMotion: boolean
}) {
  return (
    <div id="landing" className="min-w-0">
      {/* About me — the landing is the only place the full bio lives. */}
      <motion.section {...fade(0.08)} className="scroll-mt-28">
        <ShardHeading id="about-me">Who is this guy?</ShardHeading>
        <div className="space-y-4 text-[15px] leading-relaxed text-muted">
          {profile.bio.map((paragraph, i) => (
            <p key={i} className={i === 0 ? 'text-base text-fg/90' : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      </motion.section>

      {/* Papers sit on the landing rather than inside a world: they are a
          credential like the resume, so they should be reachable before anyone
          commits to the console or the arena. The console has a `papers`
          command as well. */}
      {publications.length > 0 && (
        <motion.section {...fade(0.12)} className="mt-10 scroll-mt-28">
          <ShardHeading id="research">Published research</ShardHeading>
          <ul className="space-y-4">
            {publications.map((paper) => (
              <li key={paper.id} className="xp-bevel bg-bg/40 p-4">
                <div className="flex gap-4">
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
                    <p className="mt-1 font-mono text-xs text-accentAlt">
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
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* The two doors. */}
      <motion.section {...fade(0.16)} className="mt-10 scroll-mt-28">
        <ShardHeading id="worlds">Pick a world</ShardHeading>
        <p className="-mt-1 mb-5 max-w-2xl text-sm leading-relaxed text-muted">
          My work is split across two of them. Same person, two very different ways to look around —
          and you can switch between them at any time, or from the taskbar below.
        </p>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DOORS.map((door) => (
            <li key={door.world}>
              <button
                type="button"
                onClick={() => onEnter(door.world)}
                className={cn(
                  'xp-bevel group flex h-full w-full flex-col bg-surfaceAlt p-0 text-left',
                  'transition-colors duration-200 hover:border-accent/60',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                )}
              >
                {/* Each door is its own little window, title bar and all. */}
                <span className="xp-titlebar flex w-full items-center gap-2 px-2 py-1">
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-bg">
                    {door.file}
                  </span>
                  <span aria-hidden="true" className="font-mono text-[10px] text-bg/70">
                    – □ ✕
                  </span>
                </span>

                <span className="flex flex-1 flex-col p-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accentAlt">
                    {door.kicker}
                  </span>
                  <span className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-fg transition-colors group-hover:text-accent sm:text-2xl">
                    {door.title}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">{door.blurb}</span>

                  <span className="xp-bevel-in mt-4 block bg-bg/60 px-3 py-2 font-mono text-xs leading-relaxed text-fg/80">
                    <span className="text-accentAlt">How:</span> {door.how}
                  </span>

                  <span className="mt-4 flex flex-wrap gap-1.5">
                    {door.bullets.map((b) => (
                      <Chip key={b} className="rounded-none">
                        {b}
                      </Chip>
                    ))}
                  </span>

                  <span
                    className={cn(
                      'xp-notch mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 self-start bg-accent px-5',
                      'font-display text-sm font-bold uppercase tracking-wide text-bg',
                      'transition-colors group-hover:bg-accentAlt',
                    )}
                  >
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
                </span>
              </button>
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  )
}

/* --------------------------------------------------------------- status bar */

/**
 * The status bar ticker. Every 2003 blog had a marquee; 2077 has news crawls
 * at the bottom of every screen. Same element, twenty years apart.
 *
 * The strip is duplicated because the `marquee` keyframe translates by -50% —
 * the copy is what makes the loop seamless — and the duplicate is hidden from
 * assistive tech so the sentence is not announced twice. The blanket
 * reduced-motion rule in globals.css freezes it on the first copy.
 */
function StatusTicker() {
  const items = [
    profile.today,
    `${profile.roles.join(' · ')} — ${profile.location}`,
    'Two worlds below: drive an arena, or type at a console.',
  ].filter(Boolean) as string[]

  const strip = (
    <span className="flex shrink-0 items-center gap-8 pr-8 font-mono text-[11px] text-muted">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-8">
          <span aria-hidden="true" className="text-accent">
            ◆
          </span>
          {item}
        </span>
      ))}
    </span>
  )

  return (
    <div className="flex items-stretch">
      <div className="flex min-w-0 flex-1 items-center overflow-hidden py-1.5 pl-3">
        <div className="flex w-max animate-marquee items-center">
          {strip}
          <span aria-hidden="true" className="contents">
            {strip}
          </span>
        </div>
      </div>
      <p className="hidden shrink-0 items-center border-l-2 border-bg px-3 font-mono text-[11px] text-muted sm:flex">
        <span aria-hidden="true" className="mr-1.5 text-accentAlt">
          ●
        </span>
        online
      </p>
    </div>
  )
}
