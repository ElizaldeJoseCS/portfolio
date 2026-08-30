import { lazy, Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { useWorld } from '@/lib/world-context'
import { useHub } from '@/lib/hub-context'
import { useThemeColors } from './useThemeColors'
import { useCrossfade } from './useCrossfade'
import { HeroParticles } from './HeroParticles'
import { GameScene } from './GameScene'
import { EngineerScene } from './EngineerScene'
import { ENGINEER_CAMERA } from './engineerCamera'
import { ProceduralEnvironment } from './ProceduralEnvironment'
import { DoorScene } from './DoorScene'
import { useDoorCamera } from './useDoorCamera'

/** Where the camera looks in every world but the Engineer room. */
const ORIGIN = new THREE.Vector3(0, 0, 0)

// The postprocessing library is ~50kB gzipped and low-tier devices never turn
// it on, so it loads only once the high-quality path is actually taken.
const Effects = lazy(() => import('./Effects').then((m) => ({ default: m.Effects })))

/**
 * The single full-viewport <Canvas> (spec §5.1). It is fixed behind the DOM
 * overlay, `pointer-events-none` at the wrapper level with pointer events
 * re-enabled on the canvas itself so dragging the Game world centrepiece works
 * without swallowing clicks on the UI above it.
 */
export function SceneContainer() {
  const { world, stage, reducedMotion, quality } = useWorld()
  const fade = useCrossfade(world, stage, reducedMotion)

  // 0 at rest, peaks at 1 halfway through a switch.
  const transitionAmount = 1 - Math.abs(fade.progress * 2 - 1)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      data-testid="scene-container"
    >
      <Canvas
        className="!pointer-events-auto"
        dpr={quality.dpr}
        /*
          MSAA on the default framebuffer is worth paying for only when we draw
          into it directly. With a post chain the scene is rendered into the
          composer's own targets and the backbuffer receives one fullscreen
          quad, so a multisampled backbuffer antialiased nothing and still cost
          a resolve every frame — an ANGLE/D3D11 resolve on Windows, where this
          site is slowest. The composer does the antialiasing instead (see
          `Effects`). R3F reads `gl` once at mount, so this is fixed for the
          session even if the tier degrades later.
        */
        gl={{
          antialias: !quality.postProcessing,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 8], fov: 60 }}
        // Nothing here needs a persistent framebuffer between frames.
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        {/*
          No <AdaptiveDpr />: it changes dpr behind our back and fought the
          tier's own dpr, and any dpr change resizes the drawing buffer, which
          reads as the whole scene jolting. `dpr` is now fixed for the session.

          There is no `onIncline` either — see `degrade()` in useQualityTier.
          Letting the tier climb back made the monitor oscillate, mounting and
          unmounting the bloom pass every second or so.
        */}
        <PerformanceMonitor
          onDecline={() => quality.degrade()}
          onFallback={() => {
            quality.degrade()
            quality.lock()
          }}
          flipflops={2}
        />

        <Suspense fallback={null}>
          <DemandFrameSync />
          <SceneBackdrop />
          <CameraRig />

          {/*
            Particles belong to the worlds only. On the landing they sat behind
            a page of body copy and made it feel restless, and in the door room
            they would break the "empty dark room" premise entirely.
          */}
          {stage === 'world' && <HeroParticles />}

          <group visible={stage === 'door'}>
            <DoorScene opacity={stage === 'door' ? 1 : 0} />
          </group>

          {/*
            Both scenes stay mounted; only their visibility flips. Unmounting
            one disposes its materials, and three would then have to recompile
            every program on the next switch — a multi-second stall on slower
            GPUs. Invisible groups cost no draw calls.
          */}
          <group visible={stage === 'world' && fade.showGame}>
            <GameScene opacity={fade.gameOpacity} />
          </group>
          <group visible={stage === 'world' && fade.showEngineer}>
            <EngineerScene opacity={fade.engineerOpacity} />
          </group>

          <ProceduralEnvironment />

          {quality.postProcessing && (
            <Suspense fallback={null}>
              <Effects transitionAmount={transitionAmount} />
            </Suspense>
          )}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

/**
 * With `frameloop="demand"` (reduced motion) R3F only renders when something
 * asks it to. Without this, switching worlds would leave the scene showing the
 * previous world's colours forever. A handful of invalidations after each
 * change lets the damped colour lerps settle.
 */
function DemandFrameSync() {
  const { world, stage, quality, reducedMotion } = useWorld()
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (!reducedMotion) return
    let frames = 0
    let raf = 0
    const pump = () => {
      invalidate()
      if (++frames < 90) raf = requestAnimationFrame(pump)
    }
    raf = requestAnimationFrame(pump)
    return () => cancelAnimationFrame(raf)
  }, [world, stage, quality.tier, reducedMotion, invalidate])

  return null
}

