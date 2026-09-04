import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProjectMedia } from '@/types'
import { cn } from '@/lib/cn'

/**
 * A third-party iframe — an itch.io HTML5 build, say — behind a poster and a
 * play button.
 *
 * **The iframe is never in the DOM until the visitor asks for it.** A Unity
 * WebGL build is tens of megabytes; mounting it when the card expands would
 * spend that on every visitor who only wanted to read the write-up. This
 * mirrors what itch.io itself does on a game page, so the interaction is
 * familiar.
 *
 * It is also the reason this stays a separate component: unmounting it is what
 * actually stops the game's audio and its frame loop.
 *
 * ## Why the iframe is scaled rather than stretched
 *
 * Unity's default WebGL template hard-codes the canvas —
 * `canvas.style.width = "960px"` — and centres it with
 * `#unity-container { position: absolute; left: 50%; top: 50%; transform:
 * translate(-50%, -50%) }`. Nothing in that reacts to the size of the frame
 * around it. Hand such a page a viewport smaller than its canvas and it does
 * not shrink, it **centre-crops**: the build loses an equal slice off all four
 * sides, and the Unity footer — which carries the *good* fullscreen button, the
 * one that calls `SetFullscreen(1)` and resizes the canvas for real — is the
 * first thing off the bottom.
 *
 * So a `w-full` iframe at a card's width showed the middle of Shellscape and
 * none of its edges, and the only fullscreen control left in reach was itch's
 * own 20px footer button, which just makes the frame screen-sized and crops all
 * over again on any display whose CSS viewport is under ~962×697 (a 1366×768
 * laptop at Windows' 125% scaling is 1093×614, hence "messed up *sometimes*").
 *
 * Given the natural size, the fix is arithmetic: render the iframe at exactly
 * that many CSS pixels and `transform: scale()` the element down to fit. The
 * transform is on our side of the boundary, so it needs no cooperation from the
 * embedded page, and the whole build is visible at every width.
 */
export function ProjectEmbed({ media, title }: { media: ProjectMedia; title: string }) {
  const [running, setRunning] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<{ scale: number; x: number; y: number } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  const nativeW = media.embedWidth
  const nativeH = media.embedHeight
  const scaled = Boolean(nativeW && nativeH)

  /*
    Measure the frame rather than reading a breakpoint: the card is one column
    on a phone and one of two on a desktop, and it also changes width when the
    sidebar appears. The same observer covers going fullscreen, since the box
    resizes to the screen when it does.
  */
  useEffect(() => {
    const box = boxRef.current
    if (!running || !scaled || !box || !nativeW || !nativeH) return

    const measure = () => {
      const { width, height } = box.getBoundingClientRect()
      if (!width || !height) return
      const scale = Math.min(width / nativeW, height / nativeH)
      setFit({ scale, x: (width - nativeW * scale) / 2, y: (height - nativeH * scale) / 2 })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [running, scaled, nativeW, nativeH])

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  /*
    Ours fullscreens the *wrapper*, not the iframe. That matters: the Fullscreen
    UA stylesheet forces `transform: none !important` on the element it promotes,
    so fullscreening the iframe itself would throw away the scale and hand the
    game a raw viewport again. With the wrapper promoted, the iframe inside is
    still ours to scale, and the build fits any screen — including one smaller
    than its own canvas.
  */
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
    } else {
      void rootRef.current?.requestFullscreen().catch(() => {})
    }
  }, [])

  if (!media.src) return null

  const aspect = scaled ? `${nativeW} / ${nativeH}` : (media.aspect ?? '16 / 9')
  const label = media.action ?? 'Play'

  if (!running) {
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

  return (
    <div ref={rootRef} className="flex flex-col bg-black">
      {/*
        Fullscreen is the only case where the frame is sized by what is left over
        rather than by its own ratio: `flex-1` hands it everything the toolbar
        does not take, and the scale below letterboxes the build inside it.
      */}
      <div
        ref={boxRef}
        className={cn('relative w-full overflow-hidden', fullscreen && 'min-h-0 flex-1')}
        style={fullscreen ? undefined : { aspectRatio: aspect }}
      >
        <iframe
          src={media.src}
          title={media.alt ?? `${title}, playable`}
          /*
            `fullscreen *`, not a bare `fullscreen`. There are two frames here,
            not one: itch.io's wrapper, and the game itself on itch.zone inside
            it. A bare grant covers only the frame's own origin, so the nested
            build could not take fullscreen — and its fullscreen button is the
            one that calls `SetFullscreen(1)` and resizes the canvas for real.
            itch's own inner iframe delegates with `fullscreen *` for exactly
            this reason.
          */
          allow="autoplay; fullscreen *; gamepad; xr-spatial-tracking"
          allowFullScreen
          className="absolute left-0 top-0 border-0 bg-black"
          style={
            scaled
              ? {
                  width: `${nativeW}px`,
                  height: `${nativeH}px`,
                  transformOrigin: '0 0',
                  // Hidden until measured, or the first paint is a full-size
                  // iframe bursting out of the card.
                  transform: fit
                    ? `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`
                    : 'scale(0)',
                }
              : { width: '100%', height: '100%' }
          }
        />
      </div>

      {/*
        Below the frame rather than over it: an overlay would sit on top of the
        game's own HUD, and this row is inside the fullscreen element so the way
        out stays visible for anyone who does not think of Escape.
      */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t-2 border-bg bg-surface px-2">
        <span className="truncate font-mono text-[11px] text-muted">
          Running from itch.io — click in to give it the keyboard.
        </span>
        <button
          type="button"
          onClick={toggleFullscreen}
          className={cn(
            'inline-flex min-h-[44px] shrink-0 items-center px-3.5 font-mono text-xs uppercase tracking-[0.14em]',
            'xp-bevel bg-surfaceAlt text-fg/80 transition-colors hover:bg-accent/10 hover:text-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          )}
        >
          {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </div>
  )
}
