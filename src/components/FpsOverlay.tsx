import { useEffect, useState } from 'react'
import { useFps } from '@/hooks/useFps'
import { useWorld } from '@/lib/world-context'

/**
 * Dev/QA overlay for the ≥45fps acceptance criterion (spec §13).
 * Off by default; enable with `?fps=1` or by pressing Shift+F.
 */
export function FpsOverlay() {
  const { quality, world } = useWorld()
  const [enabled, setEnabled] = useState(false)
  const fps = useFps(enabled)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('fps') === '1') setEnabled(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'KeyF' && !e.metaKey && !e.ctrlKey) setEnabled((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!enabled) return null

  return (
    <div
      role="status"
      aria-live="off"
      className="fixed bottom-4 left-4 z-[70] rounded-world border border-line/70 bg-bg/85 px-3 py-2 font-mono text-[11px] leading-5 text-fg backdrop-blur"
    >
      <p>
        fps <span className={fps >= 45 ? 'text-accent' : 'text-red-400'}>{fps || '—'}</span>
      </p>
      <p className="text-muted">tier {quality.tier}</p>
      <p className="text-muted">world {world}</p>
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
