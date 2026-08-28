import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Procedural image-based lighting (spec §5.7: no HDR download).
 *
 * Builds a tiny scene of emissive planes, runs it through PMREMGenerator once,
 * and assigns the result as `scene.environment` so metals have something to
 * reflect. Replaces drei's <Environment>, which statically pulls in the RGBE
 * and EXR loaders even when you only use lightformers.
 */
export function ProceduralEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()

    const source = new THREE.Scene()
    source.background = new THREE.Color(0x05060a)

    // Deliberately world-neutral. Tinting these with the active accents meant
    // regenerating the PMREM on every world switch, which stalls the main
    // thread for the whole crossfade. The worlds already read as different
    // through their lights and emissive materials.
    const panels: { pos: [number, number, number]; scale: [number, number]; color: number; power: number }[] = [
      { pos: [0, 6, -8], scale: [16, 9], color: 0xffffff, power: 2.4 },
      { pos: [-9, 1, 4], scale: [7, 7], color: 0xbcd2ff, power: 1.8 },
      { pos: [9, -3, 3], scale: [6, 6], color: 0xffd9ec, power: 1.4 },
    ]

    const disposables: THREE.BufferGeometry[] = []
    for (const panel of panels) {
      const geometry = new THREE.PlaneGeometry(panel.scale[0], panel.scale[1])
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(panel.color).multiplyScalar(panel.power),
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...panel.pos)
      mesh.lookAt(0, 0, 0)
      source.add(mesh)
      disposables.push(geometry)
    }

    const target = pmrem.fromScene(source, 0.04)
    scene.environment = target.texture

    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      disposables.forEach((g) => g.dispose())
      source.traverse((o) => {
        if (o instanceof THREE.Mesh) (o.material as THREE.Material).dispose()
      })
    }
    // Built exactly once per renderer — never per world switch.
  }, [gl, scene])

  return null
}
