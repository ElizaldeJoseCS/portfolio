import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld, DOOR_SEQUENCE_MS } from '@/lib/world-context'
import { NeonSign } from './NeonSign'

/**
 * The intro room: an empty dark space with a single white door.
 *
 * It exists to teach the site's verb — press E — before the visitor needs it in
 * the possession arena, and to give the landing a threshold instead of a
 * scroll. It is deliberately cheap: six planes, one door, two lights.
 */

const OPEN_AT = 0.0 // fraction of the sequence when the swing starts

export function DoorScene({ opacity }: { opacity: number }) {
  const { doorState, reducedMotion } = useWorld()
  const t = useRef(0)

  const doorPivot = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)
  const spill = useRef<THREE.PointLight>(null)

  useEffect(() => {
    if (doorState === 'closed') t.current = 0
  }, [doorState])

  useFrame((_, delta) => {
    if (doorState === 'opening') {
      t.current = Math.min(1, t.current + delta / (DOOR_SEQUENCE_MS / 1000))
    }
    const p = t.current

    // Swing: eased, and it keeps going while the camera moves so you see the
    // door pass you rather than snap open.
    const swing = THREE.MathUtils.clamp((p - OPEN_AT) / 0.55, 0, 1)
    const eased = 1 - Math.pow(1 - swing, 3)
    if (doorPivot.current) doorPivot.current.rotation.y = -eased * (Math.PI * 0.62)

    // Light floods out of the opening as it widens.
    const flood = THREE.MathUtils.clamp((p - OPEN_AT) / 0.7, 0, 1)
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * (0.05 + flood * 0.95)
    }
    if (spill.current) spill.current.intensity = flood * 26
  })

  return (
    <group>
      {/* Room. Near-black, faintly reflective so the door reads as the only
          light source in the space. */}
      <Room opacity={opacity} />

      {/*
        What lies beyond. This has to sit *in front of* the back wall — behind
        it, the wall occludes the opening and the door reveals nothing.
        Depth order front→back: slab -5.98, glow -6.03, frame -6.07, wall -6.12.
      */}
      <mesh ref={glow} position={[0, -0.55, -6.03]}>
        <planeGeometry args={[1.35, 2.75]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} toneMapped={false} />
      </mesh>
      <pointLight
        ref={spill}
        position={[0, -0.7, -5.5]}
        color="#ffffff"
        intensity={0}
        distance={13}
      />

      {/* Pink neon over the door. The room has exactly two light sources now:
          the sign, and whatever is on the other side of the door. */}
      <NeonSign
        text="welcome in"
        color="#ff3ea5"
        position={[0, 1.85, -5.98]}
        width={3.6}
        opacity={opacity}
        reducedMotion={reducedMotion}
      />

      {/* Door frame. */}
      <mesh position={[0, -0.55, -6.07]}>
        <planeGeometry args={[1.62, 3.0]} />
        <meshStandardMaterial color="#15151c" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* The door itself, hinged on its left edge. */}
      <group ref={doorPivot} position={[-0.675, -0.55, -5.98]}>
        {/*
          The door is self-lit rather than lit by the room. In a near-black
          space a purely reflective white surface just reads as grey, and the
          brief is a *white* door — so it carries its own emission and is the
          only bright object in the scene.
        */}
        <mesh position={[0.675, 0, 0]}>
          <boxGeometry args={[1.35, 2.75, 0.08]} />
          {/*
            Unlit on purpose. A lit material in a near-black room comes out
            grey no matter how hard you push the emissive, because ACES tone
            mapping rolls the highlight off. Basic + toneMapped={false} is the
            only way to get an actually-white door.
          */}
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        {/* Recessed panel, so the slab still reads as a door and not a rectangle. */}
        <mesh position={[0.675, 0.12, 0.045]}>
          <planeGeometry args={[0.92, 1.9]} />
          <meshBasicMaterial color="#e2e2dd" toneMapped={false} />
        </mesh>
        {/* Handle. */}
        <mesh position={[1.22, -0.05, 0.09]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color="#8d8d86" toneMapped={false} />
        </mesh>
      </group>

      <ambientLight intensity={0.14} />
      {/* Soft key aimed *at the door*, not at the origin — the default spot
          target is (0,0,0), which left the door six units out of the pool. */}
      <SpotOnDoor />
      {/* A little bounce so the floor in front of the door is legible. */}
      <pointLight position={[0, 0.4, -3.4]} intensity={9} distance={11} color="#c9d2ff" />
    </group>
  )
}

function SpotOnDoor() {
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    target.position.set(0, -0.55, -6)
    if (light.current) light.current.target = target
  }, [target])

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        position={[0, 3.4, -3.2]}
        angle={0.7}
        penumbra={1}
        intensity={48}
        distance={14}
        color="#dfe4ff"
      />
    </>
  )
}

function Room({ opacity }: { opacity: number }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0b0b11',
        roughness: 0.92,
        metalness: 0.04,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      }),
    [opacity],
  )

  useEffect(() => () => material.dispose(), [material])

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -2]} receiveShadow>
        <planeGeometry args={[16, 20]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 1, -6.12]}>
        <planeGeometry args={[16, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* side walls */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 1, -2]}>
        <planeGeometry args={[20, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 1, -2]}>
        <planeGeometry args={[20, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.4, -2]}>
        <planeGeometry args={[16, 20]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  )
}
