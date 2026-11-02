import { profile } from '@/data'
import { SocialIcon } from './ui'

const linkClass =
  'inline-flex min-h-[44px] items-center gap-2 font-mono text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

/** Sits below the window on every page: every off-site link and both resumes. */
export function Footer() {
  return (
    <footer className="xp-bevel border-x-0 border-b-0 bg-surface/60">
      {/* Taskbar clearance is applied by `SiteShell`, which owns the layout. */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}. Built with React and Vite.
        </p>
        <nav aria-label="Links">
          <ul className="flex flex-wrap items-center gap-x-5">
            {profile.socials.map((social) => {
              const external = !social.url.startsWith('mailto:')
              return (
                <li key={social.url}>
                  <a
                    href={social.url}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className={linkClass}
                  >
                    <SocialIcon name={social.icon} className="h-4 w-4 shrink-0" />
                    {social.label}
                    {external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              )
            })}
            {profile.resumes?.map((resume) => (
              <li key={resume.url}>
                <a
                  href={resume.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  <span aria-hidden="true" className="w-4 shrink-0 text-center">
                    ▤
                  </span>
                  {resume.label}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
