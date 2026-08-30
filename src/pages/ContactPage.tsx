import { profile } from '@/data'
import { PageHeading, SocialIcon } from '@/components/ui'

export function ContactPage() {
  return (
    <>
      <PageHeading level="h1" lead="Email is the surest way to reach me.">
        Contact
      </PageHeading>

      <div className="xp-bevel bg-surfaceAlt p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Email</p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-2 inline-flex min-h-[44px] items-center break-all font-display text-lg font-bold text-accentAlt underline decoration-line underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-xl"
        >
          {profile.email}
        </a>
        <p className="mt-3 font-mono text-[11px] text-muted">
          <span aria-hidden="true">◈ </span>
          {profile.location}
        </p>
      </div>

      <section className="mt-8">
        <PageHeading>Elsewhere</PageHeading>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profile.socials.map((social) => (
            <li key={social.url}>
              <a
                href={social.url}
                {...(social.url.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noreferrer noopener' })}
                className="xp-bevel flex min-h-[44px] items-center gap-3 bg-surfaceAlt p-3 text-sm text-fg/85 transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <SocialIcon name={social.icon} className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1">{social.label}</span>
                {!social.url.startsWith('mailto:') && (
                  <>
                    <span aria-hidden="true" className="text-[10px] opacity-60">
                      ↗
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </>
                )}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {profile.resumeUrl && (
        <section className="mt-8">
          <PageHeading>Resume</PageHeading>
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="xp-notch inline-flex min-h-[48px] items-center gap-2 bg-accent px-5 font-display text-sm font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accentAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Download resume (PDF)
            <span aria-hidden="true">↓</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </section>
      )}
    </>
  )
}
