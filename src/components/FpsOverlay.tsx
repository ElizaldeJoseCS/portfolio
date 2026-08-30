import { useEffect, useState } from 'react'
import { useFps } from '@/hooks/useFps'
import { useWorld } from '@/lib/world-context'

/**
 * Dev/QA overlay for the ≥45fps acceptance criterion (spec §13).
 * Off by default; enable with `?fps=1` or by pressing Shift+F.
 *
 * It reports the inputs to the frame cost, not just the result. Frame rate on
 * its own does not say *why* a machine is slow, and the two things that differ
 * most between machines — how many pixels the scene is drawing into, and which
 * GPU is drawing them — are invisible otherwise.
 */
export function FpsOverlay() {
  const { quality, world } = useWorld()
  const [enabled, setEnabled] = useState(false)
  const [buffer, setBuffer] = useState<string>('—')
  const fps = useFps(enabled)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('fps') === '1') setEnabled(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'KeyF' && !e.metaKey && !e.ctrlKey) setEnabled((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // The drawing buffer is the number that actually scales the frame cost, and
  // it is not derivable from the viewport alone. Sampled rather than watched;
  // dpr is fixed for the session and resizes are rare.
  useEffect(() => {
    if (!enabled) return
    const read = () => {
      const c = document.querySelector('canvas')
      setBuffer(c ? `${c.width}×${c.height}` : '—')
    }
    read()
    const id = window.setInterval(read, 1000)
    return () => window.clearInterval(id)
  }, [enabled])

  if (!enabled) return null

  const megapixels = (() => {
    const [w, h] = buffer.split('×').map(Number)
    return w && h ? `${((w * h) / 1e6).toFixed(1)}MP` : ''
  })()

  return (
    <div
      role="status"
      aria-live="off"
      className="fixed bottom-4 left-4 z-[70] max-w-[15rem] rounded-world border border-line/70 bg-bg/85 px-3 py-2 font-mono text-[11px] leading-5 text-fg backdrop-blur"
    >
      <p>
        fps <span className={fps >= 45 ? 'text-accent' : 'text-red-400'}>{fps || '—'}</span>
      </p>
      <p className="text-muted">
        tier {quality.tier}
        {quality.isManual ? ' (forced)' : quality.locked ? ' (locked)' : ''}
      </p>
      <p className="text-muted">
        buffer {buffer} {megapixels}
      </p>
      <p className="text-muted">dpr {quality.dpr.toFixed(2)}</p>
      <p className="text-muted">post {quality.postProcessing ? 'on' : 'off'}</p>
      <p className="text-muted">world {world}</p>
      {quality.renderer && (
        <p className="mt-1 break-words text-[10px] leading-4 text-muted/80">{quality.renderer}</p>
      )}
      <button
        type="button"
        onClick={() => quality.setTier(quality.tier === 'high' ? 'low' : 'high')}
        className="mt-1 underline underline-offset-2 hover:text-accent"
      >
        force {quality.tier === 'high' ? 'low' : 'high'}
      </button>
    </div>
  )
}
