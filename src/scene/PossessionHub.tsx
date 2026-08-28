import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld } from '@/lib/world-context'
import { useHub, INTERACT_RADIUS, type HubShell } from '@/lib/hub-context'
import { useThemeColors } from './useThemeColors'

/**
 * The possessable shells standing on the grid. Each one is a hollow husk —
 * empty until you take it over — so the visual reads as "a body waiting for an
 * occupant" rather than "a menu item".
 *
 * Proximity is computed here because the rover's position only exists inside
 * the R3F frame loop; the result is pushed to the hub context, which is
 * change-gated so the DOM does not re-render every frame.
 */
export function PossessionHub({ opacity }: { opacity: number }) {
  const { shells, playerPos, setNearbyId, possessedId, discovered } = useHub()
  const { reducedMotion } = useWorld()

  useFrame(() => {
    if (opacity <= 0.001) return

    let closest: string | null = null
    let closestDist = INTERACT_RADIUS

    for (const shell of shells) {
      // Horizontal distance only — the rover hovers, the shells stand.
      const dx = shell.position.x - playerPos.current.x
      const dz = shell.position.z - playerPos.current.z
      const dist = Math.hypot(dx, dz)
      if (dist < closestDist) {
        closestDist = dist
        closest = shell.id
      }
    }

    setNearbyId(closest)
  })

  return (
    <group>
      {shells.map((shell) => (
        <Shell
          key={shell.id}
          shell={shell}
          opacity={opacity}
          possessed={possessedId === shell.id}
          discovered={discovered.has(shell.id)}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  )
}

function Shell({
  shell,
  opacity,
  possessed,
  discovered,
  reducedMotion,
}: {
  shell: HubShell
  opacity: number
  possessed: boolean
  discovered: boolean
  reducedMotion: boolean
}) {
  const colors = useThemeColors()
  const { playerPos, nearbyId } = useHub()
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  const near = nearbyId === shell.id
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime

    if (group.current) {
      const hover = reducedMotion ? 0 : Math.sin(t * 1.1 + phase) * 0.14
      group.current.position.set(shell.position.x, shell.position.y + hover, shell.position.z)
      // Shells turn to face you once you are close enough to interact.
      if (near && !reducedMotion) {
        const dx = playerPos.current.x - shell.position.x
        const dz = playerPos.current.z - shell.position.z
        group.current.rotation.y = THREE.MathUtils.damp(
          group.current.rotation.y,
          Math.atan2(dx, dz),
          5,
          dt,
        )
      } else if (!reducedMotion) {
        group.current.rotation.y += dt * 0.25
      }
    }

    // Scale + glow lift on approach, so "you can act on this" is legible
    // before the DOM prompt is even read.
    const targetScale = possessed ? 1.32 : near ? 1.18 : 1
    if (body.current) {
      body.current.scale.setScalar(THREE.MathUtils.damp(body.current.scale.x, targetScale, 8, dt))
      const mat = body.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = THREE.MathUtils.damp(
        mat.emissiveIntensity,
        possessed ? 2.6 : near ? 1.9 : discovered ? 0.5 : 1.0,
        6,
        dt,
      )
      mat.opacity = opacity * (discovered && !near && !possessed ? 0.55 : 0.92)
    }

    // The core is the "occupant" — bright only while you are inside it.
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * (possessed ? 0.95 : near ? 0.4 : 0.12)
      inner.current.scale.setScalar(
        reducedMotion ? 1 : 1 + Math.sin(t * (possessed ? 6 : 2.4) + phase) * 0.12,
      )
    }

    if (halo.current) {
      const mat = halo.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * (near || possessed ? 0.85 : 0.25)
      halo.current.rotation.z += dt * (near ? 1.4 : 0.35)
      halo.current.scale.setScalar(
        THREE.MathUtils.damp(halo.current.scale.x, near || possessed ? 1.25 : 1, 7, dt),
      )
    }
  })

  return (
    <group ref={group}>
      {/* Husk: a faceted, translucent body. */}
      <mesh ref={body}>
        <capsuleGeometry args={[0.52, 0.9, 4, 12]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={1}
          roughness={0.45}
          metalness={0.2}
          flatShading
          toneMapped={false}
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>

      {/* Occupant core. */}
      <mesh ref={inner}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshBasicMaterial color={colors.accentAlt} transparent opacity={0.2} toneMapped={false} />
      </mesh>

      {/* Ground halo marking the interact radius. */}
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
        <ringGeometry args={[1.05, 1.16, 40]} />
        <meshBasicMaterial
          color={colors.accentAlt}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
