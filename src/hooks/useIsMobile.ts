import { useEffect, useState } from 'react'

/** Viewport-width breakpoint check; `md` in Tailwind terms. */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}

/** Coarse pointer = touch device; drives the mobile control scheme (spec §7). */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )
  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    const onChange = (e: MediaQueryListEvent) => setTouch(e.matches)
    mql.addEventListener('change', onChange)
    setTouch(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return touch
}
