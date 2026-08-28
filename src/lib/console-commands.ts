import { experience, profile, projects, skills } from '@/data'
import type { Project } from '@/types'

/**
 * The Engineer world is navigated by typing (spec §4 is overridden here by the
 * owner's brief: this world *is* a console). Commands return structured lines
 * rather than strings so the renderer can emit real lists and anchors — the
 * output has to stay readable to a screen reader, not just to a human squinting
 * at a terminal.
 */

export type ConsoleLine =
  | { kind: 'text'; text: string; tone?: 'default' | 'muted' | 'accent' | 'error' }
  | { kind: 'heading'; text: string }
  | { kind: 'kv'; key: string; value: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'link'; label: string; url: string; external?: boolean }
  | { kind: 'blank' }
  | { kind: 'rule' }
  | { kind: 'commands'; items: { name: string; args?: string; help: string }[] }
  | { kind: 'projects'; items: { index: number; project: Project }[] }
  | { kind: 'chips'; label: string; items: string[] }

/** Side effects the Console component performs after printing. */
export type ConsoleEffect = 'clear' | 'switch-to-game' | 'open-resume'

export interface CommandResult {
  lines: ConsoleLine[]
  effect?: ConsoleEffect
}

export interface Command {
  name: string
  aliases?: string[]
  args?: string
  help: string
  /** Hidden from the quick-command bar but still runnable. */
  hidden?: boolean
  run: (args: string[]) => CommandResult
}

/** Only software-engineering work appears in this world. */
const sweProjects = projects.filter((p) => p.worlds.includes('swe') || p.worlds.includes('both'))

const sweExperience = experience.filter(
  (e) => e.worlds.includes('swe') || e.worlds.includes('both'),
)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmtDate = (v: string) => {
  if (v === 'Present') return 'Present'
  const [year, month] = v.split('-')
  const idx = Number(month) - 1
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : (year ?? v)
}

const notFound = (what: string, hint: string): CommandResult => ({
  lines: [
    { kind: 'text', tone: 'error', text: what },
    { kind: 'text', tone: 'muted', text: hint },
  ],
})

