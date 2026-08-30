/**
 * One WebGL probe, shared.
 *
 * Three places need to know about the GPU before anything renders — the door
 * room (skip the intro without WebGL), the quality tier, and the no-WebGL
 * notice — and each used to create its own throwaway context. Contexts are a
 * capped resource and creation is not free on Windows, so this resolves once
 * and hands the same answer to all three.
 *
 * It is safe to call from a state initialiser: everything here is synchronous.
 */

export interface GpuProbe {
  supported: boolean
  /**
   * `UNMASKED_RENDERER_WEBGL`, or `''` when the browser withholds it (Firefox
   * masks it by default). Empty means "unknown", never "bad" — see
   * `isWeakGpu`.
   */
  renderer: string
}

let cached: GpuProbe | null = null

export function probeGpu(): GpuProbe {
  if (cached) return cached
  if (typeof window === 'undefined') return { supported: false, renderer: '' }

  let result: GpuProbe = { supported: false, renderer: '' }
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (gl) {
      const info = gl.getExtension('WEBGL_debug_renderer_info')
      result = {
        supported: true,
        renderer: info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '') : '',
      }
    }
    // Release it immediately; browsers cap concurrent contexts and the real
    // canvas needs one.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    result = { supported: false, renderer: '' }
  }

  cached = result
  return result
}

/**
 * Whether this GPU should be treated as low-power regardless of what the CPU
 * reports.
 *
 * The tier heuristic used to key off `hardwareConcurrency` and `deviceMemory`
 * alone, which is a proxy for the wrong chip: a desktop with eight cores and
 * 16GB behind Intel UHD graphics scored `high` and then got bloom, 4200
 * additive sprites and a full-resolution buffer. This is the correction.
 *
 * Deliberately a short list. An unrecognised renderer stays on `high` — the
 * PerformanceMonitor is still there to catch what this misses, and demoting a
 * capable GPU by accident is the worse error.
 */
export function isWeakGpu(renderer: string): boolean {
  if (!renderer) return false
  const r = renderer.toLowerCase()

  // Software rasterisers. Anything here cannot afford post-processing.
  if (/swiftshader|llvmpipe|softpipe|basic render|software/.test(r)) return true

  // Intel's pre-Xe integrated parts. Iris Xe and Arc are left alone; they are
  // a different class of chip and cope with the high tier.
  if (/intel/.test(r) && /\b(u?hd|iris) graphics\b/.test(r) && !/\bxe\b|arc/.test(r)) return true

  return false
}
