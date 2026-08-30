import type { SkillGroup } from '@/types'

/** `level` is 0–1 self-assessed depth; it drives the meters and the 3D bars. */
export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: [
      { name: 'C++', level: 0.9, track: ['swe'] },
      { name: 'C#', level: 0.85, track: ['game'] },
      { name: 'Python', level: 0.85, track: ['swe'] },
      { name: 'C', level: 0.75, track: ['swe'] },
      { name: 'TypeScript', level: 0.7, track: ['swe'] },
      { name: 'Go', level: 0.6, track: ['swe'] },
      { name: 'Bash', level: 0.75, track: ['swe'] },
    ],
  },
  {
    category: 'Systems & Backend',
    items: [
      { name: 'Linux', level: 0.85, track: ['swe'] },
      { name: 'FastAPI', level: 0.8, track: ['swe'] },
      { name: 'PostgreSQL', level: 0.7, track: ['swe'] },
      { name: 'Docker', level: 0.7, track: ['swe'] },
      { name: 'Nginx', level: 0.65, track: ['swe'] },
      { name: 'systemd', level: 0.7, track: ['swe'] },
    ],
  },
  {
    category: 'Game Development',
    items: [
      { name: 'Unity', level: 0.85, track: ['game'] },
      { name: 'Gameplay programming', level: 0.85, track: ['game'] },
      { name: 'Game direction', level: 0.75, track: ['game'] },
      { name: 'HLSL / ShaderLab', level: 0.55, track: ['game'] },
    ],
  },
  {
    category: 'Data & Analysis',
    items: [
      { name: 'pandas', level: 0.8, track: ['swe'] },
      { name: 'yfinance', level: 0.7, track: ['swe'] },
      { name: 'Prisma', level: 0.65, track: ['swe'] },
      { name: 'Next.js', level: 0.7, track: ['swe'] },
    ],
  },
  {
    category: 'Tools',
    items: [
      { name: 'Vim / Neovim', level: 0.85, track: ['both'] },
      { name: 'Git / GitHub', level: 0.85, track: ['both'] },
      { name: 'CMake', level: 0.7, track: ['swe'] },
      { name: 'LaTeX', level: 0.75, track: ['both'] },
      { name: 'Arduino', level: 0.65, track: ['swe'] },
    ],
  },
  {
    category: 'Coursework',
    items: [
      { name: 'Data Structures & Algorithms', track: ['both'] },
      { name: 'Operating Systems', track: ['swe'] },
      { name: 'Distributed Systems', track: ['swe'] },
      { name: 'Networking Fundamentals', track: ['swe'] },
      { name: 'Computer Architecture', track: ['swe'] },
      { name: 'Systems Programming', track: ['swe'] },
      { name: 'Discrete Mathematics', track: ['both'] },
      { name: 'Object-Oriented C++', track: ['swe'] },
    ],
  },
]
