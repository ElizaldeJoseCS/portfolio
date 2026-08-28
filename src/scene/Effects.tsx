import { useMemo } from 'react'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

interface EffectsProps {
  /** 0 at rest, →1 mid world-switch. Drives the transition-only aberration. */
  transitionAmount: number
}

/**
 * Post-processing stack (spec §5.6). Mounted only on the high tier — the
 * caller drops this component entirely on low-power devices.
 */
export function Effects({ transitionAmount }: EffectsProps) {
  // Aberration is a transition garnish only; it fully fades out when idle.
  const offset = useMemo(
    () => new THREE.Vector2(transitionAmount * 0.0022, transitionAmount * 0.0016),
    [transitionAmount],
  )

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* Modest: bloom is the "stunning" beat, but it sits behind body copy,
          so the threshold stays high enough that only emissive cores flare. */}
      <Bloom
        intensity={0.95}
        luminanceThreshold={0.68}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.6}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.72} />
    </EffectComposer>
  )
}
