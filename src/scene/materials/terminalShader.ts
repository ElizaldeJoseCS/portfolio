import * as THREE from 'three'

/**
 * Terminal panel surface for the Engineer world (spec §5.5): scanlines, a soft
 * CRT vignette, a slow phosphor sweep, and the blinking block cursor — all in
 * one fragment shader so the panel costs a single draw call.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec3  uAccent;
  uniform vec3  uBg;
  uniform float uOpacity;
  uniform vec2  uCursor;   // cursor position in UV space
  uniform float uMotion;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Panel base with a subtle top-down gradient.
    vec3 color = mix(uBg * 1.35, uBg, uv.y);

    // Scanlines. Frozen (but still visible) when motion is reduced.
    float lines = sin((uv.y + uTime * 0.05 * uMotion) * 420.0) * 0.5 + 0.5;
    color += uAccent * lines * 0.045;

    // Slow phosphor sweep — the "this thing is alive" cue.
    float sweep = smoothstep(0.35, 0.0, abs(fract(uTime * 0.06 * uMotion) - uv.y));
    color += uAccent * sweep * 0.09;

    // Blinking block cursor at ~1Hz, hard-edged like a real terminal.
    vec2 cell = vec2(0.018, 0.042);
    vec2 d = abs(uv - uCursor);
    float cursor = step(d.x, cell.x * 0.5) * step(d.y, cell.y * 0.5);
    float blink = step(0.5, fract(uTime * 0.9));
    color += uAccent * cursor * mix(1.0, blink, uMotion) * 1.4;

    // Edge glow + vignette.
    float edge = smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x) *
                 smoothstep(0.0, 0.03, uv.y) * smoothstep(1.0, 0.97, uv.y);
    color = mix(color + uAccent * 0.25, color, edge);

    vec2 c = uv - 0.5;
    float vignette = 1.0 - dot(c, c) * 0.55;

    gl_FragColor = vec4(color * vignette, uOpacity);
  }
`

export interface TerminalUniforms {
  uTime: THREE.IUniform<number>
  uAccent: THREE.IUniform<THREE.Color>
  uBg: THREE.IUniform<THREE.Color>
  uOpacity: THREE.IUniform<number>
  uCursor: THREE.IUniform<THREE.Vector2>
  uMotion: THREE.IUniform<number>
}

export function createTerminalMaterial() {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color('#5eeaa0') },
      uBg: { value: new THREE.Color('#101620') },
      uOpacity: { value: 0.92 },
      uCursor: { value: new THREE.Vector2(0.08, 0.72) },
      uMotion: { value: 1 },
    } satisfies TerminalUniforms,
  })
  return material as THREE.ShaderMaterial & { uniforms: TerminalUniforms }
}
