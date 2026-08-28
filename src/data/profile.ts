import type { Profile } from '@/types'

/**
 * TODO(owner): replace every field below with real details before launch.
 * Nothing else in the codebase hardcodes profile copy — edit only this file.
 */
export const profile: Profile = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  tagline: 'I build worlds you can play in and systems you can trust.',
  bio: [
    'I am a developer with two habits that keep feeding each other: shipping games and shipping infrastructure. One taught me how to make a machine feel alive in sixteen milliseconds; the other taught me how to keep it alive for six months without a pager going off.',
    'Most of my game work lives in Unity and custom WebGL renderers — gameplay systems, tooling for designers, and the unglamorous netcode that makes multiplayer stop lying to players. On the software side I work across TypeScript, Go, and Python, mostly on data pipelines and internal tools that turn a messy pile of sources into something a human can act on.',
    'I care about the same thing in both: latency you can feel, state you can reason about, and interfaces that do not make people read a manual.',
  ],
  roles: ['Game Developer', 'Software Engineer'],
  location: 'Austin, TX',
  email: 'hello@example.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'itch.io', url: 'https://itch.io/', icon: 'itch' },
    { label: 'Email', url: 'mailto:hello@example.com', icon: 'mail' },
  ],
  // TODO(owner): drop a real PDF at public/assets/resume.pdf or set to undefined.
  resumeUrl: '/assets/resume.pdf',
  avatarUrl: undefined,
  interests: ['Shader golf', 'Speedrun tech', 'Mechanical keyboards', 'Trail running'],
  today:
    'Today I am building a deduplicating internship tracker, a small multiplayer prototype, and this website.',
}
