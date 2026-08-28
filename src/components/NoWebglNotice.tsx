/**
 * Shown in place of the canvas when WebGL is unavailable (spec §9).
 * The DOM content underneath keeps working — this only explains the missing
 * 3D layer and paints a static gradient so the page still has depth.
 */
export function NoWebglNotice() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--c-accent)/0.22),transparent_55%),radial-gradient(ellipse_at_20%_100%,rgb(var(--c-accent-alt)/0.18),transparent_50%)]"
      />
      <p className="fixed bottom-4 right-4 z-40 max-w-[260px] rounded-world border border-line/70 bg-surface/85 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted backdrop-blur">
        WebGL is unavailable in this browser, so the 3D scene is off. Everything else on the page
        works normally.
      </p>
    </>
  )
}
