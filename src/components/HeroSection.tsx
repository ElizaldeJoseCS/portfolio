import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '@/data'
import { useWorld } from '@/lib/world-context'
import { Button, LinkButton } from './ui'
import { cn } from '@/lib/cn'

const ROLE_INTERVAL_MS = 2800

/** Letter-stagger reveal for the name (spec §6.2). */
function StaggeredName({ text }: { text: string }) {
  const { reducedMotion, theme } = useWorld()
  if (reducedMotion) return <>{text}</>

  return (
    <>
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: '0.4em' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...theme.motionSpring, delay: 0.15 + i * 0.025 }}
        >
          {char}
        </motion.span>
      ))}
    </>
  )
}

export function HeroSection() {
  const { world, next, nextTheme, toggleWorld, reducedMotion, theme } = useWorld()
  const [roleIndex, setRoleIndex] = useState(0)

  // Rotating role line. Frozen under reduced motion — the first role stays.
  useEffect(() => {
    if (reducedMotion || profile.roles.length < 2) return
    const id = window.setInterval(
      () => setRoleIndex((i) => (i + 1) % profile.roles.length),
      ROLE_INTERVAL_MS,
    )
    return () => window.clearInterval(id)
  }, [reducedMotion])

  const role = profile.roles[roleIndex] ?? profile.roles[0] ?? ''

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-5 pb-24 pt-28 sm:px-8"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0.2 : 0.6 }}
        className="mb-6 font-mono text-xs uppercase tracking-[0.4em] text-accent"
      >
        {profile.location} · Available for work
      </motion.p>

      <h1
        id="hero-heading"
        className="font-display text-[clamp(2.5rem,11vw,7rem)] font-bold leading-[0.95] tracking-tight text-fg"
      >
        <span className="sr-only">{profile.name}</span>
        <StaggeredName text={profile.name} />
      </h1>

      {/* Rotating role: one live region, crossfaded, announced politely. */}
      <div className="mt-6 flex h-[1.6em] items-center font-display text-xl text-muted sm:text-2xl md:text-3xl">
        <span aria-hidden="true" className="mr-3 text-accent">
          /
        </span>
        <span className="relative flex-1" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={role}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              transition={reducedMotion ? { duration: 0.001 } : { duration: 0.28 }}
              className="absolute inset-0 flex items-center text-fg"
            >
              {role}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted sm:text-xl">
        {profile.tagline}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          onClick={toggleWorld}
          aria-label={`Enter the ${nextTheme.label}`}
          className="group"
        >
          Enter the {next === 'game' ? 'Game' : 'Engineer'} World
          <span
            aria-hidden="true"
            className={cn(
              'transition-transform duration-200',
              !reducedMotion && 'group-hover:translate-x-1',
            )}
          >
            →
          </span>
        </Button>
        <LinkButton href="#projects" size="lg" variant="outline">
          See the work
        </LinkButton>
      </div>

      <p className="mt-8 max-w-xl font-mono text-xs leading-relaxed text-muted/80">
        You are in the <span className="text-accent">{theme.label}</span>. Same work, different
        lens — flip it any time from the nav.
      </p>

      {/* Scroll indicator. Decorative; the nav already provides real navigation. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 mx-auto flex w-fit flex-col items-center gap-2 text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          className="block h-8 w-px bg-gradient-to-b from-accent to-transparent"
          animate={reducedMotion ? undefined : { scaleY: [0.4, 1, 0.4], originY: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <span className="sr-only" data-testid="current-world">
        Current world: {world}
      </span>
    </section>
  )
}
