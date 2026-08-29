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
    Every mark occupies the same fixed column, whatever its proportions, so the
    text beside it always starts at the same x. Sizing by height alone let a
    one-line wordmark (UCLA, ~2.2:1) run to 87px while a three-line lockup
    (CMU, ~1.6:1) stopped at 63px, and the two entries read as misaligned.

    Inside that column the artwork is `object-contain`, so nothing is cropped
    or stretched to fit — a wide mark fills the width, a squat one fills the
    height, and both hug the left edge.
  */
  // Narrower on phones, where 80px of a 360px viewport crowds a paper title
  // into four wrapped lines. Both marks still share a width at every breakpoint,
  // which is what keeps the text aligned.
  const COLUMN = 'h-10 w-16 shrink-0 sm:w-20'

  if (logo.src) {
    return (
      <img
        src={logo.src}
        alt={labelled ? logo.alt : ''}
        aria-hidden={labelled ? undefined : true}
        title={labelled ? undefined : logo.alt}
        loading="lazy"
        decoding="async"
        className={cn(COLUMN, 'object-contain object-left', className)}
      />
    )
  }

  /*
    The fallback keeps a plate, because letters with no frame read as stray
    text rather than a mark — but the plate sits inside the same column, left
    aligned, so it lines up with real artwork.
  */
  return (
    <span
      className={cn(COLUMN, 'flex items-center justify-start', className)}
      aria-hidden={labelled ? undefined : true}
      title={labelled ? undefined : logo.alt}
    >
      {labelled && <span className="sr-only">{logo.alt}</span>}
      <span
        aria-hidden="true"
        className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border border-line/70 bg-bg/60 px-2 font-display text-[11px] font-bold tracking-tight text-fg/75"
      >
        {logo.short}
      </span>
    </span>
  )
}
