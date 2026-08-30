import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * A sidebar panel — XP's "Explorer bar" block, the rounded-top coloured header
 * with a pale body under it that every 2003 personal site copied for its
 * blogroll.
 *
 * The header keeps XP's rounded top corners. They are the one piece of
 * rounding on this landing (`--radius-world` is 0 here), which is what makes
 * them read as a quotation rather than an inconsistency.
 */
export function XpPanel({
  title,
  id,
  children,
  className,
  headingLevel: Heading = 'h2',
}: {
  title: string
  /** Anchor target. Goes on the heading, so a menu link lands on real text. */
  id?: string
  children: ReactNode
  className?: string
  /** The panels sit at different depths in different columns. */
  headingLevel?: 'h2' | 'h3'
}) {
  return (
    <section className={cn('min-w-0', className)}>
      <Heading
        id={id}
        className="rounded-t-[7px] bg-gradient-to-b from-accent/85 to-accent/60 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-bg scroll-mt-28"
      >
        {title}
      </Heading>
      <div className="border-2 border-t-0 border-line/50 bg-bg/40 px-3 py-3">{children}</div>
    </section>
  )
}
