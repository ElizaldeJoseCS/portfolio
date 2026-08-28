import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A neon tube sign, rasterised into a canvas and hung on a plane.
 *
 * Real neon is a stroked outline with a lot of bloom around it, which is
 * exactly what `strokeText` + `shadowBlur` gives you for free — so the glyphs
 * are painted stroke-only, widest-and-dimmest first, up to a near-white core.
 * The plane is additive and unlit: in a near-black room a lit material comes
 * out grey no matter how hard you push the emissive (see CLAUDE.md).
 *
 * Fonts are the one asset this site fetches, and they may not have arrived when
 * the sign is first painted, so it repaints once `document.fonts` settles.
 */

interface Props {
  text: string
  /** Tube colour. The glow and the core are derived from it. */
  color?: string
  position?: [number, number, number]
  /** Plane width in world units; height follows the canvas aspect. */
  width?: number
  opacity?: number
  reducedMotion?: boolean
}

const CANVAS_W = 1024
const CANVAS_H = 340

export function NeonSign({
  text,
  color = '#ff3ea5',
  position = [0, 0, 0],
  width = 3.4,
  opacity = 1,
  reducedMotion = false,
}: Props) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = CANVAS_W
    c.height = CANVAS_H
    return c
  }, [])

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearFilter
    t.generateMipmaps = false
    return t
  }, [canvas])

  useEffect(() => () => texture.dispose(), [texture])

  const draw = useCallback(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    const cx = CANVAS_W / 2
    const cy = CANVAS_H / 2 + 4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.font = `700 132px 'Chakra Petch', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif`

    // Shrink to fit rather than clipping — the sign is data-driven copy.
    let size = 132
    while (ctx.measureText(text).width > CANVAS_W - 150 && size > 40) {
      size -= 4
      ctx.font = `700 ${size}px 'Chakra Petch', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif`
    }

    ctx.shadowColor = color
    // Widest + dimmest first, so the passes build a halo around a bright tube.
    const passes: [number, number, string][] = [
      [64, 26, 'rgba(255,62,165,0.20)'],
      [44, 17, 'rgba(255,62,165,0.34)'],
      [26, 10, 'rgba(255,86,180,0.62)'],
      [14, 5.5, 'rgba(255,150,210,0.95)'],
      [6, 2.2, 'rgba(255,232,246,1)'],
    ]
    for (const [blur, lineWidth, stroke] of passes) {
      ctx.shadowBlur = blur
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = stroke
      ctx.strokeText(text, cx, cy)
    }

    // Mounting rail, the bit that makes it read as a sign and not lettering.
    ctx.shadowBlur = 10
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(255,62,165,0.35)'
    ctx.beginPath()
    ctx.moveTo(70, 34)
    ctx.lineTo(CANVAS_W - 70, 34)
    ctx.stroke()

    texture.needsUpdate = true
  }, [canvas, color, text, texture])

  useEffect(() => {
    draw()
    // Repaint once the display face has actually loaded.
    document.fonts?.ready.then(draw).catch(() => {})
  }, [draw])

  const mesh = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    // Tube flicker: three detuned sines beat against each other, so it never
    // repeats on an obvious cycle, plus a rare hard blink.
    let flicker = 1
    if (!reducedMotion) {
      const t = state.clock.elapsedTime
      const n = Math.sin(t * 31.7) * Math.sin(t * 9.13) * Math.sin(t * 2.71)
      flicker = 0.9 + n * 0.1
      if (t % 6.3 < 0.05) flicker *= 0.35
    }
    if (mesh.current) {
      const mat = mesh.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * flicker
    }
    if (light.current) light.current.intensity = opacity * flicker * 11
  })

  const height = (width * CANVAS_H) / CANVAS_W

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Spill onto the wall and floor, so the sign lights the room it is in. */}
      <pointLight
        ref={light}
        position={[0, -0.2, 0.7]}
        color={color}
        intensity={11}
        distance={9}
        decay={2}
      />
    </group>
  )
}
