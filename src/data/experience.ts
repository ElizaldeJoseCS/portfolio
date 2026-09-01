import type { ExperienceEntry } from '@/types'

/*
  Institution marks. `src` is the real wordmark; without one the UI falls back
  to `short` as a lettermark badge, which is a finished look rather than a gap.
  To add artwork, drop a transparent PNG or an SVG in `public/assets` and set
  `src` here — nothing else changes. Knock the background out first: these sit
  on a dark surface, and a white plate reads as a white box.
*/
const UCLA: ExperienceEntry['logo'] = {
  short: 'UCLA',
  alt: 'University of California, Los Angeles',
  src: '/assets/logo-ucla.png',
}
const CMU: ExperienceEntry['logo'] = {
  short: 'CMU',
  alt: 'Carnegie Mellon University',
  src: '/assets/logo-cmu.png',
}
const PIERCE: ExperienceEntry['logo'] = { short: 'LAPC', alt: 'Los Angeles Pierce College' }

export const experience: ExperienceEntry[] = [
  {
    id: 'acm-studio-srs',
    role: 'Game Director — Jump the Gun',
    company: 'UCLA ACM Studio (SRS)',
    location: 'Los Angeles, CA',
    start: '2024-10',
    end: 'Present',
    kind: 'work',
    description: [
      'Lead design and development of a first-person action shooter at the student-run studio, defining gameplay mechanics and coordinating implementation across the team.',
      'Wrote a custom physics-based movement controller in C#, replacing Unity’s default character controller with hand-written movement and collision logic.',
      'Run the team on Git branching and pull requests so multiple people can land gameplay features concurrently.',
    ],
    skills: ['Unity', 'C#', 'Game design', 'Git'],
    area: 'other',
    url: 'https://github.com/SRS-Jump-the-Gun/JumpTheGunUnityBuild',
    logo: UCLA,
  },
  {
    id: 'cmu-reuse',
    role: 'Undergraduate Researcher — REUSE Program',
    company: 'Carnegie Mellon University, HCII',
    location: 'Pittsburgh, PA',
    start: '2025-05',
    end: '2025-08',
    kind: 'internship',
    description: [
      'Built an interactive application at the Human-Computer Interaction Institute to investigate ways of improving communication and empathy between rideshare drivers and passengers.',
      'Implemented and iteratively refined features from user feedback and usability testing run throughout the research process.',
      'Co-authored a research paper accepted to CHI 2026 evaluating the application’s impact on user engagement and empathy.',
    ],
    skills: ['HCI', 'User research', 'Usability testing', 'Python'],
    area: 'research',
    logo: CMU,
  },
  {
    id: 'ucla-sure',
    role: 'Undergraduate Researcher — SURE C² Program',
    company: 'UCLA, Department of Mathematics',
    location: 'Los Angeles, CA',
    start: '2024-06',
    end: '2024-08',
    kind: 'internship',
    description: [
      'Researched combinatorics on partially ordered sets (posets), studying transfer systems and the patterns they form.',
      'Wrote a C++ program to enumerate every transfer system of a given finite poset, automating a count that grows exponentially with the cardinality of the set.',
      'Discovered a recursive relationship for the family of sets Xₙ⁺⁺, contributing to a co-authored paper presented at the University of Texas at Arlington.',
    ],
    skills: ['C++', 'Combinatorics', 'Algorithms', 'Research'],
    area: 'research',
    logo: UCLA,
  },
  {
    id: 'edu-ucla',
    role: 'B.S. Computer Science and Engineering',
    company: 'University of California, Los Angeles',
    location: 'Westwood, CA',
    start: '2025-09',
    end: '2027-06',
    kind: 'education',
    description: [
      'Coursework: Data Structures and Algorithms, Networking Fundamentals, Distributed Systems, Operating Systems, Systems Programming, Computer Architecture, Discrete Mathematics, Object-Oriented C++.',
    ],
    skills: ['C++', 'Operating Systems', 'Distributed Systems', 'Networking'],
    area: 'education',
    logo: UCLA,
  },
  {
    id: 'edu-pierce',
    role: 'A.A. Physics and Mathematics',
    company: 'Los Angeles Pierce College',
    location: 'Woodland Hills, CA',
    start: '2023-02',
    end: '2025-06',
    kind: 'education',
    description: ['Graduated with a 3.92 / 4.00 GPA before transferring to UCLA.'],
    skills: ['Physics', 'Mathematics'],
    area: 'education',
    logo: PIERCE,
  },
]
