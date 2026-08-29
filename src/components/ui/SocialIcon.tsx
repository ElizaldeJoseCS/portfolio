/**
 * Inline social marks. These are drawn here rather than pulled from an icon
 * package for the same reason the scene has no external assets: a footer icon
 * is not worth a runtime dependency, and `currentColor` makes them theme-aware
 * for free (spec §4.2 — no colour outside `theme.ts`).
 *
 * The key comes from `profile.socials[].icon`. Anything unrecognised renders
 * nothing, so the link falls back to its own text label rather than a hole.
 */
import type { ReactElement } from 'react'

export type SocialIconName = 'github' | 'linkedin' | 'itch' | 'mail'

const PATHS: Record<SocialIconName, ReactElement> = {
  github: (
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  ),
  linkedin: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  ),
  /*
    A controller rather than the itch.io wordmark: an approximated brand logo
    reads as a broken one, and this is unambiguous next to the "itch.io" label
    the link already carries.
  */
  itch: (
    <path d="M6.5 6h11a5.5 5.5 0 0 1 5.44 4.7l.83 5.6A3.2 3.2 0 0 1 20.6 20a3.2 3.2 0 0 1-2.55-1.27L16.6 16.8a1.5 1.5 0 0 0-1.2-.6H8.6a1.5 1.5 0 0 0-1.2.6l-1.45 1.93A3.2 3.2 0 0 1 3.4 20a3.2 3.2 0 0 1-3.17-3.7l.83-5.6A5.5 5.5 0 0 1 6.5 6zm1.25 3a.9.9 0 0 0-.9.9v1.1H5.75a.9.9 0 0 0 0 1.8H6.85v1.1a.9.9 0 0 0 1.8 0v-1.1h1.1a.9.9 0 0 0 0-1.8h-1.1V9.9a.9.9 0 0 0-.9-.9zm8.4.9a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3zm2.6 2.6a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3z" />
  ),
  mail: (
    <path d="M2.25 5.25h19.5c.414 0 .75.336.75.75v12a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75V6c0-.414.336-.75.75-.75zM3 8.16V17.25h18V8.16l-8.4 5.46a1.5 1.5 0 0 1-1.2 0L3 8.16zm.9-1.41 7.7 5.005a.75.75 0 0 0 .8 0L20.1 6.75H3.9z" />
  ),
}

export function SocialIcon({ name, className }: { name?: string; className?: string }) {
  const path = name && name in PATHS ? PATHS[name as SocialIconName] : null
  if (!path) return null

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {path}
    </svg>
  )
}
