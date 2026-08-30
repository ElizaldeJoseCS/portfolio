/**
 * Shared content contracts (spec §3.2).
 * These types are the single source of truth for everything in `src/data`.
 */

/**
 * Which side of the work a thing belongs to. `both` shows up under either
 * filter.
 *
 * This used to be called `worlds`, back when the site was two 3D worlds and
 * the tag decided which one a project was allowed to appear in. The worlds are
 * gone; the distinction is not, because it is genuinely useful to show someone
 * the software work without the game work. It is now a filter on one page
 * rather than a wall between two.
 */
export type Track = 'game' | 'swe' | 'both'

export interface ProjectLink {
  label: string
  url: string
}

export interface ProjectMedia {
  /**
   * `embed` is a third-party iframe — an itch.io HTML5 build, say. It is never
   * loaded until the visitor asks for it: a Unity WebGL build is tens of
   * megabytes and would otherwise download the moment a card is expanded.
   */
  type: 'image' | 'video' | 'embed'
  src?: string
  /** Alt text / caption. Required for images so the gallery stays accessible. */
  alt?: string
  /** Still shown before a `video` or `embed` is loaded. */
  poster?: string
  /** CSS aspect ratio ('16 / 9' by default) for embeds with an odd canvas. */
  aspect?: string
  /** Button copy for an `embed`. Defaults to "Play". */
  action?: string
}

/**
 * One section of a long-form write-up, rendered below the summary when a
 * project card is expanded. A project's depth lives in `src/data`, never in
 * the component.
 */
export interface ProjectDetail {
  heading: string
  body?: string
  bullets?: string[]
}

export interface Project {
  id: string
  title: string
  tagline: string
  /** Long-form copy shown when the card is expanded. */
  description: string
  track: Track[]
  tags: string[]
  techStack: string[]
  role: string
  year: string
  links: ProjectLink[]
  media: ProjectMedia[]
  /** Section-by-section write-up, shown after `description`. */
  details?: ProjectDetail[]
  /** Where the thing actually is — "Live on a DigitalOcean VPS", "In development". */
  status?: string
  /** Featured projects lead the list and get a wider card. */
  featured: boolean
  highlighted?: boolean
}

/**
 * A school or employer mark. `src` is a file in `public/assets`; when it is
 * absent the UI renders `short` as a lettermark instead, so an entry never
 * breaks on a missing image. `alt`/`short` are required for that reason.
 */
export interface EntryLogo {
  /** Lettermark fallback — "UCLA", "CMU". Keep it to ~4 characters. */
  short: string
  /** The institution's full name, for assistive tech. */
  alt: string
  src?: string
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
  track: Track[]
  url?: string
  logo?: EntryLogo
}

/**
 * A paper. `pdf` is a copy hosted here so a link never rots behind a paywall or
 * a dead conference site; `doi` is the canonical record when there is one.
 * Both open in a new tab, like the resume.
 */
export interface Publication {
  id: string
  title: string
  /** In publication order, exactly as printed. */
  authors: string[]
  venue: string
  year: string
  abstract: string
  /** Site-relative path to the hosted PDF. */
  pdf: string
  doi?: string
  /** What I actually did on it — this is a portfolio, not a bibliography. */
  contribution: string
  /** Ties the paper back to the `ExperienceEntry` it came out of. */
  experienceId?: string
  track: Track[]
}

export interface SkillGroup {
  category: string
  items: { name: string; level?: number; track?: Track[] }[]
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

/**
 * One page of the site. The array in `src/lib/nav.ts` is the single source for
 * the menu bar, the Start menu and the sitemap.
 */
export interface NavPage {
  path: string
  /** Menu bar label. */
  label: string
  /** <title> and the window's title bar. */
  title: string
  /** <meta name="description">. */
  description: string
}
