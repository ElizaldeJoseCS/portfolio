import { Link } from 'react-router-dom'
import { PageHeading } from '@/components/ui'

/**
 * Everything under the SPA rewrite lands on index.html, so an unknown path
 * reaches React rather than the host's 404. It has to say so itself.
 */
export function NotFoundPage() {
  return (
    <>
      <PageHeading level="h1">Not found</PageHeading>
      <div className="xp-bevel-in bg-bg/40 p-5">
        <p className="font-mono text-sm text-muted">
          <span className="text-accent">Error:</span> that page does not exist on this machine.
        </p>
        <Link
          to="/"
          className="xp-notch mt-4 inline-flex min-h-[44px] items-center gap-2 bg-accent px-4 font-display text-sm font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accentAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Back home
        </Link>
      </div>
    </>
  )
}
