import { profile } from '@/data'
import { useWorld } from '@/lib/world-context'
import { Card, LinkButton, Section } from './ui'

export function ContactSection() {
  const { nextTheme, next, toggleWorld } = useWorld()

  return (
    <Section
      id="contact"
      eyebrow="05 — Say hello"
      title="Contact"
      lead="Open to gameplay engineering, graphics, and platform work. The fastest route is email."
    >
      <Card className="p-6 sm:p-10">
        <a
          href={`mailto:${profile.email}`}
          className="inline-block break-all font-display text-2xl font-bold tracking-tight text-fg underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-4xl"
        >
          {profile.email}
        </a>

        <ul className="mt-8 flex flex-wrap gap-3">
          {profile.socials.map((social) => (
            <li key={social.url}>
              <LinkButton
                href={social.url}
                external={!social.url.startsWith('mailto:')}
                variant="outline"
                size="sm"
              >
                {social.label}
              </LinkButton>
            </li>
          ))}
          {profile.resumeUrl && (
            <li>
              <LinkButton href={profile.resumeUrl} external variant="primary" size="sm">
                Download resume
              </LinkButton>
            </li>
          )}
        </ul>

        <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted">
          Seen only one half of the work?{' '}
          <button
            type="button"
            onClick={toggleWorld}
            className="font-semibold text-accent underline decoration-line underline-offset-4 transition-colors hover:text-accentAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Switch to the {nextTheme.label}
          </button>{' '}
          — same projects, re-lit for the {next === 'game' ? 'game' : 'software'} side.
        </p>
      </Card>
    </Section>
  )
}
