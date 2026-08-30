import { Link } from 'react-router-dom'
import { profile, projects } from '@/data'
import { PAGES } from '@/lib/nav'
import { PageHeading } from '@/components/ui'

/**
 * The home page: who this is, then an index of everywhere else.
 *
 * It deliberately does not repeat the other pages' content. The old landing
 * carried the entire bio, the papers and the project pitch because it was the
 * only page there was; now that each of those has a URL, the home page's job
 * is to say what this is and point.
 */
export function HomePage() {
  const featured = projects.filter((p) => p.featured)
  const elsewhere = PAGES.filter((p) => p.path !== '/')

  return (
    <>
      {/* Masthead. */}
      <div className="xp-bevel-in flex flex-col gap-5 bg-bg/50 px-4 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-6 sm:py-8">
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={`Portrait of ${profile.name}`}
            width={400}
            height={400}
            /* First thing on the site, so it is not lazy. */
            decoding="async"
            className="xp-bevel mx-auto aspect-square w-full max-w-[11rem] shrink-0 object-cover sm:mx-0 sm:w-40"
          />
        )}

        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accentAlt">
            {profile.location} · {profile.roles.join(' · ')}
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.9rem,6.5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-fg">
            {profile.name}
          </h1>
          <div aria-hidden="true" className="xp-hazard mt-4 h-1.5 w-28 opacity-90" />
          <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-fg/85 sm:text-lg">
            {profile.tagline}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <PageHeading lead="Four pages. The window stays open.">Where to go</PageHeading>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {elsewhere.map((page) => (
            <li key={page.path}>
              <Link
                to={page.path}
                className="xp-bevel group flex h-full flex-col bg-surfaceAlt transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <span className="xp-titlebar flex items-center gap-2 px-2 py-1">
                  {/*
                    A filename rather than the label, which is repeated as the
                    heading two lines below — the title bar saying "about" over
                    a heading saying "About" read as a rendering mistake.
                  */}
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-bg">
                    {page.label.toLowerCase()}.html
                  </span>
                  <span aria-hidden="true" className="font-mono text-[10px] text-bg/70">
                    – □ ✕
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="font-display text-lg font-bold uppercase tracking-tight text-fg transition-colors group-hover:text-accent">
                    {page.label}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted">
                    {page.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="mt-10">
          <PageHeading lead="The two I would show first. The rest are on the Projects page.">
            Featured
          </PageHeading>
          <ul className="space-y-3">
            {featured.map((project) => (
              <li key={project.id}>
                <Link
                  to="/projects"
                  className="xp-bevel group flex items-start gap-4 bg-surfaceAlt p-4 transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 font-mono text-xs text-accentAlt"
                  >
                    ▸
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-bold uppercase tracking-tight text-fg transition-colors group-hover:text-accent">
                      {project.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {project.tagline}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto shrink-0 self-center font-mono text-xs text-muted"
                  >
                    {project.year}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
