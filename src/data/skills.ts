import type { SkillGroup } from '@/types'

/**
 * `level` is 0–1 and drives the bar heights in the Engineer world's
 * instanced micro-charts (spec §5.5). Omit it and the bar renders neutral.
 */
export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: [
      { name: 'TypeScript', level: 0.95, worlds: ['both'] },
      { name: 'C#', level: 0.9, worlds: ['game'] },
      { name: 'Go', level: 0.8, worlds: ['swe'] },
      { name: 'Python', level: 0.8, worlds: ['swe'] },
      { name: 'C++', level: 0.7, worlds: ['game'] },
      { name: 'GLSL', level: 0.75, worlds: ['both'] },
      { name: 'Rust', level: 0.55, worlds: ['swe'] },
    ],
  },
  {
    category: 'Engines & Graphics',
    items: [
      { name: 'Unity', level: 0.95, worlds: ['game'] },
      { name: 'Three.js', level: 0.9, worlds: ['both'] },
      { name: 'React Three Fiber', level: 0.85, worlds: ['both'] },
      { name: 'Godot', level: 0.65, worlds: ['game'] },
      { name: 'WebGL2', level: 0.8, worlds: ['both'] },
      { name: 'Shader authoring', level: 0.8, worlds: ['both'] },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React', level: 0.95, worlds: ['both'] },
      { name: 'Vite', level: 0.85, worlds: ['both'] },
      { name: 'Tailwind CSS', level: 0.85, worlds: ['both'] },
      { name: 'Framer Motion', level: 0.8, worlds: ['both'] },
      { name: 'Accessibility', level: 0.8, worlds: ['both'] },
    ],
  },
  {
    category: 'Backend & Data',
    items: [
      { name: 'PostgreSQL', level: 0.85, worlds: ['swe'] },
      { name: 'Redis', level: 0.75, worlds: ['swe'] },
      { name: 'REST / gRPC', level: 0.8, worlds: ['swe'] },
      { name: 'Data pipelines', level: 0.85, worlds: ['swe'] },
    ],
  },
  {
    category: 'Cloud & Ops',
    items: [
      { name: 'Kubernetes', level: 0.7, worlds: ['swe'] },
      { name: 'Terraform', level: 0.65, worlds: ['swe'] },
      { name: 'GitHub Actions', level: 0.85, worlds: ['both'] },
      { name: 'OpenTelemetry', level: 0.75, worlds: ['swe'] },
    ],
  },
  {
    category: 'Craft',
    items: [
      { name: 'Netcode', level: 0.85, worlds: ['game'] },
      { name: 'Gameplay systems', level: 0.9, worlds: ['game'] },
      { name: 'Profiling', level: 0.85, worlds: ['both'] },
      { name: 'Tooling & DX', level: 0.9, worlds: ['both'] },
      { name: 'Technical writing', level: 0.75, worlds: ['both'] },
    ],
  },
]
