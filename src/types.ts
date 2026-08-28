/**
 * Shared content + theming contracts (spec §3.2 / §4.2).
 * These types are the single source of truth for everything in `src/data`.
 */

export type World = 'game' | 'engineer'

/**
 * Visitors land on a neutral hub first and choose a world from there, so the
 * theme set is one wider than the world set.
 */
export type ThemeName = World | 'landing'

/**
 * Where the visitor currently is. `door` is the one-shot intro room; it is
 * skipped for repeat visits in the same session, reduced motion, and no-WebGL.
 */
export type Stage = 'door' | 'landing' | 'world'

/** How far along the door-opening sequence is. */
export type DoorState = 'closed' | 'opening' | 'done'

/** Which world(s) a piece of content belongs to. `both` shows up everywhere. */
export type WorldTag = 'game' | 'swe' | 'both'

export interface ProjectLink {
  label: string
  url: string
}

export interface ProjectMedia {
  type: 'image' | 'video' | 'webgl'
  src?: string
  glb?: string
  /** Alt text / caption. Required for images so the gallery stays accessible. */
  alt?: string
}

export interface Project {
  id: string
  title: string
  tagline: string
  /** Long-form copy shown in the modal. */
  description: string
  worlds: WorldTag[]
  tags: string[]
  techStack: string[]
  role: string
  year: string
  links: ProjectLink[]
  media: ProjectMedia[]
  /** Featured projects render as large bento cards (spec §6.3). */
  featured: boolean
  highlighted?: boolean
}

export interface ExperienceEntry {
  id: string
  role: string
  company: string
  location?: string
  /** ISO-ish "YYYY-MM". */
  start: string
  end: string | 'Present'
  kind: 'work' | 'internship' | 'education'
  description: string[]
  skills: string[]
  worlds: WorldTag[]
  url?: string
}

export interface SkillGroup {
  category: string
  items: { name: string; level?: number; worlds?: WorldTag[] }[]
}

export interface Profile {
  name: string
  firstName: string
  tagline: string
  bio: string[]
  roles: string[]
  location: string
  email: string
  socials: { label: string; url: string; icon?: string }[]
  resumeUrl?: string
  /** Optional avatar in `public/assets`. Falls back to a generated monogram. */
  avatarUrl?: string
  interests?: string[]
  /** Short "what I do today" line for the About section. */
  today?: string
}

/** Quality tier chosen by device detection, overridable by the user (spec §5.2). */
export type QualityTier = 'high' | 'low'

export interface Theme {
  name: ThemeName
  label: string
  accent: string
  accentAlt: string
  bg: string
  fg: string
  muted: string
  surface: string
  surfaceAlt: string
  line: string
  fontDisplay: string
  fontBody: string
  fontMono: string
  radius: string
  motionSpring: { type: 'spring'; stiffness: number; damping: number; mass?: number }
  preserveDarkLight: false
}
