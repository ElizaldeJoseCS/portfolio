import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The heading that opens a page or a block inside one — a 2077 data-shard
 * label with a clipped corner.
 *
 * `level` exists because the first heading on a page is its `h1` and the rest
 * are `h2`s, and a page must not have two `h1`s or skip a level.
 */
export function PageHeading({
  children,
  level = 'h2',
  lead,
  id,
  className,
}: {
  children: ReactNode
  level?: 'h1' | 'h2'
  /** Optional line under the heading. */
  lead?: string
  id?: string
  className?: string
}) {
  const Tag = level

  return (
    <div className={cn('mb-5', className)}>
      <Tag
        id={id}
        className={cn(
          'xp-notch scroll-mt-28 bg-gradient-to-r from-accent/25 to-transparent px-3 py-2',
          'font-display font-bold uppercase tracking-[0.28em] text-accent',
          level === 'h1' ? 'text-base sm:text-lg' : 'text-sm',
        )}
      >
        <span aria-hidden="true" className="mr-2 text-accentAlt">
          &gt;&gt;
        </span>
        {children}
      </Tag>
      {lead && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{lead}</p>}
    </div>
  )
}
