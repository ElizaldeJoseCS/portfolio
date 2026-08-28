import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld } from '@/lib/world-context'
import { useIsTouch } from '@/hooks/useIsMobile'
import { useThemeColors } from './useThemeColors'
import { useKeyboardInput } from './useKeyboardInput'
import { createGridMaterial } from './materials/gridShader'

const TRAIL_LENGTH = 42
const ARENA_RADIUS = 13

/**
 * Game World scene (spec §5.4): neon grid floor, floating low-poly props, and
 * a driveable centrepiece. Control scheme is WASD/arrows *and* pointer-drag,
 * per the recommendation in spec §14.2; touch devices get drag + auto-drift.
 */
export function GameScene({ opacity }: { opacity: number }) {
  const { reducedMotion, quality } = useWorld()
  const colors = useThemeColors()
  const group = useRef<THREE.Group>(null)

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.5}
        color={colors.accentAlt}
        castShadow={quality.shadows}
      />
      <pointLight position={[-6, 3, -4]} intensity={30} color={colors.accent} distance={30} />

      <GridFloor opacity={opacity} />
      <Rover opacity={opacity} />
      <FloatingProps opacity={opacity} count={quality.tier === 'high' ? 9 : 5} />
      {!reducedMotion && <Starfield opacity={opacity} count={quality.tier === 'high' ? 900 : 320} />}
    </group>
  )
}

