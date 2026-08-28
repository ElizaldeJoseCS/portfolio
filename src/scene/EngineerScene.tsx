import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { profile, projects, skills } from '@/data'
import { useWorld } from '@/lib/world-context'
import { useThemeColors } from './useThemeColors'
import { createTerminalMaterial } from './materials/terminalShader'
import { useAutoRotate } from './useAutoRotate'
import { useFpsCap } from './useFpsCap'
import { useCodeTexture, type CodeLine } from './useCodeTexture'

/**
 * Engineer World scene (spec §5.5): a live terminal panel, a hoverable network
 * graph of the tech stack, and instanced micro-charts for skill levels.
 * Every string on screen is derived from `src/data` — nothing is hardcoded.
 */
export function EngineerScene({ opacity }: { opacity: number }) {
  const { quality } = useWorld()
  const colors = useThemeColors()

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} color={colors.accentAlt} />
      <pointLight position={[-5, 2, 3]} intensity={22} color={colors.accent} distance={26} />

      <TerminalPanel opacity={opacity} />
      <NetworkGraph opacity={opacity} nodeCount={quality.tier === 'high' ? 14 : 9} />
      <SkillBars opacity={opacity} />
      <WireframeAccents opacity={opacity} />
    </group>
  )
}

/** Turns real portfolio data into a tokenised, syntax-coloured code listing. */
function useTerminalLines(): CodeLine[] {
  return useMemo(() => {
    const featured = projects.filter((p) => p.featured).slice(0, 3)
    const lines: CodeLine[] = [
      [
        { text: '// ', kind: 'comment' },
        { text: `${profile.name.toLowerCase().replace(/\s+/g, '-')}.portfolio`, kind: 'comment' },
      ],
      [
        { text: 'const ', kind: 'keyword' },
        { text: 'engineer', kind: 'ident' },
        { text: ' = {', kind: 'punct' },
      ],
      [
        { text: '  roles: [', kind: 'punct' },
        { text: profile.roles.map((r) => `"${r}"`).join(', '), kind: 'string' },
        { text: '],', kind: 'punct' },
      ],
      [
        { text: '  based: ', kind: 'punct' },
        { text: `"${profile.location}"`, kind: 'string' },
        { text: ',', kind: 'punct' },
      ],
      [{ text: '  shipping: [', kind: 'punct' }],
      ...featured.map<CodeLine>((p) => [
        { text: '    { name: ', kind: 'punct' },
        { text: `"${p.title}"`, kind: 'string' },
        { text: ', year: ', kind: 'punct' },
        { text: p.year, kind: 'number' },
        { text: ' },', kind: 'punct' },
      ]),
      [{ text: '  ],', kind: 'punct' }],
      [
        { text: '  contact: ', kind: 'punct' },
        { text: `"${profile.email}"`, kind: 'string' },
        { text: ',', kind: 'punct' },
      ],
      [{ text: '}', kind: 'punct' }],
    ]
    return lines
  }, [])
}

function TerminalPanel({ opacity }: { opacity: number }) {
  const { reducedMotion, theme } = useWorld()
  const colors = useThemeColors()
  const lines = useTerminalLines()

  const palette = useMemo(
    () => ({
      keyword: `#${colors.accent.getHexString()}`,
      string: `#${colors.accentAlt.getHexString()}`,
      ident: `#${colors.fg.getHexString()}`,
      comment: 'rgba(138,156,172,0.75)',
      punct: 'rgba(200,214,228,0.8)',
      number: `#${colors.accentAlt.getHexString()}`,
    }),
    [colors],
  )

  const codeTexture = useCodeTexture({
    lines,
    palette,
    charsPerSecond: reducedMotion ? 0 : 46,
    // The scene stays mounted while the other world is showing; no point
    // re-rasterising and re-uploading the code canvas every frame then.
    enabled: opacity > 0.001,
  })

  const panelMaterial = useMemo(() => createTerminalMaterial(), [])
  useEffect(() => () => panelMaterial.dispose(), [panelMaterial])
  useEffect(() => {
    panelMaterial.uniforms.uMotion.value = reducedMotion ? 0 : 1
  }, [panelMaterial, reducedMotion])

  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const u = panelMaterial.uniforms
    if (!reducedMotion) u.uTime.value += Math.min(delta, 0.1)
    u.uOpacity.value = opacity * 0.94
    u.uAccent.value.copy(colors.accent)
    u.uBg.value.copy(colors.surface)

    if (group.current && !reducedMotion) {
      // Gentle parallax toward the pointer — the panel feels physical, not flat.
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        0.22 + state.pointer.x * 0.08,
        4,
        Math.min(delta, 0.1),
      )
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -state.pointer.y * 0.05,
        4,
        Math.min(delta, 0.1),
      )
    }
  })

  void theme

  return (
    <group ref={group} position={[-3.4, 0.4, -1.2]} rotation={[0, 0.22, 0]}>
      <mesh>
        <planeGeometry args={[6.4, 4]} />
        <primitive object={panelMaterial} attach="material" />
      </mesh>
      {/* Code layer sits just in front so the scanlines read behind the text. */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[6.4, 4]} />
        <meshBasicMaterial map={codeTexture} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {/* Bezel. */}
      <lineSegments position={[0, 0, 0.02]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(6.4, 4)]} />
        <lineBasicMaterial color={colors.accent} transparent opacity={opacity * 0.6} />
      </lineSegments>
    </group>
  )
}

interface GraphNode {
  label: string
  position: THREE.Vector3
  level: number
}

