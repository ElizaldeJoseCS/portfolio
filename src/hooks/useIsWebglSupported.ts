import { useEffect, useState } from 'react'

/**
 * `null` while undetermined (SSR / first paint), then a definite boolean.
 * Keeping the tri-state avoids flashing the fallback on capable devices.
 */
export function useIsWebglSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    let ok = false
    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl2') ||
        canvas.getContext('webgl')) as WebGLRenderingContext | null
      ok = Boolean(gl)
      // Release the probe context immediately; browsers cap concurrent contexts.
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      ok = false
    }
    setSupported(ok)
  }, [])

  return supported
}
