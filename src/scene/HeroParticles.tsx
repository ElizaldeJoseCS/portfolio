import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld } from '@/lib/world-context'
import { useThemeColors } from './useThemeColors'
import {
  createHeroParticleGeometry,
  createHeroParticleMaterial,
} from './materials/heroParticleShader'

/**
 * The signature hero effect (spec §5.3). Lives outside both worlds so it
 * survives the crossfade and simply re-shapes/recolours as `uBlend` lerps.
 */
/** Upper bound on the allocation; the tier selects a draw range within it. */
const MAX_PARTICLES = 4200

/** Resting opacity in the Game World; the Engineer room fades this to zero. */
const BASE_OPACITY = 0.62

export function HeroParticles() {
  const { world, reducedMotion, quality } = useWorld()
  const colors = useThemeColors()
  const viewport = useThree((s) => s.viewport)

  /**
   * Allocated once at the high-tier count. Rebuilding the buffers whenever the
   * quality tier changed thrashed the GPU and made the field visibly pop; the
   * tier now just narrows the draw range over the same allocation.
   */
  const geometry = useMemo(() => createHeroParticleGeometry(MAX_PARTICLES), [])

  useEffect(() => {
    geometry.setDrawRange(0, Math.min(quality.particleCount, MAX_PARTICLES))
  }, [geometry, quality.particleCount])
  const material = useMemo(() => createHeroParticleMaterial(), [])

  // Dispose GPU buffers when the count changes or the scene unmounts.
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  const pointer = useRef(new THREE.Vector2())
  const targetBlend = world === 'engineer' ? 1 : 0

  useEffect(() => {
    material.uniforms.uPixelRatio.value = viewport.dpr
    material.uniforms.uMotion.value = reducedMotion ? 0 : 1
    material.uniforms.uSize.value = quality.tier === 'high' ? 1.0 : 1.35
  }, [material, viewport.dpr, reducedMotion, quality.tier])

  useFrame((state, delta) => {
    const u = material.uniforms
    const dt = Math.min(delta, 0.1)

    if (!reducedMotion) u.uTime.value += dt

    // Pointer parallax, damped so it trails the cursor instead of snapping.
    pointer.current.lerp(state.pointer, 1 - Math.pow(0.001, dt))
    u.uMouse.value.set(pointer.current.x * 0.6, pointer.current.y * 0.4)

    /*
      The Engineer World is a dark room now, and a field of drifting motes in
      the middle of it breaks that premise — so the field fades out on the way
      in rather than being unmounted, which would pop mid-crossfade.
    */
    u.uOpacity.value = THREE.MathUtils.damp(
      u.uOpacity.value,
      world === 'engineer' ? 0 : BASE_OPACITY,
      5,
      dt,
    )

    // World blend + colour lerp: this is what makes the switch feel continuous.
    u.uBlend.value = THREE.MathUtils.damp(u.uBlend.value, targetBlend, 6, dt)
    u.uAccent.value.lerp(colors.accent, 1 - Math.pow(0.005, dt))
    u.uAccentAlt.value.lerp(colors.accentAlt, 1 - Math.pow(0.005, dt))
  })

  return (
    <points frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  )
}
