import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface CodeToken {
  text: string
  /** Maps to a colour slot so the palette stays theme-driven. */
  kind: 'keyword' | 'string' | 'ident' | 'comment' | 'punct' | 'number'
}

export type CodeLine = CodeToken[]

interface Options {
  lines: CodeLine[]
  palette: Record<CodeToken['kind'], string>
  /** Characters revealed per second. 0 renders everything immediately. */
  charsPerSecond?: number
  width?: number
  height?: number
  /** False while the panel is hidden — skips the redraw and texture upload. */
  enabled?: boolean
}

/**
 * Renders syntax-coloured code into a 2D canvas with a typewriter reveal, then
 * exposes it as a texture. Deliberately not drei's <Text>: troika fetches a
 * font over the network, and a canvas keeps the site at zero external assets.
 *
 * The same text also exists in the DOM overlay, so screen readers are covered
 * (spec §8) — this is purely decorative.
 */
export function useCodeTexture({
  lines,
  palette,
  charsPerSecond = 34,
  width = 1024,
  height = 640,
  enabled = true,
}: Options) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    return c
  }, [width, height])

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearFilter
    t.generateMipmaps = false
    return t
  }, [canvas])

  useEffect(() => () => texture.dispose(), [texture])

  const revealed = useRef(0)
  const totalChars = useMemo(
    () => lines.reduce((sum, line) => sum + line.reduce((s, t) => s + t.text.length, 0) + 1, 0),
    [lines],
  )

  // Redraw only when the visible character count actually changes.
  const lastDrawn = useRef(-1)

  const draw = useMemo(() => {
    return (limit: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      ctx.font = '26px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textBaseline = 'top'

      const lineHeight = 38
      const padX = 42
      let padY = 34
      let budget = limit

      for (const line of lines) {
        if (budget <= 0) break
        let x = padX
        for (const token of line) {
          if (budget <= 0) break
          const slice = token.text.slice(0, budget)
          ctx.fillStyle = palette[token.kind]
          ctx.fillText(slice, x, padY)
          x += ctx.measureText(slice).width
          budget -= slice.length
        }
        budget -= 1 // newline
        padY += lineHeight
        if (padY > height - lineHeight) break
      }
      texture.needsUpdate = true
    }
  }, [canvas, height, lines, palette, texture, width])

  useFrame((_, delta) => {
    if (!enabled) return
    if (charsPerSecond <= 0) {
      if (lastDrawn.current !== totalChars) {
        lastDrawn.current = totalChars
        draw(totalChars)
      }
      return
    }
    if (revealed.current < totalChars) {
      revealed.current = Math.min(totalChars, revealed.current + delta * charsPerSecond)
    }
    const shown = Math.floor(revealed.current)
    if (shown !== lastDrawn.current) {
      lastDrawn.current = shown
      draw(shown)
    }
  })

  return texture
}
