import * as THREE from 'three'

/**
 * Game-world floor: an infinite-feeling neon grid that fades with distance.
 * A shader beats drei's <Grid> here because the pulse travels along the lines,
 * which is what sells the arcade feel.
 */

const vertexShader = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec3  uAccent;
  uniform vec3  uAccentAlt;
  uniform float uOpacity;
  uniform float uMotion;

  varying vec2 vWorld;

  // Antialiased line mask using screen-space derivatives.
  float gridLine(vec2 p, float spacing, float thickness) {
    vec2 g = abs(fract(p / spacing - 0.5) - 0.5) * spacing;
    vec2 w = fwidth(p) * thickness;
    vec2 line = smoothstep(w, vec2(0.0), g);
    return max(line.x, line.y);
  }

  void main() {
    vec2 p = vWorld;
    p.y += uTime * 1.2 * uMotion;   // lines scroll toward the camera

    float fine  = gridLine(p, 1.0, 1.0) * 0.35;
    float major = gridLine(p, 5.0, 1.6) * 0.9;

    float dist = length(vWorld);
    float fade = smoothstep(46.0, 6.0, dist);

    // Pulse ring travelling outward from the centrepiece.
    float pulse = smoothstep(0.35, 0.0, abs(fract(uTime * 0.14 * uMotion) * 46.0 - dist)) * 0.55;

    vec3 color = mix(uAccentAlt, uAccent, clamp(dist / 30.0, 0.0, 1.0));
    float alpha = (fine + major + pulse) * fade * uOpacity;
    if (alpha < 0.002) discard;

    gl_FragColor = vec4(color, alpha);
  }
`

export interface GridUniforms {
  uTime: THREE.IUniform<number>
  uAccent: THREE.IUniform<THREE.Color>
  uAccentAlt: THREE.IUniform<THREE.Color>
  uOpacity: THREE.IUniform<number>
  uMotion: THREE.IUniform<number>
}

export function createGridMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color('#ff3ea5') },
      uAccentAlt: { value: new THREE.Color('#38e8ff') },
      uOpacity: { value: 1 },
      uMotion: { value: 1 },
    } satisfies GridUniforms,
  }) as THREE.ShaderMaterial & { uniforms: GridUniforms }
}
