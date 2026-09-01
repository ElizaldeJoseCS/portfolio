import type { Profile } from '@/types'

export const profile: Profile = {
  name: 'Jose Elizalde',
  firstName: 'Jose',
  tagline:
    'Computer Science & Engineering at UCLA. I am interested systems, graphics, and video game programming',
  bio: [
    "My computer science journey began simply because I wanted to make my own video games and now my interest have expanded to not only developing and shipping amazing games. but also building low-level systems like my own custom game engine",
    'I have worked on and some still currently working on are a Robinhood portfolio bot, a CodeForce practice website that generates 4 random problems as well as a complementary Discord bot that does the same thing, and two games I worked on in the last year being Shellscape and Jump the Gun.',
    'My game developer itch is satisfied with projects built with my club UCLA ACM Studio, where I am Game Director on Jump the Gun. I have participated in game jams where my team has publsihed a working product on itch.io on multiple occasions.',
    'Before this I spent two summers on research: combinatorics on posets at UCLA, and human-computer interaction at Carnegie Mellon, which turned into a paper accepted to CHI 2026.',
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
  ],
  today:
    'Right now I am building DailyCodeforce, extending the Robinhood portfolio bot, and directing Jump the Gun at UCLA ACM Studio.',
}
