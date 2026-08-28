import type { SkillGroup } from '@/types'

/** `level` is 0–1 self-assessed depth; it drives the meters and the 3D bars. */
export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: [
      { name: 'C++', level: 0.9, worlds: ['swe'] },
      { name: 'C#', level: 0.85, worlds: ['game'] },
      { name: 'Python', level: 0.85, worlds: ['swe'] },
      { name: 'C', level: 0.75, worlds: ['swe'] },
      { name: 'TypeScript', level: 0.7, worlds: ['swe'] },
      { name: 'Go', level: 0.6, worlds: ['swe'] },
      { name: 'Bash', level: 0.75, worlds: ['swe'] },
    ],
  },
  {
    category: 'Systems & Backend',
    items: [
      { name: 'Linux', level: 0.85, worlds: ['swe'] },
      { name: 'FastAPI', level: 0.8, worlds: ['swe'] },
      { name: 'PostgreSQL', level: 0.7, worlds: ['swe'] },
      { name: 'Docker', level: 0.7, worlds: ['swe'] },
      { name: 'Nginx', level: 0.65, worlds: ['swe'] },
      { name: 'systemd', level: 0.7, worlds: ['swe'] },
    ],
  },
  {
    category: 'Game Development',
    items: [
      { name: 'Unity', level: 0.85, worlds: ['game'] },
      { name: 'Gameplay programming', level: 0.85, worlds: ['game'] },
      { name: 'Game direction', level: 0.75, worlds: ['game'] },
      { name: 'HLSL / ShaderLab', level: 0.55, worlds: ['game'] },
    ],
  },
  {
    category: 'Data & Analysis',
    items: [
      { name: 'pandas', level: 0.8, worlds: ['swe'] },
      { name: 'yfinance', level: 0.7, worlds: ['swe'] },
      { name: 'Prisma', level: 0.65, worlds: ['swe'] },
      { name: 'Next.js', level: 0.7, worlds: ['swe'] },
    ],
  },
  {
    category: 'Tools',
    items: [
      { name: 'Vim / Neovim', level: 0.85, worlds: ['both'] },
      { name: 'Git / GitHub', level: 0.85, worlds: ['both'] },
      { name: 'CMake', level: 0.7, worlds: ['swe'] },
      { name: 'LaTeX', level: 0.75, worlds: ['both'] },
      { name: 'Arduino', level: 0.65, worlds: ['swe'] },
    ],
  },
  {
    category: 'Coursework',
    items: [
      { name: 'Data Structures & Algorithms', worlds: ['both'] },
      { name: 'Operating Systems', worlds: ['swe'] },
      { name: 'Distributed Systems', worlds: ['swe'] },
      { name: 'Networking Fundamentals', worlds: ['swe'] },
      { name: 'Computer Architecture', worlds: ['swe'] },
      { name: 'Systems Programming', worlds: ['swe'] },
      { name: 'Discrete Mathematics', worlds: ['both'] },
      { name: 'Object-Oriented C++', worlds: ['swe'] },
    ],
  },
]