/**
 * Tech-stack network graph. Nodes are picked from the skills data, edges wired
 * ring-plus-chords so the layout stays legible. Hovering a node dims everything
 * that is not a neighbour.
 */
function NetworkGraph({ opacity, nodeCount }: { opacity: number; nodeCount: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()
  const [hovered, setHovered] = useState<number | null>(null)
  const group = useRef<THREE.Group>(null)

  const { nodes, edges } = useMemo(() => {
    const flat = skills
      .flatMap((g) => g.items)
      .filter((i) => typeof i.level === 'number')
      .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
      .slice(0, nodeCount)

    const list: GraphNode[] = flat.map((item, i) => {
      const angle = (i / flat.length) * Math.PI * 2
      const radius = 2.6 + (i % 3) * 0.55
      return {
        label: item.name,
        level: item.level ?? 0.5,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.72,
          Math.sin(angle * 2) * 0.9,
        ),
      }
    })

    // Ring edges keep the graph connected; chords add the "mesh" texture.
    const pairs: [number, number][] = []
    for (let i = 0; i < list.length; i++) {
      pairs.push([i, (i + 1) % list.length])
      if (i % 3 === 0) pairs.push([i, (i + Math.floor(list.length / 2)) % list.length])
    }
    return { nodes: list, edges: pairs }
  }, [nodeCount])

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      const pa = nodes[a]!.position
      const pb = nodes[b]!.position
      positions.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [edges, nodes])

  useEffect(() => () => lineGeometry.dispose(), [lineGeometry])

  const neighbours = useMemo(() => {
    if (hovered === null) return null
    const set = new Set<number>([hovered])
    for (const [a, b] of edges) {
      if (a === hovered) set.add(b)
      if (b === hovered) set.add(a)
    }
    return set
  }, [edges, hovered])

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return
    const dt = Math.min(delta, 0.1)
    group.current.rotation.y += dt * 0.08
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      state.pointer.y * 0.12,
      3,
      dt,
    )
    // Nodes breathe at slightly different rates so the graph never looks frozen.
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      if (child.type !== 'Mesh') return
      const node = nodes[i]
      if (!node) return
      const active = !neighbours || neighbours.has(i)
      const pulse = 1 + Math.sin(t * 1.6 + i) * 0.06
      const target = (0.1 + node.level * 0.14) * pulse * (active ? 1 : 0.6)
      child.scale.setScalar(THREE.MathUtils.damp(child.scale.x, target, 8, dt))
    })
  })

  return (
    <group ref={group} position={[3.2, 0.2, -0.5]}>
      {nodes.map((node, i) => {
        const active = !neighbours || neighbours.has(i)
        return (
          <mesh
            key={node.label}
            position={node.position}
            scale={0.1 + node.level * 0.14}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(i)
            }}
            onPointerOut={() => setHovered((h) => (h === i ? null : h))}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={i === hovered ? colors.accentAlt : colors.accent}
              emissive={i === hovered ? colors.accentAlt : colors.accent}
              emissiveIntensity={active ? 1.4 : 0.35}
              roughness={0.3}
              metalness={0.4}
              transparent
              opacity={opacity * (active ? 1 : 0.35)}
              flatShading
            />
          </mesh>
        )
      })}

      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={colors.accentAlt}
          transparent
          opacity={opacity * (hovered === null ? 0.35 : 0.18)}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}

/** Instanced skill bars — the data-viz beat from spec §5.5, one draw call. */
function SkillBars({ opacity }: { opacity: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()
  const mesh = useRef<THREE.InstancedMesh>(null)

  const levels = useMemo(
    () =>
      skills
        .flatMap((g) => g.items)
        .map((i) => i.level ?? 0.5)
        .slice(0, 28),
    [],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])
  // Rewriting 28 instance matrices every frame is wasted work for a subtle
  // wobble; 30Hz is indistinguishable and halves the CPU cost.
  const shouldUpdate = useFpsCap(30)

  useFrame((state) => {
    if (!mesh.current || !shouldUpdate() || opacity <= 0.001) return
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i]!
      const wobble = reducedMotion ? 1 : 1 + Math.sin(t * 1.4 + i * 0.4) * 0.06
      const height = level * 1.5 * wobble
      dummy.position.set(-3.4 + i * 0.24, -2.6 + height / 2, 1.2)
      dummy.scale.set(0.12, height, 0.12)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, levels.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={colors.accentAlt}
        emissive={colors.accentAlt}
        emissiveIntensity={0.6}
        transparent
        opacity={opacity * 0.75}
        roughness={0.4}
        metalness={0.3}
      />
    </instancedMesh>
  )
}

/** Thin wireframe volumes — IDE-grade geometry, cheap depth cues. */
function WireframeAccents({ opacity }: { opacity: number }) {
  const { reducedMotion } = useWorld()
  const colors = useThemeColors()
  const group = useAutoRotate({ speed: 0.12, enabled: !reducedMotion && opacity > 0.001 })

  return (
    <group ref={group}>
      {[
        { pos: [0, 2.9, -4] as const, size: 1.5 },
        { pos: [-5.5, -2.4, -3] as const, size: 1.1 },
        { pos: [5.2, 2.4, -3.5] as const, size: 0.9 },
      ].map((box, i) => (
        <lineSegments key={i} position={box.pos}>
          <edgesGeometry args={[new THREE.BoxGeometry(box.size, box.size, box.size)]} />
          <lineBasicMaterial
            color={i % 2 === 0 ? colors.accent : colors.accentAlt}
            transparent
            opacity={opacity * 0.4}
          />
        </lineSegments>
      ))}
    </group>
  )
}
