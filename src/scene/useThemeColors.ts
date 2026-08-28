import { useMemo } from 'react'
import * as THREE from 'three'
import { useWorld } from '@/lib/world-context'

/** three.js Colors derived from the active world theme tokens. */
export function useThemeColors() {
  const { theme } = useWorld()
  return useMemo(() => {
    const make = (triplet: string) => {
      const [r = 0, g = 0, b = 0] = triplet.split(' ').map((n) => Number(n) / 255)
      return new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace)
    }
    return {
      accent: make(theme.accent),
      accentAlt: make(theme.accentAlt),
      bg: make(theme.bg),
      surface: make(theme.surface),
      fg: make(theme.fg),
    }
  }, [theme])
}
