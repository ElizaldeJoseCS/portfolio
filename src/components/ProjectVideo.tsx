import { cn } from '@/lib/cn'
import type { ProjectMedia } from '@/types'

/**
 * A gameplay clip, shown inside an expanded project card.
 *
 * `preload="metadata"` with a poster is deliberate, and matches `ProjectEmbed`:
 * nothing but the still is fetched until the visitor presses play. These clips
 * are ~1MB each, which is cheap to play and needless to autoload.
 *
 * `aspect` matters here — a capture is not always 16:9, and forcing one on it
 * letterboxes the clip inside a box that is itself the wrong shape.
 */
export function ProjectVideo({ media, className }: { media: ProjectMedia; className?: string }) {
  if (!media.src) return null

  return (
    <video
      src={media.src}
      poster={media.poster}
      controls
      playsInline
      preload="metadata"
      aria-label={media.alt}
      style={{ aspectRatio: media.aspect ?? '16 / 9' }}
      className={cn('w-full bg-black', className)}
    >
      <track kind="captions" />
    </video>
  )
}