function GridFloor({ opacity }: { opacity: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()
  const material = useMemo(() => createGridMaterial(), [])

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    material.uniforms.uMotion.value = reducedMotion ? 0 : 1
  }, [material, reducedMotion])

  useFrame((_, delta) => {
    if (!reducedMotion) material.uniforms.uTime.value += Math.min(delta, 0.1)
    material.uniforms.uOpacity.value = opacity
    material.uniforms.uAccent.value.copy(colors.accent)
    material.uniforms.uAccentAlt.value.copy(colors.accentAlt)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]} frustumCulled={false}>
      <planeGeometry args={[120, 120]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/**
 * The interactive centrepiece. Velocity-based movement with damping so it
 * carries momentum — grabbing and flinging it feels like a toy, which is the
 * whole point of the Game world.
 */
function Rover({ opacity }: { opacity: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()
  const { input, hasInput } = useKeyboardInput()
  const isTouch = useIsTouch()
  const gl = useThree((s) => s.gl)

  const body = useRef<THREE.Group>(null)
  const velocity = useRef(new THREE.Vector3())
  const position = useRef(new THREE.Vector3(0, -1.6, 0))
  const drag = useRef({ active: false, x: 0, y: 0 })

  // Pre-allocated trail buffer — no per-frame allocation (spec §5.2).
  const trail = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(TRAIL_LENGTH * 3)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setDrawRange(0, TRAIL_LENGTH)
    return { geometry, positions }
  }, [])
  const trailWrite = useRef(0)

  useEffect(() => () => trail.geometry.dispose(), [trail])

  // Pointer-drag steering, bound to the canvas so page scroll still works.
  useEffect(() => {
    const el = gl.domElement
    const onDown = (e: PointerEvent) => {
      drag.current = { active: true, x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.x
      const dy = e.clientY - drag.current.y
      drag.current.x = e.clientX
      drag.current.y = e.clientY
      velocity.current.x += dx * 0.02
      velocity.current.z += dy * 0.02
    }
    const onUp = () => {
      drag.current.active = false
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const v = velocity.current
    const p = position.current

    const { forward, right, boost } = input.current
    const accel = (boost ? 26 : 15) * dt
    v.x += right * accel
    v.z -= forward * accel

    // Idle drift so the scene is never dead, but only when nobody's driving.
    // Touch devices lean on this harder: there is no keyboard there, so the
    // centrepiece should read as an auto-playing showcase (spec §7).
    if (!hasInput.current && !drag.current.active && !reducedMotion) {
      const t = state.clock.elapsedTime
      const amp = isTouch ? 2.6 : 1.4
      v.x += Math.cos(t * 0.42) * amp * dt
      v.z += Math.sin(t * 0.35) * amp * dt
    }

    v.multiplyScalar(Math.pow(0.06, dt)) // exponential damping, frame-rate independent
    p.addScaledVector(v, dt)

    // Soft arena bounds: bounce rather than clamp so momentum survives.
    const dist = Math.hypot(p.x, p.z)
    if (dist > ARENA_RADIUS) {
      const nx = p.x / dist
      const nz = p.z / dist
      p.x = nx * ARENA_RADIUS
      p.z = nz * ARENA_RADIUS
      const dot = v.x * nx + v.z * nz
      v.x -= 2 * dot * nx * 0.6
      v.z -= 2 * dot * nz * 0.6
    }

    if (body.current) {
      const hover = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 2.2) * 0.12
      body.current.position.set(p.x, p.y + hover, p.z)
      // Breathing scale keeps the shell feeling alive without deforming it.
      const pulse = reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 3.1) * 0.045
      body.current.scale.setScalar(pulse)
      // Bank into the direction of travel.
      body.current.rotation.z = THREE.MathUtils.damp(body.current.rotation.z, -v.x * 0.06, 6, dt)
      body.current.rotation.x = THREE.MathUtils.damp(body.current.rotation.x, v.z * 0.06, 6, dt)
      if (v.lengthSq() > 0.02) {
        body.current.rotation.y = THREE.MathUtils.damp(
          body.current.rotation.y,
          Math.atan2(v.x, -v.z),
          5,
          dt,
        )
      }
    }

    // Ring-buffer trail: write head, then rebuild draw order cheaply.
    const idx = trailWrite.current
    trail.positions[idx * 3 + 0] = p.x
    trail.positions[idx * 3 + 1] = p.y - 0.15
    trail.positions[idx * 3 + 2] = p.z
    trailWrite.current = (idx + 1) % TRAIL_LENGTH
    trail.geometry.attributes.position!.needsUpdate = true
  })

  return (
    <group>
      <group ref={body} position={[0, -1.6, 0]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.85, 1]} />
          {/*
            `toneMapped={false}` keeps the neon saturated — ACES tone mapping
            otherwise pulls a bright accent toward white. Low metalness stops
            the environment map from turning the surface into a grey mirror.
            The "living surface" comes from the scale pulse in useFrame rather
            than drei's MeshWobbleMaterial, which is incompatible with the flat
            shading this low-poly look needs.
          */}
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={1.8}
            roughness={0.45}
            metalness={0.15}
            flatShading
            toneMapped={false}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* Halo ring reads as a hover thruster and catches the bloom pass. */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
          <torusGeometry args={[0.95, 0.05, 8, 40]} />
          <meshBasicMaterial color={colors.accentAlt} transparent opacity={opacity} />
        </mesh>
      </group>

      <points geometry={trail.geometry} frustumCulled={false}>
        <pointsMaterial
          size={0.16}
          sizeAttenuation
          color={colors.accentAlt}
          transparent
          opacity={opacity * 0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function FloatingProps({ opacity, count }: { opacity: number; count: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()
  const group = useRef<THREE.Group>(null)

  const props = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 7 + (i % 3) * 2.2
        return {
          position: [Math.cos(angle) * radius, -0.4 + (i % 4) * 1.15, Math.sin(angle) * radius] as const,
          scale: 0.45 + ((i * 37) % 60) / 100,
          kind: i % 3,
          phase: i * 0.7,
        }
      }),
    [count],
  )

  useFrame((state) => {
    if (!group.current || reducedMotion) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const p = props[i]
      if (!p) return
      child.position.y = p.position[1] + Math.sin(t * 0.7 + p.phase) * 0.35
      child.rotation.y = t * 0.25 + p.phase
      child.rotation.x = Math.sin(t * 0.3 + p.phase) * 0.4
    })
  })

  return (
    <group ref={group}>
      {props.map((p, i) => (
        <mesh key={i} position={p.position} scale={p.scale} castShadow>
          {p.kind === 0 ? (
            <boxGeometry args={[1, 1, 1]} />
          ) : p.kind === 1 ? (
            <octahedronGeometry args={[0.8, 0]} />
          ) : (
            <tetrahedronGeometry args={[0.9, 0]} />
          )}
          <meshStandardMaterial
            color={i % 2 === 0 ? colors.accent : colors.accentAlt}
            emissive={i % 2 === 0 ? colors.accent : colors.accentAlt}
            emissiveIntensity={0.85}
            roughness={0.5}
            metalness={0.2}
            flatShading
            toneMapped={false}
            transparent
            opacity={opacity * 0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

function Starfield({ opacity, count }: { opacity: number; count: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 30
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.35}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={opacity * 0.5}
        depthWrite={false}
      />
    </points>
  )
}
