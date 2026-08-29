import { profile } from '@/data'
import { useWorld } from '@/lib/world-context'
import { Chip, Section } from './ui'

const monogram = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function AboutSection() {
  const { theme } = useWorld()

  return (
    <Section
      id="about"
      eyebrow="04 — Background"
      title="About"
      lead={profile.today}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,280px)_1fr] md:gap-12">
        <div>
          <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-world border border-line/70 bg-surfaceAlt">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`Portrait of ${profile.name}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgb(var(--c-accent)/0.4),transparent_60%),radial-gradient(circle_at_75%_80%,rgb(var(--c-accent-alt)/0.35),transparent_55%)] font-display text-6xl font-bold text-fg/80"
              >
                {monogram(profile.name)}
              </div>
            )}
          </div>

          <dl className="mt-5 space-y-3 font-mono text-xs">
            <div>
              <dt className="uppercase tracking-[0.25em] text-muted/70">Based in</dt>
              <dd className="mt-1 text-fg">{profile.location}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.25em] text-muted/70">Currently</dt>
              <dd className="mt-1 text-fg">{theme.label}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.25em] text-muted/70">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex min-h-[44px] items-center text-accent underline decoration-line underline-offset-4 hover:text-accentAlt"
                >
                  {profile.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <div className="space-y-5 text-base leading-relaxed text-muted">
            {profile.bio.map((paragraph, i) => (
              <p key={i} className={i === 0 ? 'text-lg text-fg/90' : undefined}>
                {paragraph}
              </p>
            ))}
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <>
              <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-accent">
                Outside the editor
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <li key={interest}>
                    <Chip>{interest}</Chip>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Section>
  )
}
