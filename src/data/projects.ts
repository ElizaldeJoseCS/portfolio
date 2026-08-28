import type { Project } from '@/types'

/**
 * `worlds` is what splits the site in two: the Engineer console lists only
 * `swe` entries, and the Game world's grid shows the `game` ones.
 */
export const projects: Project[] = [
  // ---------------------------------------------------------------- software
  {
    id: 'dailycodeforce',
    title: 'DailyCodeforce',
    tagline: 'Four fresh Codeforces problems a day, with LeetCode-style editorials.',
    description:
      'A daily competitive-programming trainer. Every day it pulls four Codeforces problems, one per difficulty tier — Beginner (800–1200), Intermediate (1200–1600), Advanced (1600–2000) and Expert (2000+) — and pairs each with a generated editorial written in the LeetCode style: intuition, approach, complexity analysis and C++ reference code. Editorials stay hidden behind an Answer tab so you actually attempt the problem first. A rolling 90-day dedup window keeps problems from repeating, and a 30-day backfill means the archive is never empty on a fresh deploy. The same functionality is exposed through a Discord bot written in Go, so a server can run /daily, /solve, /stats and /leaderboard without leaving chat. Next.js and Prisma on Postgres for the web side, all of it containerised with Docker Compose behind Nginx.',
    worlds: ['swe'],
    tags: ['Full-stack', 'Competitive Programming', 'Discord Bot'],
    techStack: [
      'Next.js 14',
      'TypeScript',
      'Tailwind CSS',
      'PostgreSQL',
      'Prisma 7',
      'Go',
      'DiscordGo',
      'OpenAI GPT-4o',
      'Docker Compose',
      'Nginx',
    ],
    role: 'Solo',
    year: '2026',
    links: [
      { label: 'Live site', url: 'http://159.65.226.241' },
      { label: 'GitHub', url: 'https://github.com/ElizaldeJoseCS/DailyCodeforce' },
    ],
    media: [
      { type: 'image', src: '/assets/placeholder-dailycodeforce.svg', alt: 'DailyCodeforce' },
    ],
    featured: true,
    highlighted: true,
  },
  {
    id: 'robinhood-bot',
    title: 'Robinhood Portfolio Bot',
    tagline: 'A C++ Discord bot on a Python quant backend, live on a VPS 24/7.',
    description:
      'A Discord bot that reports your live Robinhood portfolio and recommends stocks off a momentum-plus-fundamentals pipeline. It runs as two services: the bot itself is C++ on the D++ library, and it talks over HTTP to a Python FastAPI backend that owns the brokerage session and the analysis. /portfolio returns live equity, crypto and market-value stats; /recommend returns the top five picks; a timer auto-posts portfolio updates to a channel. Behind that is a background market-data pipeline that periodically pulls historical S&P 500 data with yfinance and processes it in pandas, computing momentum breakouts and valuation metrics including P/E ratio and ROE. Deployed to a DigitalOcean Linux VPS and wrapped in a systemd service so it restarts on crash and survives reboots.',
    worlds: ['swe'],
    tags: ['C++', 'Backend', 'Quant', 'Discord Bot'],
    techStack: ['C++', 'D++', 'Python', 'FastAPI', 'pandas', 'yfinance', 'systemd', 'DigitalOcean'],
    role: 'Solo',
    year: '2026',
    links: [{ label: 'GitHub', url: 'https://github.com/ElizaldeJoseCS/robinhood-D--bot' }],
    media: [{ type: 'image', src: '/assets/placeholder-robinhood.svg', alt: 'Robinhood bot' }],
    featured: true,
  },
  {
    id: 'kurtcobot',
    title: 'KurtCobot',
    tagline: 'Embedded C++ on an Arduino that plays programmed music from raw PWM.',
    description:
      'An embedded C++ application on an Arduino that performs programmed musical notes. The interesting part is that there is no audio library underneath it: note sequences are turned into sound by generating pulse-width-modulation signals directly, so every pitch and duration is a timing problem solved in software. I also designed and assembled the supporting circuitry, going from breadboard to soldered components, which made this as much a hardware project as a firmware one.',
    worlds: ['swe'],
    tags: ['Embedded', 'Firmware', 'Hardware'],
    techStack: ['C++', 'Arduino', 'PWM', 'Circuit design'],
    role: 'Solo',
    year: '2024',
    links: [],
    media: [{ type: 'image', src: '/assets/placeholder-kurtcobot.svg', alt: 'KurtCobot' }],
    featured: false,
  },

  // -------------------------------------------------------------- game dev
  {
    id: 'shellscape',
    title: 'Shellscape',
    tagline: 'Possess the guards who made you, and walk out of the lab wearing them.',
    description:
      'A game-jam action game built for Club Club Jam Jam with a team of five UCLA students, finished and submitted inside the jam window. You play a test subject with no shell of its own: the only way out of the secret lab that made you is to take the guards apart and wear them. Possession is the whole verb — you hop bodies to borrow their weapons and get through rooms you cannot survive on your own. Shipped as an HTML5 build playable in the browser, with no generative AI used anywhere in its creation.',
    worlds: ['game'],
    tags: ['Game Jam', 'Action', 'Team of 5'],
    techStack: ['Unity', 'C#', 'HTML5'],
    role: 'Gameplay Programmer',
    year: '2026',
    links: [{ label: 'Play on itch.io', url: 'https://joseelizalde02.itch.io/shellscape' }],
    media: [{ type: 'image', src: '/assets/placeholder-shellscape.svg', alt: 'Shellscape' }],
    featured: true,
    highlighted: true,
  },
  {
    id: 'jump-the-gun',
    title: 'Jump the Gun',
    tagline: 'A first-person action shooter about a father going after his old mob boss.',
    description:
      'A single-player first-person action shooter in development at UCLA ACM Studio SRS, the student-run studio, where I am Game Director. The narrative follows a father tearing through his former mob boss’s organisation to get his kidnapped daughter back, and the combat is built to match that tone — close, fast and desperate rather than tactical. I lead the design and coordinate implementation across the team, and I wrote the custom physics-based movement controller in C#, replacing Unity’s built-in character controller with hand-written movement and collision logic so the feel is ours rather than the engine’s default. The team works through Git branching and pull requests so several people can land gameplay features in parallel. Still in active development.',
    worlds: ['game'],
    tags: ['Unity', 'FPS', 'Game Direction', 'In development'],
    techStack: ['Unity', 'C#', 'HLSL', 'ShaderLab', 'Git'],
    role: 'Game Director',
    year: '2024',
    links: [
      { label: 'GitHub', url: 'https://github.com/SRS-Jump-the-Gun/JumpTheGunUnityBuild' },
    ],
    media: [{ type: 'image', src: '/assets/placeholder-jumpthegun.svg', alt: 'Jump the Gun' }],
    featured: true,
  },
]

/** Projects for a given world. The Engineer console is `swe`-only by design. */
export const projectsForWorld = (world: 'game' | 'swe') =>
  projects.filter((p) => p.worlds.includes(world) || p.worlds.includes('both'))
