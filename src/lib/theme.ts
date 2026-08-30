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

/*
  The landing's body face is the one Windows actually shipped its UI in. It is
  a system stack on purpose — no extra webfont, and on a Windows machine the
  chrome renders in the genuine article. Verdana and DejaVu Sans cover macOS
  and Linux with the same wide, slightly clumsy proportions.

  Display stays Chakra Petch: XP supplies the geometry of this landing, 2077
  supplies the palette and the type. Already loaded for the Game World, so it
  costs nothing new.
*/
const FONT_BODY_XP = "Tahoma, Verdana, 'DejaVu Sans', Geneva, sans-serif"

export const themes: Record<ThemeName, Theme> = {
  landing: {
    name: 'landing',
    label: 'Landing',
    /*
      Cyberpunk 2077's hazard yellow against its cyan, on near-black. It reads
      as neither world — the Game World is magenta, the Engineer World green —
      so entering either one is still a shift. The yellow is also what carries
      the XP chrome: a title bar gradient needs a saturated hue to look like a
      title bar rather than a rule, and this one clears 15:1 on the ground.
    */
    accent: '252 238 10',
    accentAlt: '0 240 255',
    bg: '8 8 12',
    fg: '235 238 245',
    muted: '150 156 170',
    surface: '18 18 24',
    surfaceAlt: '26 27 36',
    line: '72 76 92',
    fontDisplay: FONT_DISPLAY_GAME,
    fontBody: FONT_BODY_XP,
    fontMono: FONT_MONO,
    /*
      Square. Every shared component (Chip, LinkButton, Card) reads
      `--radius-world`, so dropping it to 0 puts the whole landing on hard
      corners without touching one of them — which is what both halves of this
      reference want. XP's own rounding lives only on the window's top corners,
      applied there directly.
    */
    radius: '0px',
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
