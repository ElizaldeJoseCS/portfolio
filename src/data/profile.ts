import type { Profile } from '@/types'

export const profile: Profile = {
  name: 'Jose Elizalde',
  firstName: 'Jose',
  tagline:
    'CS & Engineering at UCLA. I write systems in C++ and Python, and I direct and build games in Unity.',
  bio: [
    "I'm a Computer Science and Engineering student at UCLA who ended up with two habits that keep feeding each other: building low-level systems, and shipping games.",
    'The systems half is where most of my time goes — a C++ Discord bot on the D++ library talking to a Python FastAPI backend, a market data pipeline built on pandas and yfinance, a Next.js site with a Go bot attached, all of it deployed on Linux boxes I administer myself. I like the parts of the stack where you can still see the machine: sockets, processes, systemd units, the reason a thing is slow.',
    'The games half runs through UCLA ACM Studio, where I am Game Director on Jump the Gun. I have shipped jam games with teams on hard deadlines and written the movement code myself when Unity’s built-in character controller was not good enough.',
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
    'Game jams',
    'Embedded & hardware',
    'Linux / Neovim',
    'Systems programming',
  ],
  today:
    'Right now I am building DailyCodeforce, extending the Robinhood portfolio bot, and directing Jump the Gun at UCLA ACM Studio.',
}
