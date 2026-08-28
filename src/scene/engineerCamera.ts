import * as THREE from 'three'

/**
 * Framing for the Engineer World room, consumed by `CameraRig` in
 * `SceneContainer`. It lives in its own module because it is neither a
 * component nor part of the rig — and exporting it from `EngineerScene.tsx`
 * would break that file's fast-refresh boundary.
 *
 * It is a three-quarter view for a reason: the console panel covers the middle
 * ~70% of the viewport, so a head-on laptop would sit entirely behind it. Off
 * to the left, the screen reads down the free margin instead.
 *
 * Only `CameraRig` may write `state.camera` — see the trap in CLAUDE.md.
 */
export const ENGINEER_CAMERA = {
  position: new THREE.Vector3(1.5, 1.85, 6.2),
  target: new THREE.Vector3(0.9, 0.9, -0.7),
}
