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
export function HeroParticles() {
  const { world, reducedMotion, quality } = useWorld()
  const colors = useThemeColors()
  const viewport = useThree((s) => s.viewport)

  const geometry = useMemo(
    () => createHeroParticleGeometry(quality.particleCount),
    [quality.particleCount],
  )
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
