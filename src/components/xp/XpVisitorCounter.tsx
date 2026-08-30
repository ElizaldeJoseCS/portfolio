import { useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio:visits'

/**
 * The hit counter, because a 2003 personal site without one is not a 2003
 * personal site.
 *
 * It counts *this browser's* visits, out of localStorage, and says so. A fake
 * global counter would have been more period-accurate and would also be a
 * fabricated number sitting on a real portfolio, which is not a trade worth
 * making for a joke. This one is true, and the odometer styling carries the
 * reference on its own.
 *
 * Renders nothing until the effect has run: the count is not knowable during
 * the first render, and a flash of `000000` would read as broken.
 */
export function XpVisitorCounter() {
  const [visits, setVisits] = useState<number | null>(null)

  useEffect(() => {
    let next = 1
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY))
      next = Number.isFinite(stored) && stored > 0 ? stored + 1 : 1
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // Private mode: still show a truthful "this is your first visit here".
    }
    setVisits(next)
  }, [])

  if (visits === null) return null

  const digits = String(Math.min(visits, 999_999)).padStart(6, '0')

  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Connections logged
      </p>
      <p className="mt-2 flex justify-center gap-[3px]" aria-hidden="true">
        {digits.split('').map((digit, i) => (
          <span
            key={i}
            className="xp-bevel-in bg-bg px-1.5 py-1 font-mono text-base font-bold leading-none text-accentAlt"
          >
            {digit}
          </span>
        ))}
      </p>
      <p className="mt-2 text-[11px] leading-snug text-muted">
        {visits === 1
          ? 'First time on this machine.'
          : `Visit ${visits} from this browser — counted locally, not on a server.`}
      </p>
    </div>
  )
}
