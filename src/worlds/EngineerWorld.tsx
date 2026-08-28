import { WorldSections, type SectionKey } from './sharedWorldSections'

/**
 * Engineer World layout (spec §4.1).
 *
 * Reads like documentation: the timeline comes before the toolkit, and the
 * chrome is a faint blueprint grid rather than a CRT. Same components, same
 * data — different narrative order and different surface.
 */
const ORDER: readonly SectionKey[] = ['hero', 'projects', 'experience', 'skills', 'about', 'contact']

export function EngineerWorld() {
  return (
    <div className="relative" data-world="engineer">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5] opacity-[0.05] [background-image:linear-gradient(rgb(var(--c-accent)/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--c-accent)/0.5)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] bg-[radial-gradient(ellipse_at_80%_0%,rgb(var(--c-accent-alt)/0.16),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgb(var(--c-accent)/0.1),transparent_50%)]"
      />
      <WorldSections order={ORDER} />
    </div>
  )
}
