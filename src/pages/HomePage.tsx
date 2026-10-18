import { Link } from 'react-router-dom'
import { featuredOrder, profile, projects } from '@/data'
import { PageHeading } from '@/components/ui'

/** The home page: who this is, then the featured projects. */
export function HomePage() {
  // Anything featured but missing from `featuredOrder` goes last rather than vanishing.
  const rank = (id: string) => {
    const i = featuredOrder.indexOf(id)
    return i === -1 ? featuredOrder.length : i
  }
  const featured = projects.filter((p) => p.featured).sort((a, b) => rank(a.id) - rank(b.id))

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
          <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-fg/85 sm:text-lg">
            {profile.tagline}
          </p>
          {profile.today && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-[15px]">
              {profile.today}
            </p>
          )}
        </div>
      </div>

      {featured.length > 0 && (
        <section className="mt-8">
          <PageHeading lead="The projects I am most proud of">Featured</PageHeading>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {featured.map((project) => {
              const cover = project.media.find((m) => m.type === 'image')
              return (
                <li key={project.id}>
                  <Link
                    to="/projects"
                    className="xp-bevel group flex h-full flex-col bg-surfaceAlt transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  >
                    {cover && (
                      <img
                        src={cover.src}
                        alt={cover.alt ?? ''}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/10] w-full border-b-2 border-bg object-cover object-top"
                      />
                    )}
                    <span className="flex flex-1 flex-col p-4">
                      <span className="flex items-baseline gap-3">
                        <span className="font-display text-lg font-bold text-fg transition-colors group-hover:text-accent">
                          {project.title}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                          {project.year}
                        </span>
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-muted">
                        {project.tagline}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
