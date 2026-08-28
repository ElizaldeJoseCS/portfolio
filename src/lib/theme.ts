import type { Theme, ThemeName, World } from '@/types'

/**
 * Per-world design tokens (spec §4.2).
 *
 * Colors are stored as `R G B` triplets so Tailwind can apply its
 * `<alpha-value>` modifier through the CSS custom properties declared in
 * `styles/globals.css`. Nothing outside this file should know a hex code.
 */

const FONT_DISPLAY_GAME = "'Chakra Petch', 'Rajdhani', system-ui, sans-serif"
const FONT_DISPLAY_ENG = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif"
const FONT_MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const themes: Record<ThemeName, Theme> = {
  landing: {
    name: 'landing',
    label: 'Landing',
    // Neutral ground: a violet/cyan pair that belongs to neither world but
    // rhymes with both, so entering either one reads as a shift, not a jolt.
    accent: '167 139 250',
    accentAlt: '103 232 249',
    bg: '10 10 18',
    fg: '240 240 250',
    muted: '160 160 184',
    surface: '20 20 32',
    surfaceAlt: '28 28 44',
    line: '64 64 92',
    fontDisplay: FONT_DISPLAY_ENG,
    fontBody: FONT_DISPLAY_ENG,
    fontMono: FONT_MONO,
    radius: '14px',
    motionSpring: { type: 'spring', stiffness: 260, damping: 26, mass: 0.85 },
    preserveDarkLight: false,
  },
  game: {
    name: 'game',
    label: 'Game World',
    // Hot magenta / cyan on near-black: arcade cabinet, emissive, high energy.
    accent: '255 62 165',
    accentAlt: '56 232 255',
    bg: '9 6 20',
    fg: '245 240 255',
    muted: '167 156 196',
    surface: '20 14 38',
    surfaceAlt: '30 20 54',
    line: '82 58 128',
    fontDisplay: FONT_DISPLAY_GAME,
    fontBody: FONT_DISPLAY_GAME,
    fontMono: FONT_MONO,
    radius: '20px',
    // Loose and bouncy — reads as "playful".
    motionSpring: { type: 'spring', stiffness: 220, damping: 18, mass: 0.9 },
    preserveDarkLight: false,
  },
  engineer: {
    name: 'engineer',
    label: 'Engineer World',
    // Terminal green / editor blue on slate: precise, calm, IDE-like.
    accent: '94 234 160',
    accentAlt: '110 168 254',
    bg: '9 13 18',
    fg: '226 236 244',
    muted: '138 156 172',
    surface: '16 22 30',
    surfaceAlt: '22 30 41',
    line: '46 62 79',
    fontDisplay: FONT_DISPLAY_ENG,
    fontBody: FONT_DISPLAY_ENG,
    fontMono: FONT_MONO,
    radius: '8px',
    // Tighter and more critically damped — reads as "engineered".
    motionSpring: { type: 'spring', stiffness: 320, damping: 32, mass: 0.8 },
    preserveDarkLight: false,
  },
}

/** The other world — used by the switcher's label and the CTA copy. */
export const otherWorld = (w: World): World => (w === 'game' ? 'engineer' : 'game')

/** Writes the active theme onto :root so Tailwind's token classes resolve. */
export function applyThemeVars(theme: Theme, root: HTMLElement = document.documentElement) {
  const vars: Record<string, string> = {
    '--c-bg': theme.bg,
    '--c-surface': theme.surface,
    '--c-surface-alt': theme.surfaceAlt,
    '--c-fg': theme.fg,
    '--c-muted': theme.muted,
    '--c-accent': theme.accent,
    '--c-accent-alt': theme.accentAlt,
    '--c-line': theme.line,
    '--font-display': theme.fontDisplay,
    '--font-body': theme.fontBody,
    '--font-mono': theme.fontMono,
    '--radius-world': theme.radius,
  }
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  root.dataset.world = theme.name
}

/** `rgb()` string for the few places that need a real color (canvas, three.js). */
export const rgb = (triplet: string, alpha = 1) =>
  alpha === 1 ? `rgb(${triplet.split(' ').join(',')})` : `rgba(${triplet.split(' ').join(',')},${alpha})`

/** Normalised 0–1 tuple for three.js `Color.setRGB`. */
export const toLinearTriplet = (triplet: string): [number, number, number] => {
  const [r = 0, g = 0, b = 0] = triplet.split(' ').map((n) => Number(n) / 255)
  return [r, g, b]
}
