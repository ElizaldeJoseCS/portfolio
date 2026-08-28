import type { Project } from '@/types'

/**
 * `worlds` is what splits the site in two: the Engineer console lists only
 * `swe` entries, and the Game world's grid shows the `game` ones.
 *
 * `details` is the long form. The console prints it under `open <project>` and
 * the modal renders it under the summary, so adding depth to a project is a
 * data edit here — never a component change.
 */
export const projects: Project[] = [
  // ---------------------------------------------------------------- software
  {
    id: 'dailycodeforce',
    title: 'DailyCodeforce',
    tagline: 'Four fresh Codeforces problems a day, with LeetCode-style editorials.',
    description:
      'A daily competitive-programming trainer. Every day it pulls four Codeforces problems, one per difficulty tier, and pairs each with a generated editorial written in the LeetCode style: intuition, approach, complexity analysis and C++ reference code. Editorials stay hidden behind an Answer tab so you actually attempt the problem first. The same functionality is exposed through a Discord bot written in Go, so a server can practise without leaving chat.',
    status: 'Live — self-hosted on a DigitalOcean droplet behind Nginx',
    details: [
      {
        heading: 'The problem it solves',
        body: 'Codeforces has thousands of problems and no daily rhythm, so practice either stalls or turns into aimless scrolling. Picking a problem is its own chore, and once you are stuck the official editorials assume you already know the trick. I wanted the LeetCode habit — a fixed set of problems each morning, at a difficulty you can actually clear — on top of the Codeforces problem set.',
      },
      {
        heading: 'How it works',
        bullets: [
          'A scheduled job selects four problems a day, one per tier: Beginner (800–1200), Intermediate (1200–1600), Advanced (1600–2000) and Expert (2000+).',
          'A rolling 90-day dedup window keeps a problem from coming back around before you have forgotten it.',
          'A 30-day backfill runs on first deploy, so the archive is never empty on a fresh install.',
          'Each problem gets a generated editorial in a fixed shape — intuition, approach, complexity, C++ reference solution — kept behind an Answer tab so the attempt comes first.',
          'The Go Discord bot talks to the same database, exposing /daily, /solve, /stats and /leaderboard.',
        ],
      },
      {
        heading: 'Architecture',
        bullets: [
          'Next.js 14 App Router with TypeScript and Tailwind for the web client.',
          'PostgreSQL through Prisma 7 — problems, editorials, submissions and streaks.',
          'A separate Go service using DiscordGo for the bot, reading the same Postgres instance.',
          'GPT-4o generates the editorials; output is written back so a given problem is only ever paid for once.',
          'Docker Compose brings up web, bot, database and Nginx together, which is what makes a rebuild on the droplet a single command.',
        ],
      },
      {
        heading: 'What I would change',
        body: 'Editorial generation is synchronous with the daily job, so a failure leaves a gap for that day rather than retrying on its own — a queue would fix that. The difficulty tiers are also fixed bands rather than adapting to how the person is actually doing, which is the obvious next thing to build.',
      },
    ],
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
      { label: 'Live site', url: 'https://codeforces-practice.com/' },
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
      'A Discord bot that reports your live Robinhood portfolio and recommends stocks off a momentum-plus-fundamentals pipeline. It runs as two services: the bot itself is C++ on the D++ library, talking over HTTP to a Python FastAPI backend that owns the brokerage session and the analysis.',
    status: 'Live — running 24/7 under systemd on a DigitalOcean VPS',
    details: [
      {
        heading: 'Why two languages',
        body: 'The split is deliberate rather than incidental. Discord gateway work is long-lived, latency-sensitive and mostly I/O, which C++ with D++ handles cleanly; the analysis side wanted pandas and the Python brokerage and market-data libraries. Keeping them as separate processes behind an HTTP boundary meant the brokerage session — the part holding credentials — lives in exactly one service, and the bot can be restarted without re-authenticating.',
      },
      {
        heading: 'Commands',
        bullets: [
          '/portfolio — live equity, crypto holdings and market-value stats pulled straight from the account.',
          '/recommend — the current top five picks out of the analysis pipeline.',
          'A timer that auto-posts portfolio updates to a channel, so the report arrives without anyone asking for it.',
        ],
      },
      {
        heading: 'The analysis pipeline',
        bullets: [
          'A background job periodically pulls historical S&P 500 data with yfinance.',
          'pandas computes momentum breakouts over the price history.',
          'Valuation metrics — P/E ratio, ROE — are folded in so a pure-momentum spike does not carry a pick on its own.',
          'Results are cached so a /recommend during market hours answers immediately instead of triggering a full recompute.',
        ],
      },
      {
        heading: 'Deployment',
        body: 'Both services run on a DigitalOcean Linux VPS wrapped in systemd units, so they restart on crash and come back after a reboot without anyone logging in. That is the difference between a project that works on my machine and one that is still answering commands a month later.',
      },
    ],
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
      'An embedded C++ application on an Arduino that performs programmed musical notes. There is no audio library underneath it: note sequences are turned into sound by generating pulse-width-modulation signals directly, so every pitch and duration is a timing problem solved in software.',
    status: 'Complete — built on breadboard, then soldered',
    details: [
      {
        heading: 'Sound with no audio library',
        body: 'A pitch is just a square wave at the right frequency, so each note becomes a half-period delay driving a pin high and low. Duration is a count of those cycles rather than a wall-clock timer, which means tempo and pitch are the same calculation viewed from two directions. Getting a scale in tune came down to accounting for the overhead of the loop itself, not just the delay inside it.',
      },
      {
        heading: 'The hardware half',
        bullets: [
          'Designed the supporting circuitry rather than buying a shield for it.',
          'Prototyped on breadboard, then soldered the components down to a permanent board.',
          'Debugging crossed the line constantly — a wrong note was as likely to be a cold joint as a bad constant.',
        ],
      },
      {
        heading: 'Why it is here',
        body: 'It is the smallest project on this list and the one that taught the most about the layer under the abstraction. Everything else I write sits on a stack that has already solved timing for me.',
      },
    ],
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
    status: 'Released — playable in the browser',
    details: [
      {
        heading: 'Controls',
        bullets: [
          'WASD — move',
          'Left click — shoot',
          'Space — dash',
          'E — possess the shell you are standing next to',
        ],
      },
    ],
    worlds: ['game'],
    tags: ['Game Jam', 'Action', 'Team of 5'],
    techStack: ['Unity', 'C#', 'HTML5'],
    role: 'Gameplay Programmer',
    year: '2026',
    links: [{ label: 'Play on itch.io', url: 'https://joseelizalde02.itch.io/shellscape' }],
    media: [
      /*
        The real build, embedded from itch.io, and first in the list so the
        modal opens on "play" rather than on a screenshot.

        `18748789` is the HTML5 *upload* id, taken from the Run-game iframe on
        the itch page — it is not the game id in the page URL. Click-to-load is
        not a nicety here: a Unity WebGL build is tens of megabytes.
      */
      {
        type: 'embed',
        src: 'https://itch.io/embed-upload/18748789?color=12101c',
        poster: '/assets/shellscape-cover.webp',
        alt: 'Shellscape, playable in the browser',
        action: 'Play Shellscape',
        aspect: '16 / 9',
      },
      { type: 'image', src: '/assets/shellscape-cover.webp', alt: 'Shellscape title screen' },
    ],
    featured: true,
    highlighted: true,
  },
  {
    id: 'jump-the-gun',
    title: 'Jump the Gun',
    tagline: 'A first-person action shooter about a father going after his old mob boss.',
    description:
      'A single-player first-person action shooter in development at UCLA ACM Studio SRS, the student-run studio, where I am Game Director. The narrative follows a father tearing through his former mob boss’s organisation to get his kidnapped daughter back, and the combat is built to match that tone — close, fast and desperate rather than tactical. I lead the design and coordinate implementation across the team, and I wrote the custom physics-based movement controller in C#, replacing Unity’s built-in character controller with hand-written movement and collision logic so the feel is ours rather than the engine’s default. The team works through Git branching and pull requests so several people can land gameplay features in parallel. Still in active development.',
    status: 'In active development at UCLA ACM Studio SRS',
    worlds: ['game'],
    tags: ['Unity', 'FPS', 'Game Direction', 'In development'],
    techStack: ['Unity', 'C#', 'HLSL', 'ShaderLab', 'Git'],
    role: 'Game Director',
    year: '2024',
    links: [{ label: 'GitHub', url: 'https://github.com/SRS-Jump-the-Gun/JumpTheGunUnityBuild' }],
    media: [{ type: 'image', src: '/assets/placeholder-jumpthegun.svg', alt: 'Jump the Gun' }],
    featured: true,
  },
]

/** Projects for a given world. The Engineer console is `swe`-only by design. */
export const projectsForWorld = (world: 'game' | 'swe') =>
  projects.filter((p) => p.worlds.includes(world) || p.worlds.includes('both'))
