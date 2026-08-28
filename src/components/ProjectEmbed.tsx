import { useState } from 'react'
import type { ProjectMedia } from '@/types'
import { cn } from '@/lib/cn'

/**
 * A third-party iframe — an itch.io HTML5 build, say — behind a poster and a
 * play button.
 *
 * **The iframe is never in the DOM until the visitor asks for it.** A Unity
 * WebGL build is tens of megabytes; mounting it when the modal opens would
 * spend that on every visitor who only wanted to read the write-up. This mirrors
 * what itch.io itself does on a game page, so the interaction is familiar.
 *
 * It is also the reason this stays a separate component from `MediaFrame`:
 * unmounting it on close is what actually stops the game's audio and its frame
 * loop.
 */
export function ProjectEmbed({ media, title }: { media: ProjectMedia; title: string }) {
  const [running, setRunning] = useState(false)

  if (!media.src) return null

  const aspect = media.aspect ?? '16 / 9'
  const label = media.action ?? 'Play'

  if (running) {
    return (
      <iframe
        src={media.src}
        title={media.alt ?? `${title}, playable`}
        // The allowlist itch.io's own embed uses. Gamepad and fullscreen matter
        // for anything actually playable; the rest are what its player expects.
        allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
        allowFullScreen
        loading="lazy"
        className="w-full border-0 bg-black"
        style={{ aspectRatio: aspect }}
      />
    )
  }

  return (
    <div className="relative w-full bg-black" style={{ aspectRatio: aspect }}>
      {media.poster && (
        <img
          src={media.poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}
      <button
        type="button"
        onClick={() => setRunning(true)}
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-3',
          'transition-colors hover:bg-bg/30 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
        )}
      >
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-bg/70 text-2xl text-accent shadow-glow"
        >
          ▶
        </span>
        {/* Scrimmed, because the poster underneath is cover art with its own
            type on it and the label has to stay readable over anything. */}
        <span className="flex max-w-[26rem] flex-col items-center gap-1 rounded-world bg-bg/75 px-4 py-3 backdrop-blur-sm">
          <span className="font-display text-base font-bold text-fg">{label}</span>
          {/* Say the cost out loud rather than starting a large download silently. */}
          <span className="text-center font-mono text-[11px] leading-relaxed text-muted">
            Loads the real build from itch.io — a few megabytes, so it is only fetched once you
            press play.
          </span>
        </span>
      </button>
    </div>
  )
}