/** Fog + clear colour tinted by the active world. */
function SceneBackdrop() {
  const colors = useThemeColors()
  const { stage } = useWorld()
  const scene = useThree((s) => s.scene)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    if (stage === 'door') {
      scene.fog = null
      return
    }
    if (!scene.fog) scene.fog = new THREE.FogExp2(colors.bg.getHex(), 0.028)
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(colors.bg, 1 - Math.pow(0.005, dt))
    }
  })

  return null
}

/**
 * Gentle pointer-follow camera. Deliberately small amplitude — spec §15 flags
 * motion sickness, so this drifts rather than swings, and freezes entirely
 * under reduced motion.
 */
function CameraRig() {
  const { reducedMotion, stage, world } = useWorld()
  const { arenaActive, playerPos } = useHub()
  const target = useRef(new THREE.Vector3(0, 0, 8))
  const look = useRef(new THREE.Vector3())

  // The intro room drives the camera on a fixed path.
  useDoorCamera()

  useFrame((state, delta) => {
    if (stage === 'door') return
    const dt = Math.min(delta, 0.1)

    // In the arena the camera chases the rover, otherwise you drive straight
    // off the edge of the frame and lose the thing you are steering.
    if (arenaActive) {
      const p = playerPos.current
      target.current.set(p.x, p.y + 5.2, p.z + 9.5)
      state.camera.position.lerp(target.current, 1 - Math.pow(0.015, dt))
      // playerPos is a plain vector (see hub-context), so lerp component-wise.
      const k = 1 - Math.pow(0.005, dt)
      look.current.x += (p.x - look.current.x) * k
      look.current.y += (p.y - look.current.y) * k
      look.current.z += (p.z - look.current.z) * k
      state.camera.lookAt(look.current)
      return
    }

    /*
      The Engineer World is a room, not a backdrop, so it gets its own framing
      (see ENGINEER_CAMERA). The look target is lerped rather than snapped so
      arriving from the landing or from the Game World is a move, not a cut.
    */
    if (stage === 'world' && world === 'engineer') {
      const drift = reducedMotion ? 0 : 1
      const p = ENGINEER_CAMERA.position
      target.current.set(
        p.x + state.pointer.x * 0.45 * drift,
        p.y + state.pointer.y * 0.22 * drift,
        p.z,
      )
      state.camera.position.lerp(target.current, 1 - Math.pow(0.02, dt))
      look.current.lerp(ENGINEER_CAMERA.target, 1 - Math.pow(0.002, dt))
      state.camera.lookAt(look.current)
      return
    }

    look.current.lerp(ORIGIN, 1 - Math.pow(0.002, dt))
    if (reducedMotion) {
      state.camera.lookAt(look.current)
      return
    }
    // Scroll pushes the camera back a little, adding depth as you read.
    const scrollDepth = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 2)
    target.current.set(
      state.pointer.x * 0.9,
      state.pointer.y * 0.5 + scrollDepth * 0.4,
      8 + scrollDepth * 1.6,
    )
    state.camera.position.lerp(target.current, 1 - Math.pow(0.02, dt))
    state.camera.lookAt(look.current)
  })

  return null
}
