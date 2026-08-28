/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { experience, profile, projects, skills } from '@/data'
import type { Project } from '@/types'

/**
 * The Game World's possession hub.
 *
 * Shellscape — one of Jose's games — is about a test subject with no shell of
 * its own taking over the guards who made it. This world runs the same verb:
 * you arrive shell-less, drive to a shell, and press E to take it over. Each
 * shell holds one chunk of the portfolio.
 *
 * State lives here rather than in the R3F tree because both halves need it:
 * the scene decides which shell you are near, and the DOM overlay renders the
 * prompt, the HUD and the content panel.
 */

export const INTERACT_KEY = 'KeyE'
/** World units. Slightly generous so the prompt never feels finicky. */
export const INTERACT_RADIUS = 2.9

export type ShellKind = 'project' | 'experience' | 'skills' | 'contact'

/**
 * A plain vector rather than THREE.Vector3 on purpose: this module is imported
 * by <App>, and pulling `three` in here drags the whole WebGL stack onto the
 * critical path instead of leaving it in the lazy scene chunk.
 */
export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface HubShell {
  id: string
  kind: ShellKind
  /** Shown on the shell in the world and in the prompt. */
  label: string
  subtitle: string
  position: Vec3
  project?: Project
}

function buildShells(): HubShell[] {
  const gameProjects = projects.filter(
    (p) => p.worlds.includes('game') || p.worlds.includes('both'),
  )

  const nodes: Omit<HubShell, 'position'>[] = [
    ...gameProjects.map((project) => ({
      id: `project-${project.id}`,
      kind: 'project' as const,
      label: project.title,
      subtitle: project.role,
      project,
    })),
    {
      id: 'experience',
      kind: 'experience' as const,
      label: 'Experience',
      subtitle: 'Studio & school',
    },
    { id: 'skills', kind: 'skills' as const, label: 'Skills', subtitle: 'Loadout' },
    { id: 'contact', kind: 'contact' as const, label: 'Contact', subtitle: 'Get in touch' },
  ]

  // Even ring inside the rover's arena (radius 13), alternating the radius a
  // little so the field reads as placed rather than generated.
  const RADIUS = 8.5
  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
    const r = RADIUS + (i % 2 === 0 ? 0 : 1.6)
    return {
      ...node,
      position: { x: Math.cos(angle) * r, y: -1.6, z: Math.sin(angle) * r },
    }
  })
}

interface HubContextValue {
  shells: HubShell[]
  /** Live player position, mutated by the rover each frame. */
  playerPos: React.MutableRefObject<Vec3>
  /** Shell within interact range, or null. */
  nearbyId: string | null
  setNearbyId: (id: string | null) => void
  /** Shell currently possessed; movement is frozen while this is set. */
  possessedId: string | null
  possess: (id: string) => void
  release: () => void
  /** Ids the visitor has possessed at least once. */
  discovered: Set<string>
  allFound: boolean
  /** False while the visitor is reading a shell — the rover should hold still. */
  canMove: boolean
  /**
   * True while the arena overlay is mounted. The nav hides its section anchors
   * and the camera switches to chase mode, so both need to see it.
   */
  arenaActive: boolean
  setArenaActive: (active: boolean) => void
  /** Flips once the visitor first drives, so the intro copy can get out of the way. */
  hasMoved: boolean
  reportMoved: () => void
}

const HubContext = createContext<HubContextValue | null>(null)

export function HubProvider({ children }: { children: ReactNode }) {
  const shells = useMemo(buildShells, [])
  const playerPos = useRef<Vec3>({ x: 0, y: -1.6, z: 0 })
  const [nearbyId, setNearbyIdState] = useState<string | null>(null)
  const [possessedId, setPossessedId] = useState<string | null>(null)
  const [discovered, setDiscovered] = useState<Set<string>>(() => new Set())
  const [arenaActive, setArenaActive] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)

  // Called from the frame loop, so it must be a no-op after the first time.
  const reportMoved = useCallback(() => setHasMoved(true), [])

  // The scene calls this every frame; bail unless it actually changed so we do
  // not re-render the DOM 60 times a second.
  const setNearbyId = useCallback((id: string | null) => {
    setNearbyIdState((prev) => (prev === id ? prev : id))
  }, [])

  const possess = useCallback((id: string) => {
    setPossessedId(id)
    setDiscovered((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const release = useCallback(() => setPossessedId(null), [])

  // E possesses whatever is in range; Escape releases. Ignored while the
  // visitor is typing, so this never fights a form field.
  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      const node = el as HTMLElement | null
      if (!node) return false
      const tag = node.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable
    }

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || !arenaActive) return

      if (e.code === 'Escape' && possessedId) {
        e.preventDefault()
        release()
        return
      }

      if (e.code !== INTERACT_KEY) return
      if (possessedId) {
        e.preventDefault()
        release()
      } else if (nearbyId) {
        e.preventDefault()
        possess(nearbyId)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nearbyId, possessedId, possess, release, arenaActive])

  const value = useMemo<HubContextValue>(
    () => ({
      shells,
      playerPos,
      nearbyId,
      setNearbyId,
      possessedId,
      possess,
      release,
      discovered,
      allFound: discovered.size >= shells.length,
      canMove: possessedId === null,
      arenaActive,
      setArenaActive,
      hasMoved,
      reportMoved,
    }),
    [
      shells,
      nearbyId,
      setNearbyId,
      possessedId,
      possess,
      release,
      discovered,
      arenaActive,
      hasMoved,
      reportMoved,
    ],
  )

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>
}

export function useHub(): HubContextValue {
  const ctx = useContext(HubContext)
  if (!ctx) throw new Error('useHub must be used inside <HubProvider>')
  return ctx
}

/** Content for a shell's panel, pulled from the shared data files. */
export function shellContent(shell: HubShell) {
  switch (shell.kind) {
    case 'project':
      return { type: 'project' as const, project: shell.project! }
    case 'experience':
      return {
        type: 'experience' as const,
        entries: experience.filter(
          (e) => e.worlds.includes('game') || e.worlds.includes('both'),
        ),
      }
    case 'skills':
      return {
        type: 'skills' as const,
        groups: skills
          .map((g) => ({
            ...g,
            items: g.items.filter(
              (i) => !i.worlds || i.worlds.includes('game') || i.worlds.includes('both'),
            ),
          }))
          .filter((g) => g.items.length > 0),
      }
    case 'contact':
    default:
      return { type: 'contact' as const, profile }
  }
}
