import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld } from '@/lib/world-context'
import { useThemeColors } from './useThemeColors'
import { createMatrixMaterial } from './materials/matrixShader'

/**
 * Engineer World scene: a dark room with a desk, and a laptop on it whose
 * screen rains 0s and 1s (owner's brief). Nothing floats, nothing orbits — the
 * console is the interface, and the scene is the room you are typing in.
 *
 * It is deliberately cheap: a handful of boxes, one shader plane, three lights.
 * All of the light in the room comes from the screen, which is why the desk and
 * the near wall are the only surfaces that read at all.
 */

/** Where the laptop stands, and how far it is turned toward the camera. */
const LAPTOP_POS: [number, number, number] = [-3.5, 0, 0.3]
const LAPTOP_TURN = 0.52

export function EngineerScene({ opacity }: { opacity: number }) {
  return (
    <group>
      <Room opacity={opacity} />
      <Desk opacity={opacity} />
      <DeskProps opacity={opacity} />
      <Laptop opacity={opacity} />
      <RoomLights opacity={opacity} />
    </group>
  )
}

/* ------------------------------------------------------------------ room -- */

function Room({ opacity }: { opacity: number }) {
  const colors = useThemeColors()

  // One material for every surface: the room is a single dark volume, and
  // sharing it keeps the whole shell at one program.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.95,
        metalness: 0.03,
        side: THREE.DoubleSide,
        transparent: true,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    material.color.copy(colors.bg).multiplyScalar(1.25)
    material.opacity = opacity
  }, [material, colors, opacity])

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, -2.85, -1]}>
        <planeGeometry args={[44, 40]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* back wall */}
      <mesh position={[-1, 3, -9.5]}>
        <planeGeometry args={[44, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* side walls */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-15, 3, -1]}>
        <planeGeometry args={[40, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[13, 3, -1]}>
        <planeGeometry args={[40, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-1, 8, -1]}>
        <planeGeometry args={[44, 40]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ desk -- */

const LEG_POSITIONS: [number, number, number][] = [
  [-6.0, -1.5, -1.2],
  [-6.0, -1.5, 1.5],
  [6.0, -1.5, -1.2],
  [6.0, -1.5, 1.5],
]

function Desk({ opacity }: { opacity: number }) {
  const surface = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0f1319',
        roughness: 0.82,
        metalness: 0.04,
        transparent: true,
      }),
    [],
  )
  const frame = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#080b0f',
        roughness: 0.9,
        metalness: 0.06,
        transparent: true,
      }),
    [],
  )

  useEffect(() => {
    surface.opacity = opacity
    frame.opacity = opacity
  }, [surface, frame, opacity])

  useEffect(
    () => () => {
      surface.dispose()
      frame.dispose()
    },
    [surface, frame],
  )

  return (
    <group>
      {/* top — wide enough to cross the frame, so the bottom of the viewport
          reads as "a table" rather than "a floating slab". */}
      <mesh position={[0, -0.09, 0.15]} receiveShadow>
        <boxGeometry args={[13.2, 0.18, 3.9]} />
        <primitive object={surface} attach="material" />
      </mesh>
      {/* front edge lip, catching the screen light */}
      <mesh position={[0, -0.22, 2.09]}>
        <boxGeometry args={[13.2, 0.1, 0.1]} />
        <primitive object={frame} attach="material" />
      </mesh>
      {LEG_POSITIONS.map((p) => (
        <mesh key={p.join()} position={p}>
          <boxGeometry args={[0.16, 2.65, 0.16]} />
          <primitive object={frame} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/** A mug, a notebook and a pen. Cheap, and they sell the room as lived in. */
function DeskProps({ opacity }: { opacity: number }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#171c22',
        roughness: 0.78,
        metalness: 0.06,
        transparent: true,
      }),
    [],
  )
  useEffect(() => {
    material.opacity = opacity
  }, [material, opacity])
  useEffect(() => () => material.dispose(), [material])

  return (
    <group>
      {/* mug */}
      <mesh position={[4.5, 0.19, 0.7]}>
        <cylinderGeometry args={[0.23, 0.2, 0.38, 20, 1, true]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[4.79, 0.19, 0.7]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.11, 0.028, 8, 18]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* notebook */}
      <mesh position={[3.4, 0.04, 1.5]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[1.15, 0.09, 0.82]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* pen */}
      <mesh position={[3.6, 0.11, 1.55]} rotation={[0, -0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.66, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- laptop -- */

function Laptop({ opacity }: { opacity: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()

  const screen = useMemo(() => createMatrixMaterial(), [])
  useEffect(() => () => screen.dispose(), [screen])
  useEffect(() => {
    screen.uniforms.uMotion.value = reducedMotion ? 0 : 1
  }, [screen, reducedMotion])

  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#12161c',
        roughness: 0.55,
        metalness: 0.35,
        transparent: true,
      }),
    [],
  )
  const deck = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0c0f14',
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
      }),
    [],
  )
  useEffect(
    () => () => {
      shell.dispose()
      deck.dispose()
    },
    [shell, deck],
  )
  useEffect(() => {
    shell.opacity = opacity
    deck.opacity = opacity
  }, [shell, deck, opacity])

  const glow = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    // The scene stays mounted while the Game World is showing; there is no
    // point advancing the rain nobody can see.
    if (opacity <= 0.001) return
    const u = screen.uniforms
    if (!reducedMotion) u.uTime.value += Math.min(delta, 0.1)
    u.uOpacity.value = opacity
    u.uAccent.value.copy(colors.accent)
    u.uAccentAlt.value.copy(colors.accentAlt)
    u.uBg.value.copy(colors.bg)

    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial
      mat.color.copy(colors.accent)
      mat.opacity = opacity * 0.055
    }
  })

  return (
    <group position={LAPTOP_POS} rotation={[0, LAPTOP_TURN, 0]}>
      {/* base */}
      <mesh position={[0, 0.06, 0.55]}>
        <boxGeometry args={[3.5, 0.12, 2.3]} />
        <primitive object={shell} attach="material" />
      </mesh>
      {/* Keyboard well + trackpad. Without these the base is one pale wedge
          under the screen light and stops reading as a laptop at all. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.121, 0.15]}>
        <planeGeometry args={[3.24, 1.35]} />
        <primitive object={deck} attach="material" />
      </mesh>
      <Keys material={deck} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.121, 1.28]}>
        <planeGeometry args={[1.2, 0.74]} />
        <primitive object={deck} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1215, 1.28]}>
        <planeGeometry args={[1.14, 0.68]} />
        <meshStandardMaterial
          color="#171c22"
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Lid, hinged at the back edge of the base and tipped away from you. */}
      <group position={[0, 0.1, -0.6]} rotation={[-0.3, 0, 0]}>
        <mesh position={[0, 1.1, -0.02]}>
          <boxGeometry args={[3.5, 2.26, 0.07]} />
          <primitive object={shell} attach="material" />
        </mesh>
        {/* The screen. Unlit — it is the light source, not a lit surface. */}
        <mesh position={[0, 1.12, 0.03]}>
          <planeGeometry args={[3.18, 1.94]} />
          <primitive object={screen} attach="material" />
        </mesh>
        {/* Soft bleed in front of the panel; also what the bloom pass grabs. */}
        <mesh ref={glow} position={[0, 1.12, 0.12]}>
          <planeGeometry args={[4.4, 3.1]} />
          <meshBasicMaterial
            transparent
            opacity={0.055}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The key caps, as one instanced mesh. 70 tiny boxes would otherwise be 70
 * draw calls for something the visitor only reads as texture.
 */
const KEY_COLS = 14
const KEY_ROWS = 5
const KEY_COUNT = KEY_COLS * KEY_ROWS

function Keys({ material }: { material: THREE.Material }) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    if (!mesh.current) return
    const dummy = new THREE.Object3D()
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        dummy.position.set(-1.5 + c * 0.231, 0.138, -0.36 + r * 0.222)
        dummy.updateMatrix()
        mesh.current.setMatrixAt(r * KEY_COLS + c, dummy.matrix)
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, KEY_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.185, 0.03, 0.175]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

/* ---------------------------------------------------------------- lights -- */

/**
 * The screen is the only real light in the room, so it is the only bright one.
 * Everything else is a hair of fill to keep the walls from going pure black —
 * pushing these up turns "dark room" back into "lit studio".
 */
function RoomLights({ opacity }: { opacity: number }) {
  const colors = useThemeColors()
  const spill = useRef<THREE.PointLight>(null)
  const bounce = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (spill.current) spill.current.intensity = opacity * 30
    if (bounce.current) bounce.current.intensity = opacity * 7
  })

  return (
    <>
      <ambientLight intensity={0.09} color={colors.accentAlt} />
      {/* screen spill, just in front of the lid */}
      <pointLight
        ref={spill}
        position={[-3.3, 1.55, 0.15]}
        color={colors.accent}
        intensity={30}
        distance={11}
        decay={2}
      />
      {/* a cold bounce off the back wall, separating the laptop from it */}
      <pointLight
        ref={bounce}
        position={[-2.4, 2.4, -4.2]}
        color={colors.accentAlt}
        intensity={7}
        distance={12}
        decay={2}
      />
    </>
  )
}
