import * as THREE from 'three'

/**
 * Hero particle field (spec §5.3).
 *
 * All motion is computed on the GPU from `uTime` + a per-particle seed, so the
 * CPU never touches the position buffer after upload. `uMouse` adds parallax,
 * `uBlend` is lerped 0→1 across a world switch to re-orient and recolour the
 * cloud without rebuilding geometry.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uSize;
  uniform float uMaxSize;    // sprite cap in CSS pixels, set by the quality tier
  uniform float uBlend;      // 0 = game world, 1 = engineer world
  uniform float uPixelRatio;
  uniform float uMotion;     // 0 under prefers-reduced-motion

  attribute vec3  aSeed;     // stable per-particle randomness
  attribute float aScale;

  varying float vFade;
  varying float vMix;

  // Cheap value noise — good enough for drift, far cheaper than simplex.
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  vec3 drift(vec3 base, vec3 seed, float t) {
    float a = seed.x * 6.2831;
    float b = seed.y * 6.2831;
    float speed = 0.25 + seed.z * 0.45;
    return vec3(
      sin(t * speed + a) * 0.9,
      cos(t * speed * 0.85 + b) * 0.7,
      sin(t * speed * 0.6 + a + b) * 0.9
    );
  }

  void main() {
    vec3 base = position;

    // Engineer world pulls the cloud onto a flatter, lattice-like slab;
    // the game world lets it billow as a sphere.
    vec3 lattice = vec3(base.x, base.y * 0.42, base.z * 0.55);
    vec3 shaped = mix(base, lattice, uBlend);

    vec3 offset = drift(shaped, aSeed, uTime) * uMotion * mix(1.0, 0.45, uBlend);
    vec3 pos = shaped + offset;

    // Pointer parallax: nearer particles move more, which reads as depth.
    float depth = clamp((pos.z + 8.0) / 16.0, 0.0, 1.0);
    pos.xy += uMouse * mix(0.35, 1.2, depth);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // The name depth is already taken by the parallax term above; this one is
    // the distance from the camera in view space.
    float viewDepth = -mvPosition.z;

    /*
      Fade at both ends.

      Far is the depth cue it always was — written as 1.0 - smoothstep(lo, hi)
      because smoothstep with edge0 > edge1 is undefined in GLSL, however
      reliably drivers happen to handle it.

      Near is new, and it is a fill-rate measure. In the arena the chase camera
      flies *inside* this cloud (radius 5.5–11, camera ~10 units out), so a
      large share of the field sits a couple of units from the lens, where
      every sprite clamps to the size cap. Those are simultaneously the most
      expensive fragments on screen and the ugliest — hand-sized blobs sliding
      over the body copy.
    */
    float fadeFar  = 1.0 - smoothstep(4.0, 26.0, viewDepth);
    float fadeNear = smoothstep(1.5, 6.5, viewDepth);
    vFade = fadeFar * fadeNear;

    // Distance attenuation, capped hard: oversized points wash out the DOM
    // text sitting on top of the canvas.
    float attenuation = 90.0 / max(viewDepth, 0.001);
    gl_PointSize = min(uSize * aScale * attenuation, uMaxSize) * uPixelRatio;

    /*
      An invisible sprite still rasterises every fragment it covers, and this
      shader discards, which costs the fragment its early-Z. Push the vertex
      outside the clip volume instead so it produces nothing at all — setting
      gl_PointSize to 0 would not, since implementations clamp point size to
      ALIASED_POINT_SIZE_RANGE, whose minimum is typically 1.
    */
    if (vFade < 0.01) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);

    vMix = hash(aSeed);
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uAccent;
  uniform vec3  uAccentAlt;
  uniform float uOpacity;

  varying float vFade;
  varying float vMix;

  void main() {
    // Round, soft-edged sprite without a texture fetch.
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;

    float alpha = smoothstep(0.25, 0.0, d);
    vec3 color = mix(uAccent, uAccentAlt, vMix);

    // Small hot core: enough for the bloom pass to catch, not enough to flare.
    color += pow(alpha, 8.0) * 0.35;

    gl_FragColor = vec4(color, alpha * vFade * uOpacity);
  }
`

export interface HeroParticleUniforms {
  uTime: THREE.IUniform<number>
  uMouse: THREE.IUniform<THREE.Vector2>
  uSize: THREE.IUniform<number>
  uMaxSize: THREE.IUniform<number>
  uBlend: THREE.IUniform<number>
  uPixelRatio: THREE.IUniform<number>
  uMotion: THREE.IUniform<number>
  uAccent: THREE.IUniform<THREE.Color>
  uAccentAlt: THREE.IUniform<THREE.Color>
  uOpacity: THREE.IUniform<number>
}

export function createHeroParticleMaterial() {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSize: { value: 1.0 },
      uMaxSize: { value: 22 },
      uBlend: { value: 0 },
      uPixelRatio: { value: 1 },
      uMotion: { value: 1 },
      uAccent: { value: new THREE.Color('#ff3ea5') },
      uAccentAlt: { value: new THREE.Color('#38e8ff') },
      uOpacity: { value: 0.62 },
    } satisfies HeroParticleUniforms,
  })
  return material as THREE.ShaderMaterial & { uniforms: HeroParticleUniforms }
}

/**
 * Builds the static attribute buffers once. Positions are sampled on a shell
 * so the cloud reads as volumetric rather than as a solid ball.
 */
export function createHeroParticleGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const r = 5.5 + Math.random() * 5.5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75
    positions[i * 3 + 2] = r * Math.cos(phi)

    seeds[i * 3 + 0] = Math.random()
    seeds[i * 3 + 1] = Math.random()
    seeds[i * 3 + 2] = Math.random()

    // Long tail of small points with a few bright ones — avoids a uniform fizz.
    scales[i] = 0.35 + Math.pow(Math.random(), 3) * 1.8
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12)
  return geometry
}