export const commands: Command[] = [
  {
    name: 'help',
    aliases: ['?', 'commands'],
    help: 'List every command available here',
    run: () => ({
      lines: [
        { kind: 'heading', text: 'Available commands' },
        {
          kind: 'commands',
          items: commands
            .filter((c) => !c.hidden)
            .map((c) => ({ name: c.name, args: c.args, help: c.help })),
        },
        { kind: 'blank' },
        {
          kind: 'text',
          tone: 'muted',
          text: 'Tab completes a command. Up and Down arrows walk through what you have already typed.',
        },
      ],
    }),
  },
  {
    name: 'about',
    aliases: ['whoami', 'bio'],
    help: 'Who I am and what I work on',
    run: () => ({
      lines: [
        { kind: 'heading', text: `${profile.name} — ${profile.roles.join(' / ')}` },
        { kind: 'kv', key: 'location', value: profile.location },
        { kind: 'kv', key: 'school', value: 'UCLA — B.S. Computer Science and Engineering' },
        { kind: 'blank' },
        ...profile.bio.map((text): ConsoleLine => ({ kind: 'text', text })),
        { kind: 'blank' },
        { kind: 'text', tone: 'accent', text: profile.today ?? '' },
        { kind: 'blank' },
        {
          kind: 'chips',
          label: 'Outside the editor',
          items: profile.interests ?? [],
        },
      ],
    }),
  },
  {
    name: 'projects',
    aliases: ['ls', 'work'],
    help: 'List my software engineering projects',
    run: () => ({
      lines: [
        { kind: 'heading', text: 'Software engineering projects' },
        {
          kind: 'text',
          tone: 'muted',
          text: 'Game development work lives in the Game World — type `game` to go there.',
        },
        { kind: 'blank' },
        { kind: 'projects', items: sweProjects.map((project, i) => ({ index: i + 1, project })) },
        { kind: 'blank' },
        {
          kind: 'text',
          tone: 'muted',
          text: 'Run `open 1` (or `open dailycodeforce`) for the full write-up.',
        },
      ],
    }),
  },
  {
    name: 'open',
    aliases: ['cat', 'project'],
    args: '<number|name>',
    help: 'Open one project in full',
    run: (args) => {
      const key = (args[0] ?? '').toLowerCase()
      // Clicking the `open` quick-command sends no argument, so bare `open`
      // shows the menu it needs rather than an error.
      if (!key) {
        return {
          lines: [
            { kind: 'text', tone: 'muted', text: 'Usage: open <number|name> — for example `open 1`.' },
            { kind: 'blank' },
            {
              kind: 'projects',
              items: sweProjects.map((project, i) => ({ index: i + 1, project })),
            },
          ],
        }
      }
      const byIndex = Number(key)
      const project = Number.isFinite(byIndex)
        ? sweProjects[byIndex - 1]
        : sweProjects.find(
            (p) => p.id === key || p.title.toLowerCase().replace(/\s+/g, '') === key.replace(/\s+/g, ''),
          )

      if (!project) {
        return notFound(
          `open: no project matching "${args.join(' ')}".`,
          'Run `projects` to see the list.',
        )
      }

      return {
        lines: [
          { kind: 'heading', text: project.title },
          { kind: 'text', tone: 'accent', text: project.tagline },
          { kind: 'blank' },
          { kind: 'kv', key: 'role', value: project.role },
          { kind: 'kv', key: 'year', value: project.year },
          { kind: 'blank' },
          { kind: 'text', text: project.description },
          { kind: 'blank' },
          { kind: 'chips', label: 'Stack', items: project.techStack },
          ...(project.links.length
            ? ([{ kind: 'blank' }, { kind: 'heading', text: 'Links' }] as ConsoleLine[])
            : []),
          ...project.links.map(
            (l): ConsoleLine => ({ kind: 'link', label: l.label, url: l.url, external: true }),
          ),
        ],
      }
    },
  },
  {
    name: 'experience',
    aliases: ['exp', 'research'],
    help: 'Research and engineering history',
    run: () => ({
      lines: [
        { kind: 'heading', text: 'Experience' },
        ...sweExperience
          .filter((e) => e.kind !== 'education')
          .flatMap((e): ConsoleLine[] => [
            { kind: 'blank' },
            { kind: 'text', tone: 'accent', text: `${e.role} · ${e.company}` },
            {
              kind: 'text',
              tone: 'muted',
              text: `${fmtDate(e.start)} — ${fmtDate(e.end)}${e.location ? ` · ${e.location}` : ''}`,
            },
            ...e.description.map((d): ConsoleLine => ({ kind: 'bullet', text: d })),
            { kind: 'chips', label: 'Skills', items: e.skills },
          ]),
      ],
    }),
  },
  {
    name: 'education',
    aliases: ['edu', 'school'],
    help: 'Where I study and what I have studied',
    run: () => ({
      lines: [
        { kind: 'heading', text: 'Education' },
        ...experience
          .filter((e) => e.kind === 'education')
          .flatMap((e): ConsoleLine[] => [
            { kind: 'blank' },
            { kind: 'text', tone: 'accent', text: `${e.role} · ${e.company}` },
            {
              kind: 'text',
              tone: 'muted',
              text: `${fmtDate(e.start)} — ${fmtDate(e.end)}${e.location ? ` · ${e.location}` : ''}`,
            },
            ...e.description.map((d): ConsoleLine => ({ kind: 'bullet', text: d })),
          ]),
      ],
    }),
  },
  {
    name: 'skills',
    aliases: ['stack'],
    help: 'Languages, systems and tools',
    run: () => ({
      lines: [
        { kind: 'heading', text: 'Skills' },
        ...skills.flatMap((group): ConsoleLine[] => [
          { kind: 'blank' },
          { kind: 'chips', label: group.category, items: group.items.map((i) => i.name) },
        ]),
      ],
    }),
  },
  {
    name: 'contact',
    aliases: ['email', 'links'],
    help: 'How to reach me',
    run: () => ({
      lines: [
        { kind: 'heading', text: 'Contact' },
        { kind: 'link', label: profile.email, url: `mailto:${profile.email}` },
        { kind: 'blank' },
        ...profile.socials
          .filter((s) => !s.url.startsWith('mailto:'))
          .map((s): ConsoleLine => ({ kind: 'link', label: s.label, url: s.url, external: true })),
      ],
    }),
  },
  {
    name: 'resume',
    aliases: ['cv'],
    help: 'Open my resume as a PDF',
    run: () => ({
      lines: [
        { kind: 'text', text: 'Opening resume.pdf in a new tab…' },
        ...(profile.resumeUrl
          ? [
              {
                kind: 'link' as const,
                label: 'resume.pdf',
                url: profile.resumeUrl,
                external: true,
              },
            ]
          : []),
      ],
      effect: 'open-resume',
    }),
  },
  {
    name: 'game',
    aliases: ['gamedev', 'games'],
    help: 'Leave the console for the Game World',
    run: () => ({
      lines: [{ kind: 'text', tone: 'accent', text: 'Switching to the Game World…' }],
      effect: 'switch-to-game',
    }),
  },
  {
    name: 'clear',
    aliases: ['cls'],
    help: 'Clear the screen',
    run: () => ({ lines: [], effect: 'clear' }),
  },
  {
    name: 'sudo',
    hidden: true,
    args: '<anything>',
    help: 'Nice try',
    run: () => ({
      lines: [
        { kind: 'text', tone: 'error', text: 'jose is not in the sudoers file. This incident has been reported.' },
      ],
    }),
  },
]

