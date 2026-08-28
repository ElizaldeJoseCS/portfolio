import { Console } from '@/components/Console'
import { Footer } from '@/components/Footer'

/**
 * Engineer World.
 *
 * Unlike the Game World, this one is not a scrolling page: the whole world is a
 * console the visitor types into (owner's brief). It reads the same `src/data`
 * as everything else, but exposes **only** software-engineering work — game
 * projects are reachable by typing `game`.
 */
export function EngineerWorld() {
  return (
    <div className="relative flex min-h-[100svh] flex-col" data-world="engineer">
      {/* Blueprint grid + corner glow, kept out of the a11y tree. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5] opacity-[0.05] [background-image:linear-gradient(rgb(var(--c-accent)/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--c-accent)/0.5)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[6] bg-[radial-gradient(ellipse_at_80%_0%,rgb(var(--c-accent-alt)/0.16),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgb(var(--c-accent)/0.1),transparent_50%)]"
      />

      <div className="flex-1">
        <Console />
      </div>
      <Footer />
    </div>
  )
}
