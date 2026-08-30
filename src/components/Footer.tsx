import { profile } from '@/data'
import { SocialIcon } from './ui'

const monogram = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/**
 * Landing-only (see `WorldLayer` in App.tsx). The worlds are full-viewport
 * experiences you navigate rather than scroll to the bottom of, so a footer
 * there would either never be reached or would sit under the arena HUD.
 */
export function Footer() {
  return (
    <footer className="xp-bevel border-x-0 border-b-0 bg-bg/60 backdrop-blur-md">
      {/*
        `pb-28` clears the landing's fixed taskbar, which is the last thing on
        the page and would otherwise sit on top of the copyright row.
      */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-10 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-[0.2em] text-fg">
              {monogram(profile.name)}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {profile.roles.join(' · ')} — {profile.location}.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-2 inline-flex min-h-[44px] items-center text-sm text-accent underline decoration-line underline-offset-4 transition-colors hover:text-accentAlt"
            >
              {profile.email}
            </a>
          </div>

          <nav aria-label="Social links">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted/70">
              Elsewhere
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {profile.socials.map((social) => (
                <li key={social.url}>
                  {/*
                    The visible label is the icon, so the accessible name comes
                    from `aria-label` — every one of these must clear 44px
                    (spec §8), hence the fixed square rather than padding.
                  */}
                  <a
                    href={social.url}
                    aria-label={social.label}
                    title={social.label}
                    {...(social.url.startsWith('mailto:')
                      ? {}
                      : { target: '_blank', rel: 'noreferrer noopener' })}
                    className="flex h-11 w-11 items-center justify-center rounded-world border border-line/70 bg-surface/60 text-muted transition-colors hover:border-accent/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  >
                    <SocialIcon name={social.icon} className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with React Three Fiber.
          </p>
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center font-mono text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Resume (PDF)
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
