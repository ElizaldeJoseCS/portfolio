import { WorldSections, type SectionKey } from './sharedWorldSections'

/**
 * Game World layout (spec §4.1).
 *
 * Ordering leads with the work and keeps the story loud: projects, then the
 * loadout, then the run history. Chrome is arcade-flavoured — corner brackets,
 * a scanline wash, heavy accent rules.
 */
const ORDER: readonly SectionKey[] = ['hero', 'projects', 'skills', 'experience', 'about', 'contact']

export function GameWorld() {
  return (
    <div className="relative" data-world="game">
      {/* Decorative CRT wash. Kept behind content and out of the a11y tree. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5] opacity-[0.07] [background-image:repeating-linear-gradient(0deg,rgb(var(--c-accent)/0.6)_0px,rgb(var(--c-accent)/0.6)_1px,transparent_1px,transparent_3px)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--c-accent)/0.18),transparent_55%),radial-gradient(ellipse_at_20%_100%,rgb(var(--c-accent-alt)/0.14),transparent_50%)]"
      />
      <WorldSections order={ORDER} />
    </div>
  )
}
