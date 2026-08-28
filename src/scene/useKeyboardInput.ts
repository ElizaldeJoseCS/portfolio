import { useEffect, useRef } from 'react'

export interface InputMap {
  forward: number
  right: number
  boost: boolean
}

const KEYS: Record<string, keyof InputMap | undefined> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'forward',
  ArrowDown: 'forward',
  KeyA: 'right',
  ArrowLeft: 'right',
  KeyD: 'right',
  ArrowRight: 'right',
}

const NEGATIVE = new Set(['KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft'])

/**
 * WASD / arrow input as a mutable ref (spec §5.4). A ref rather than state so
 * `useFrame` reads it without re-rendering the React tree every keypress.
 * Returns `hasInput` so callers can pause auto-motion once the user takes over.
 */
export function useKeyboardInput() {
  const input = useRef<InputMap>({ forward: 0, right: 0, boost: false })
  const held = useRef(new Set<string>())
  const hasInput = useRef(false)

  useEffect(() => {
    const recompute = () => {
      let forward = 0
      let right = 0
      for (const code of held.current) {
        const axis = KEYS[code]
        if (!axis || axis === 'boost') continue
        const sign = NEGATIVE.has(code) ? -1 : 1
        if (axis === 'forward') forward += sign
        else right += sign
      }
      input.current.forward = Math.max(-1, Math.min(1, forward))
      input.current.right = Math.max(-1, Math.min(1, right))
      input.current.boost = held.current.has('ShiftLeft') || held.current.has('ShiftRight')
      hasInput.current = held.current.size > 0
    }

    const isTypingTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null
      if (!node) return false
      const tag = node.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable
    }

    const onDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (!KEYS[e.code] && !e.code.startsWith('Shift')) return
      // Arrow keys would otherwise scroll the page out from under the scene.
      if (e.code.startsWith('Arrow')) e.preventDefault()
      held.current.add(e.code)
      recompute()
    }
    const onUp = (e: KeyboardEvent) => {
      held.current.delete(e.code)
      recompute()
    }
    const onBlur = () => {
      held.current.clear()
      recompute()
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return { input, hasInput }
}
