import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'
import { useWorld } from '@/lib/world-context'
import { toLinearTriplet } from '@/lib/theme'

/**
 * Optional per-project WebGL demo shown inside the project modal.
 * Lazy-loaded by `ProjectModal` so nothing here touches the initial bundle.
 * With no `glb` it renders a procedural stand-in rather than 404ing.
 */
export function ProjectWebglDemo({ glb }: { glb?: string }) {
  const { theme, reducedMotion } = useWorld()

  return (
    <div className="aspect-video w-full bg-surfaceAlt">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.2, 4], fov: 50 }}
      >
        <Suspense fallback={null}>
          {/* <Center> rather than drei's <Stage>: Stage drags in accumulative
              shadows and the HDR environment presets for no benefit here. */}
          <Center>{glb ? <GlbModel url={glb} /> : <PlaceholderMesh color={theme.accent} />}</Center>
        </Suspense>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 3]} intensity={1.4} />
        <OrbitControls
          makeDefault
          enablePan={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={1.1}
          minPolarAngle={0.4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  )
}

function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function PlaceholderMesh({ color }: { color: string }) {
  const [r, g, b] = toLinearTriplet(color)
  return (
    <mesh castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={[r, g, b]}
        flatShading
        roughness={0.35}
        metalness={0.4}
        emissive={[r * 0.25, g * 0.25, b * 0.25]}
      />
    </mesh>
  )
}
