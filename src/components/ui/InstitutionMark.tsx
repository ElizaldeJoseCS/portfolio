import { cn } from '@/lib/cn'
import type { EntryLogo } from '@/types'

/**
 * The mark for a school or employer, beside a timeline entry or a paper.
 *
 * `src` is optional on purpose: an entry must never depend on an image file
 * existing. Without one this renders `short` as a lettermark, which is a real
 * design rather than a placeholder — dropping a logo into `public/assets` and
 * setting `src` upgrades it in place.
 *
 * Decorative by default: the company name is already in the DOM next to it, so
 * announcing "UCLA" twice is noise. Pass `labelled` where the mark stands on
 * its own.
 */
export function InstitutionMark({
  logo,
  className,
  labelled = false,
}: {
  logo: EntryLogo
  className?: string
  labelled?: boolean
}) {
  /*
    A wordmark and a lettermark are different objects and must not share a
    frame: real artwork is wide, already carries its own colour, and reads best
    unboxed, while the fallback needs the box to look deliberate.
  */
  if (logo.src) {
    return (
      <img
        src={logo.src}
        alt={labelled ? logo.alt : ''}
        aria-hidden={labelled ? undefined : true}
        title={labelled ? undefined : logo.alt}
        loading="lazy"
        decoding="async"
        className={cn('h-7 w-auto max-w-[92px] shrink-0 object-contain object-left', className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg',
        'border border-line/70 bg-bg/60',
        'font-display text-[11px] font-bold tracking-tight text-fg/75',
        className,
      )}
      aria-hidden={labelled ? undefined : true}
      title={labelled ? undefined : logo.alt}
    >
      {labelled && <span className="sr-only">{logo.alt}</span>}
      <span aria-hidden="true">{logo.short}</span>
    </span>
  )
}
