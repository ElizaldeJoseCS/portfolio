import * as THREE from 'three'

/**
 * The laptop screen in the Engineer world: columns of 0s and 1s falling down a
 * dark LCD.
 *
 * The digits are drawn analytically in the fragment shader rather than
 * rasterised into a 2D canvas. That keeps the whole screen at one draw call
 * with zero per-frame CPU work, keeps it crisp at any resolution, and keeps the
 * site's "no external runtime assets" rule intact — no font is fetched just to
 * draw a glyph.
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
  uniform float uOpacity;
  uniform float uMotion;   // 0 under prefers-reduced-motion
  uniform vec3  uAccent;
  uniform vec3  uAccentAlt;
  uniform vec3  uBg;
  uniform vec2  uGrid;     // columns, rows

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  /**
   * '0' and '1' as analytic shapes in cell space, p in [-0.5, 0.5].
   * The 'one' argument selects between them.
   *
   * smoothstep is always written low-edge-first: GLSL leaves the result
   * undefined when edge0 > edge1, and some drivers do take that literally.
   */
  float digit(vec2 p, float one) {
    // 0 — an ellipse ring.
    float r = length(p / vec2(0.24, 0.36));
    float zero = (1.0 - smoothstep(0.94, 1.06, r)) * smoothstep(0.48, 0.60, r);

    // 1 — stem, top flag, foot.
    vec2 st = abs(p - vec2(0.03, 0.0));
    float stem = step(st.x, 0.062) * step(st.y, 0.35);
    vec2 fl = abs(p - vec2(-0.085, 0.235));
    float flag = step(fl.x, 0.08) * step(fl.y, 0.052);
    vec2 ft = abs(p - vec2(0.02, -0.335));
    float foot = step(ft.x, 0.165) * step(ft.y, 0.05);
    float uno = min(1.0, stem + flag + foot);

    return mix(zero, uno, one);
  }

  void main() {
    vec2 g = vUv * uGrid;
    vec2 cell = floor(g);
    vec2 p = fract(g) - 0.5;

    float t = uTime * uMotion;
    float col = cell.x;

    // Rows counted from the top so a stream reads as falling.
    float row = uGrid.y - 1.0 - cell.y;

    float speed = 5.0 + hash(vec2(col, 3.0)) * 13.0;   // rows per second
    float trail = 7.0 + hash(vec2(col, 11.0)) * 15.0;  // rows lit behind the head
    float cycle = uGrid.y + trail;
    float head = mod(t * speed + hash(vec2(col, 7.0)) * cycle, cycle);

    float behind = head - row;
    float lit = behind >= 0.0 ? max(0.0, 1.0 - behind / trail) : 0.0;
    lit = pow(lit, 1.7);
    float isHead = 1.0 - smoothstep(0.0, 1.7, abs(behind));

    // Every cell re-rolls its digit a few times a second. The churn is what
    // makes the stream read as data rather than as a texture.
    float tick = floor(t * (2.0 + hash(vec2(col, 17.0)) * 6.0) + cell.y * 0.61);
    float one = step(0.5, hash(cell + vec2(tick * 1.37, tick * 0.71)));

    float mask = digit(p, one);

    // Dark LCD base with a faint top-down gradient.
    vec3 color = mix(uBg * 2.2, uBg * 0.9, vUv.y);

    // The trail, then a near-white leading character.
    vec3 glyph = mix(uAccent, uAccentAlt, 0.2);
    color += glyph * mask * (lit * 2.8 + 0.06);
    color += vec3(0.85, 1.0, 0.92) * mask * isHead * lit * 1.5;

    // Column wash, so a bright stream throws light between its glyphs too.
    color += uAccent * lit * 0.06;

    // Scanlines + vignette: this is a screen, not a poster.
    float scan = sin(vUv.y * uGrid.y * 6.2831) * 0.5 + 0.5;
    color *= 0.9 + scan * 0.14;

    vec2 c = vUv - 0.5;
    color *= 1.0 - dot(c, c) * 0.42;

    gl_FragColor = vec4(color, uOpacity);
  }
`

export interface MatrixUniforms {
  uTime: THREE.IUniform<number>
  uOpacity: THREE.IUniform<number>
  uMotion: THREE.IUniform<number>
  uAccent: THREE.IUniform<THREE.Color>
  uAccentAlt: THREE.IUniform<THREE.Color>
  uBg: THREE.IUniform<THREE.Color>
  uGrid: THREE.IUniform<THREE.Vector2>
}

export function createMatrixMaterial() {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uMotion: { value: 1 },
      uAccent: { value: new THREE.Color('#5eeaa0') },
      uAccentAlt: { value: new THREE.Color('#6ea8fe') },
      uBg: { value: new THREE.Color('#070b10') },
      uGrid: { value: new THREE.Vector2(46, 28) },
    } satisfies MatrixUniforms,
  })
  return material as THREE.ShaderMaterial & { uniforms: MatrixUniforms }
}
