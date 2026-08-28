import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '@/data'
import { useWorld } from '@/lib/world-context'
import { cn } from '@/lib/cn'
import {
  bannerLines,
  commands,
  completeCommand,
  quickCommands,
  runCommand,
  type ConsoleLine,
} from '@/lib/console-commands'

interface Entry {
  id: number
  /** The echoed prompt line, when this entry came from a submitted command. */
  input?: string
  lines: ConsoleLine[]
}

const PROMPT = 'visitor@jose:~$'

/** Renders one structured output line. Everything here stays real DOM. */
function Line({ line }: { line: ConsoleLine }) {
  switch (line.kind) {
    case 'blank':
      return <div className="h-3" aria-hidden="true" />

    case 'rule':
      return <div className="my-2 border-t border-line/60" aria-hidden="true" />

    case 'heading':
      return (
        <h3 className="mt-1 font-mono text-sm font-bold uppercase tracking-[0.2em] text-accent">
          {line.text}
        </h3>
      )

    case 'kv':
      return (
        <p className="font-mono text-sm">
          <span className="text-muted">{line.key.padEnd(10, ' ')}</span>
          <span className="text-fg">{line.value}</span>
        </p>
      )

    case 'bullet':
      return (
        <p className="flex gap-2 font-mono text-sm leading-relaxed text-fg/90">
          <span aria-hidden="true" className="select-none text-accent">
            -
          </span>
          <span>{line.text}</span>
        </p>
      )

    case 'link':
      return (
        <p className="font-mono text-sm">
          <a
            href={line.url}
            {...(line.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            className="text-accentAlt underline decoration-line underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {line.label}
          </a>
          {line.external && <span className="sr-only"> (opens in a new tab)</span>}
        </p>
      )

    case 'chips':
      return (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-sm">
          <span className="text-muted">{line.label}:</span>
          {/* Separated, not just spaced: plenty of these items are two or three
              words ("Docker Compose", "Competitive Programming") and without a
              divider the list reads as one run-on string. */}
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {line.items.map((item, i) => (
              <li key={item} className="text-accentAlt">
                {i > 0 && (
                  <span aria-hidden="true" className="mr-2 text-muted/60">
                    ·
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>
      )

    case 'commands':
      return (
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 font-mono text-sm sm:grid-cols-[max-content_1fr]">
          {line.items.map((c) => (
            <div key={c.name} className="contents">
              <dt className="text-accent">
                {c.name}
                {c.args && <span className="text-muted"> {c.args}</span>}
              </dt>
              <dd className="mb-2 text-fg/80 sm:mb-0">{c.help}</dd>
            </div>
          ))}
        </dl>
      )

    case 'projects':
      return (
        <ol className="mt-1 space-y-3 font-mono text-sm">
          {line.items.map(({ index, project }) => (
            <li key={project.id} className="flex gap-3">
              <span className="text-accent">{String(index).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span className="text-fg">{project.title}</span>
                <span className="text-muted"> · {project.year}</span>
                <br />
                <span className="text-fg/70">{project.tagline}</span>
                {project.status && (
                  <>
                    <br />
                    <span className="text-muted">{project.status}</span>
                  </>
                )}
                {/* The links live in the list, not only behind `open` — someone
                    scanning the listing should not have to run a second command
                    to reach the repo or the deployed site. */}
                {project.links.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {project.links.map((l) => (
                      <a
                        key={l.url + l.label}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-accentAlt underline decoration-line underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {l.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ))}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )

    case 'text':
    default: {
      const tone =
        line.tone === 'muted'
          ? 'text-muted'
          : line.tone === 'accent'
            ? 'text-accent'
            : line.tone === 'error'
              ? 'text-red-400'
              : 'text-fg/90'
      return <p className={cn('font-mono text-sm leading-relaxed', tone)}>{line.text}</p>
    }
  }
}

export function Console() {
  const { setWorld, reducedMotion } = useWorld()
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: bannerLines() }])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  // Focus without yanking the page: preventScroll keeps the hero in place.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  // Keep the newest output in view.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      const { lines, effect } = runCommand(trimmed)

      if (effect === 'clear') {
        setEntries([])
      } else {
        setEntries((prev) => [...prev, { id: nextId.current++, input: trimmed, lines }])
      }

      if (trimmed) setHistory((prev) => [...prev, trimmed])
      setHistoryIndex(null)
      setValue('')

      if (effect === 'switch-to-game') {
        window.setTimeout(() => setWorld('game'), reducedMotion ? 0 : 320)
      }
      if (effect === 'open-resume' && profile.resumeUrl) {
        window.open(profile.resumeUrl, '_blank', 'noopener,noreferrer')
      }
    },
    [setWorld, reducedMotion],
  )

  /** Loads a command into the prompt and hands focus back so Enter runs it. */
  const insert = useCallback((name: string) => {
    setValue(name)
    setHistoryIndex(null)
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    // Caret to the end, so typing an argument continues the command.
    window.requestAnimationFrame(() => {
      const end = input.value.length
      input.setSelectionRange(end, end)
    })
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit(value)
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const completed = completeCommand(value)
      if (completed) setValue(completed + ' ')
      return
    }

    // Shell-style history on the arrow keys.
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setValue(history[next] ?? '')
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(null)
        setValue('')
      } else {
        setHistoryIndex(next)
        setValue(history[next] ?? '')
      }
    }
  }

  const commandHelp = useMemo(
    () => new Map(commands.map((c) => [c.name, c.help] as const)),
    [],
  )

  return (
    <section
      id="console"
      aria-labelledby="console-heading"
      className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-24 sm:px-6 md:pt-28"
    >
      <h2 id="console-heading" className="sr-only">
        Interactive console — Engineer World
      </h2>

      {/* Instructions live outside the terminal too, so they are readable
          before anyone works out that this thing is interactive. */}
      <p className="mb-4 font-mono text-xs leading-relaxed text-muted">
        <span className="text-accent">Note:</span> this world is a terminal. Type a command and
        press Enter, or click one of the buttons below the prompt. Start with{' '}
        <code className="text-accentAlt">help</code>.
      </p>

      <div
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        className="overflow-hidden rounded-world border border-line/70 bg-bg/85 shadow-2xl backdrop-blur-md"
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-line/60 bg-surface/70 px-4 py-2.5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
          </span>
          <p className="ml-2 font-mono text-xs text-muted">
            {profile.name.toLowerCase().replace(/\s+/g, '-')} — engineer world — zsh
          </p>
        </div>

        {/* Scrollback */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Console output"
          className="h-[min(60vh,32rem)] space-y-1 overflow-y-auto px-4 py-4 sm:px-6"
        >
          {entries.map((entry) => (
            <div key={entry.id} className="space-y-1">
              {entry.input !== undefined && (
                <p className="font-mono text-sm">
                  <span className="text-accent">{PROMPT}</span>{' '}
                  <span className="text-fg">{entry.input}</span>
                </p>
              )}
              {entry.lines.map((line, i) => (
                <Line key={i} line={line} />
              ))}
            </div>
          ))}

          {/* Prompt */}
          <div className="flex items-center gap-2 pt-2">
            <label htmlFor="console-input" className="shrink-0 font-mono text-sm text-accent">
              {PROMPT}
              <span className="sr-only">Console input. Type a command such as help.</span>
            </label>
            <input
              ref={inputRef}
              id="console-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              aria-describedby="console-hint"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-sm text-fg caret-accent outline-none placeholder:text-muted/60 focus:ring-0"
              placeholder="type a command…"
            />
            {!reducedMotion && (
              <span aria-hidden="true" className="h-4 w-2 animate-blink bg-accent" />
            )}
          </div>
        </div>

        {/*
          Quick commands type the command into the prompt rather than running
          it: the visitor still presses Enter, so clicking teaches the same
          interaction as typing instead of bypassing it.
        */}
        <div className="border-t border-line/60 bg-surface/60 px-4 py-3 sm:px-6">
          <p id="console-hint" className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Click a command, then press <span className="text-accent">Enter</span> to run it
          </p>
          <ul className="flex flex-wrap gap-2">
            {quickCommands.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => insert(name)}
                  title={`${commandHelp.get(name)} — inserts "${name}" at the prompt`}
                  aria-label={`Insert command ${name} at the prompt`}
                  className="inline-flex min-h-[44px] items-center rounded-md border border-line/70 px-3 font-mono text-xs text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
