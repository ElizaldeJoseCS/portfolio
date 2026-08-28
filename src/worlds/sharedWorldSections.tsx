import { HeroSection } from '@/components/HeroSection'
import { ProjectSection } from '@/components/ProjectSection'
import { ExperienceTimeline } from '@/components/ExperienceTimeline'
import { SkillsCloud } from '@/components/SkillsCloud'
import { AboutSection } from '@/components/AboutSection'
import { ContactSection } from '@/components/ContactSection'

/**
 * The single set of content components both worlds render (spec §4.1).
 *
 * Worlds may reorder or reframe these, but they never fork them — that is what
 * keeps the two-world pattern from doubling the maintenance cost (spec §15).
 */
const sections = {
  hero: HeroSection,
  projects: ProjectSection,
  experience: ExperienceTimeline,
  skills: SkillsCloud,
  about: AboutSection,
  contact: ContactSection,
}

export type SectionKey = keyof typeof sections

/** Renders the given section keys in order. */
export function WorldSections({ order }: { order: readonly SectionKey[] }) {
  return (
    <>
      {order.map((key) => {
        const Component = sections[key]
        return <Component key={key} />
      })}
    </>
  )
}