const lookup = new Map<string, Command>()
for (const command of commands) {
  lookup.set(command.name, command)
  for (const alias of command.aliases ?? []) lookup.set(alias, command)
}

/** Commands surfaced as clickable buttons for anyone not typing. */
export const quickCommands = commands.filter((c) => !c.hidden).map((c) => c.name)

export function completeCommand(partial: string): string | null {
  const p = partial.trim().toLowerCase()
  if (!p) return null
  const matches = [...lookup.keys()].filter((name) => name.startsWith(p)).sort()
  return matches.length === 1 ? (matches[0] ?? null) : null
}

export function runCommand(raw: string): CommandResult {
  const trimmed = raw.trim()
  if (!trimmed) return { lines: [] }

  const [name = '', ...args] = trimmed.split(/\s+/)
  const command = lookup.get(name.toLowerCase())

  if (!command) {
    return {
      lines: [
        { kind: 'text', tone: 'error', text: `command not found: ${name}` },
        { kind: 'text', tone: 'muted', text: 'Type `help` to see every command.' },
      ],
    }
  }

  return command.run(args)
}

/** The intro printed on entry. Deliberately explicit about how to drive this. */
export function bannerLines(): ConsoleLine[] {
  return [
    { kind: 'heading', text: `${profile.name} — Engineer World` },
    { kind: 'text', tone: 'muted', text: 'A console. You navigate this world by typing.' },
    { kind: 'rule' },
    { kind: 'text', text: '1. The cursor below is already focused — just start typing.' },
    { kind: 'text', text: '2. Enter runs the command. Tab completes it.' },
    { kind: 'text', text: '3. Start with `help` to see everything you can run.' },
    { kind: 'blank' },
    {
      kind: 'text',
      tone: 'muted',
      text: 'Would rather not type? Every command is a button under the prompt.',
    },
    {
      kind: 'text',
      tone: 'muted',
      text: 'Only software engineering work lives here. Type `game` for the game development side.',
    },
    { kind: 'rule' },
    { kind: 'text', tone: 'accent', text: 'Try: about · projects · experience · contact' },
  ]
}
