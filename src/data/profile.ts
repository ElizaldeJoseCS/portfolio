import type { Profile } from '@/types'

export const profile: Profile = {
  name: 'Jose Elizalde',
  firstName: 'Jose',
  tagline:
    'Computer Science & Engineering at UCLA. I am interested systems, graphics, and video game programming',
  bio: [
    "My computer science journey began simply because I wanted to make my own video games and now my interest have expanded to not only developing and shipping amazing games. but also building low-level systems like my own custom game engine",
    'My work spans a lot of software, ranging from web services like a Codeforces practice site and a Robinhood portfolio bot all the way to a published game, Shellscape, and two currently in development: Cloudy Critters and Jump the Gun.',
    'My game developer itch is satisfied with projects built with my club UCLA ACM Studio, where I am Game Director on Jump the Gun. I have participated in game jams where my team has publsihed a working product on itch.io on multiple occasions.',
    'Before this I spent two summers on research: combinatorics on posets at UCLA, and human-computer interaction at Carnegie Mellon, both of which produced papers with even the CMU paper being accepted to CHI 2026.',
  ],
  roles: ['Software Engineer', 'Game Developer'],
  location: 'Los Angeles, CA',
  email: 'joseelizalde02@g.ucla.edu',
  socials: [
    { label: 'GitHub', url: 'https://github.com/ElizaldeJoseCS', icon: 'github' },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/jose-elizalde-184781342/',
      icon: 'linkedin',
    },
    { label: 'itch.io', url: 'https://joseelizalde02.itch.io/', icon: 'itch' },
    { label: 'Email', url: 'mailto:joseelizalde02@g.ucla.edu', icon: 'mail' },
  ],
  resumeUrl: '/assets/resume.pdf',
  avatarUrl: '/assets/me.webp',
  interests: [
    'Competitive programming',
    'Video Game Programming',
    'Embedded & hardware',
    'Linux',
    'NeoVim',
    'Systems programming',
    'OPENGL',
    'Vulcan',
    'Graphics',
  ],
  today:
    'Right now I am maintaining my daily codeforce problem website, continuing development on Jump the Gun, and working on a new game called Cloudy Critters with UCLA\'s ACM Studio that is planned to be released on steam in January.',
}
