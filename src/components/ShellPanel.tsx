import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { shellContent, useHub } from '@/lib/hub-context'
import { useWorld } from '@/lib/world-context'
import { Chip, LinkButton } from './ui'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmtDate = (v: string) => {
  if (v === 'Present') return 'Present'
  const [year, month] = v.split('-')
  const idx = Number(month) - 1
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : (year ?? v)
}

/**
 * What you see while inside a shell. A dialog rather than an inline panel: the
 * arena is frozen behind it, so trapping focus here is both the accessible and
 * the honest representation of the state.
 */
export function ShellPanel() {
  const { shells, possessedId, release } = useHub()
  const { reducedMotion, theme } = useWorld()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const shell = shells.find((s) => s.id === possessedId) ?? null

  useEffect(() => {
    if (!shell) return
    restoreTo.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    // Escape is handled by the hub (it also releases possession); here we only
    // keep Tab inside the panel.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (!items.length) return
      const first = items[0]!
      const last = items[items.length - 1]!
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      restoreTo.current?.focus?.()
    }
  }, [shell])

  return (
    <AnimatePresence>
      {shell && (
        <motion.div
          key="shell-panel"
          role="presentation"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.001 : 0.2 }}
        >
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={release} aria-hidden="true" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shell-panel-title"
            tabIndex={-1}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
            transition={reducedMotion ? { duration: 0.15 } : theme.motionSpring}
            // text-left: the arena stage centres its copy, and that alignment
            // must not leak into the panel's body text.
            className="relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-world border border-accent/50 bg-surface/95 text-left shadow-glow backdrop-blur-xl focus-visible:outline-none sm:rounded-world"
          >
            <header className="flex items-start gap-4 border-b border-line/60 p-5 sm:p-6">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                  Possessing · {shell.subtitle}
                </p>
                <h2
                  id="shell-panel-title"
                  className="mt-2 font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl"
                >
                  {shell.label}
                </h2>
              </div>
              <button
                type="button"
                onClick={release}
                aria-label="Let go of this shell"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-world border border-line/70 px-3 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <kbd className="font-mono">Esc</kbd> let go
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <ShellBody shell={shell} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ShellBody({ shell }: { shell: NonNullable<ReturnType<typeof useHub>['shells'][number]> }) {
  const content = shellContent(shell)

  if (content.type === 'project') {
    const p = content.project
    const cover = p.media.find((m) => m.type === 'image')
    return (
      <>
        {cover?.src && (
          <img
            src={cover.src}
            alt={cover.alt ?? ''}
            loading="lazy"
            decoding="async"
            className="mb-6 aspect-video w-full rounded-world border border-line/60 object-cover"
          />
        )}
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {p.role} · {p.year}
        </p>
        <p className="mt-3 text-base leading-relaxed text-fg/90">{p.tagline}</p>
        <p className="mt-4 text-base leading-relaxed text-muted">{p.description}</p>

        <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-accent">Stack</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {p.techStack.map((t) => (
            <li key={t}>
              <Chip tone="alt">{t}</Chip>
            </li>
          ))}
        </ul>

        {p.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {p.links.map((l, i) => (
              <LinkButton
                key={l.url + l.label}
                href={l.url}
                external
                size="sm"
                variant={i === 0 ? 'primary' : 'outline'}
              >
                {l.label}
              </LinkButton>
            ))}
          </div>
        )}
      </>
    )
  }

  if (content.type === 'experience') {
    return (
      <ol className="space-y-6">
        {content.entries.map((e) => (
          <li key={e.id}>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              {fmtDate(e.start)} — {fmtDate(e.end)}
              {e.location ? ` · ${e.location}` : ''}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold text-fg">{e.role}</h3>
            <p className="text-sm text-muted">{e.company}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {e.description.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {e.skills.map((sk) => (
                <li key={sk}>
                  <Chip>{sk}</Chip>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    )
  }

  if (content.type === 'skills') {
    return (
      <div className="space-y-6">
        {content.groups.map((g) => (
          <div key={g.category}>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              {g.category}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {g.items.map((i) => (
                <li key={i.name}>
                  <Chip level={i.level}>{i.name}</Chip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  const p = content.profile
  return (
    <>
      <a
        href={`mailto:${p.email}`}
        className="inline-block break-all font-display text-xl font-bold tracking-tight text-fg underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent sm:text-3xl"
      >
        {p.email}
      </a>
      <ul className="mt-8 flex flex-wrap gap-3">
        {p.socials.map((s) => (
          <li key={s.url}>
            <LinkButton
              href={s.url}
              external={!s.url.startsWith('mailto:')}
              variant="outline"
              size="sm"
            >
              {s.label}
            </LinkButton>
          </li>
        ))}
        {p.resumeUrl && (
          <li>
            <LinkButton href={p.resumeUrl} external variant="primary" size="sm">
              Resume
            </LinkButton>
          </li>
        )}
      </ul>
      <p className="mt-8 text-sm leading-relaxed text-muted">{p.location}</p>
    </>
  )
}
