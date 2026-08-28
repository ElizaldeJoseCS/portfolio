import type { Project } from '@/types'

/**
 * TODO(owner): swap these for the real portfolio (spec §11 suggests 6–10).
 * `media.src` paths point at placeholder art in `public/assets`; replace the
 * files in place and the cards/modals pick them up with no code changes.
 */
export const projects: Project[] = [
  {
    id: 'swe-internship-tracker',
    title: 'SWE Internship Tracker',
    tagline: 'One deduplicated board for ~1,170 roles scraped from five sources.',
    description:
      'A Google Sheets–backed dashboard that pulls software engineering internship postings from SimplifyJobs, Zapply, Greenhouse and Lever, then collapses them into a single deduplicated board. The hard part was never fetching — it was identity: the same role shows up under three company aliases, two ATS URLs and a title that drifts between "SWE Intern" and "Software Engineer Intern, Summer". The pipeline normalises company names against an alias table, hashes on (company, normalised title, location, season), and keeps the earliest-seen posting as canonical while recording every alias URL so nothing is silently dropped. Around 1,170 unique roles survive the collapse from a noticeably larger raw set. A scheduled job re-runs the merge, diffs against the previous snapshot, and annotates rows as new, still-open, or closed so the sheet reads as a live feed rather than a stale export.',
    worlds: ['swe'],
    tags: ['Data Pipeline', 'Automation', 'Dedup'],
    techStack: ['Python', 'Google Sheets API', 'Greenhouse API', 'Lever API', 'Cron'],
    role: 'Solo',
    year: '2025',
    links: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'Write-up', url: 'https://example.com/' },
    ],
    media: [{ type: 'image', src: '/assets/placeholder-tracker.svg', alt: 'Tracker dashboard' }],
    featured: true,
    highlighted: true,
  },
  {
    id: 'neon-drift',
    title: 'Neon Drift',
    tagline: 'A rollback-netcode arcade racer built for four players on bad Wi-Fi.',
    description:
      'A local- and online-multiplayer arcade racer where the whole design brief was "must feel fair at 120ms of jitter". Built on deterministic fixed-step simulation with rollback: inputs are the only thing on the wire, every client simulates forward, and mispredictions re-simulate from the last confirmed frame. Ships with a replay system that falls out of the same determinism for free — the netcode and the replay format are literally the same input log.',
    worlds: ['game'],
    tags: ['Unity', 'Multiplayer', 'Netcode'],
    techStack: ['Unity', 'C#', 'Rollback Netcode', 'Steamworks'],
    role: 'Lead Engineer',
    year: '2024',
    links: [
      { label: 'itch.io', url: 'https://itch.io/' },
      { label: 'Trailer', url: 'https://example.com/' },
    ],
    media: [{ type: 'image', src: '/assets/placeholder-neon.svg', alt: 'Neon Drift gameplay' }],
    featured: true,
  },
  {
    id: 'atlas-observability',
    title: 'Atlas',
    tagline: 'Trace-driven service map that renders 40k spans without dropping a frame.',
    description:
      'An internal observability front end that turns raw OpenTelemetry spans into a navigable service graph. The interesting engineering is in the render path: spans stream in over a websocket, land in a typed ring buffer, and get drawn as instanced geometry so panning across 40,000 spans stays interactive. Layout runs in a worker so the main thread only ever touches transforms.',
    worlds: ['swe'],
    tags: ['Observability', 'Dataviz', 'Performance'],
    techStack: ['TypeScript', 'React', 'WebGL', 'Go', 'OpenTelemetry'],
    role: 'Contributor',
    year: '2024',
    links: [{ label: 'Case study', url: 'https://example.com/' }],
    media: [{ type: 'image', src: '/assets/placeholder-atlas.svg', alt: 'Atlas service graph' }],
    featured: true,
  },
  {
    id: 'tilewright',
    title: 'Tilewright',
    tagline: 'An in-editor level tool that cut designer iteration from minutes to seconds.',
    description:
      'A Unity editor extension for authoring tile-based levels: brush-based painting, rule tiles with autotiling, and a live bake that streams changes into play mode without a domain reload. Built after watching designers lose entire afternoons to the edit → save → reload → walk-to-the-spot loop. The bake step is incremental — only dirty chunks re-serialise — which is what actually bought the speedup.',
    worlds: ['game'],
    tags: ['Tooling', 'Editor', 'Unity'],
    techStack: ['Unity', 'C#', 'UI Toolkit', 'ScriptableObjects'],
    role: 'Solo',
    year: '2023',
    links: [{ label: 'GitHub', url: 'https://github.com/' }],
    media: [{ type: 'image', src: '/assets/placeholder-tile.svg', alt: 'Tilewright editor' }],
    featured: false,
  },
  {
    id: 'shaderbook',
    title: 'Shaderbook',
    tagline: 'A live GLSL playground with hot-reload and a shareable permalink per shader.',
    description:
      'A browser playground for writing fragment shaders with instant compile feedback, uniform scrubbers, and permalinks that encode the whole shader in the URL. Compilation errors map back to the right source line, which sounds trivial until you account for the prelude the editor injects. Used it to teach a shader workshop; it survived thirty people hammering it at once.',
    worlds: ['both'],
    tags: ['GLSL', 'WebGL', 'Education'],
    techStack: ['TypeScript', 'WebGL2', 'Vite', 'CodeMirror'],
    role: 'Solo',
    year: '2023',
    links: [
      { label: 'Live', url: 'https://example.com/' },
      { label: 'GitHub', url: 'https://github.com/' },
    ],
    media: [{ type: 'image', src: '/assets/placeholder-shader.svg', alt: 'Shaderbook editor' }],
    featured: false,
  },
  {
    id: 'signal-mesh',
    title: 'Signal Mesh',
    tagline: 'Self-healing job queue that survived a region outage without losing work.',
    description:
      'A distributed job runner with at-least-once delivery, idempotency keys, and a lease-based ownership model so a dead worker releases its work in seconds rather than hanging a queue. Backpressure is explicit: producers get told to slow down instead of discovering it through timeouts. It sat through a full availability-zone loss during a game jam weekend and replayed cleanly.',
    worlds: ['swe'],
    tags: ['Distributed Systems', 'Backend', 'Reliability'],
    techStack: ['Go', 'PostgreSQL', 'Redis', 'Kubernetes', 'Terraform'],
    role: 'Contributor',
    year: '2023',
    links: [{ label: 'GitHub', url: 'https://github.com/' }],
    media: [{ type: 'image', src: '/assets/placeholder-mesh.svg', alt: 'Signal Mesh topology' }],
    featured: false,
  },
  {
    id: 'lowpoly-forge',
    title: 'Lowpoly Forge',
    tagline: 'Procedural prop generator that spits out game-ready meshes under 400 tris.',
    description:
      'A procedural generator for low-poly set dressing — crates, lamps, foliage, modular walls — with a seed-based parameter space and a hard triangle budget baked into the generator rather than checked afterwards. Exports glTF with the vertex colours already packed, so the props drop into a scene with no material setup. Built the whole thing to stop hand-modelling the same barrel.',
    worlds: ['game'],
    tags: ['Procedural', 'Three.js', 'glTF'],
    techStack: ['TypeScript', 'Three.js', 'glTF', 'Web Workers'],
    role: 'Solo',
    year: '2022',
    links: [{ label: 'Live', url: 'https://example.com/' }],
    media: [{ type: 'image', src: '/assets/placeholder-forge.svg', alt: 'Lowpoly Forge output' }],
    featured: false,
  },
  {
    id: 'inputlab',
    title: 'InputLab',
    tagline: 'Latency harness that measures real click-to-photon time on any web build.',
    description:
      'A measurement rig for web games: a photodiode-style capture path plus an in-page instrumentation layer that timestamps input, simulation, and present, so you can see exactly where the frame went. Turned a lot of "it feels laggy" bug reports into a specific number and a specific stage. Works across both worlds of my work — it started as a game tool and ended up profiling a dashboard.',
    worlds: ['both'],
    tags: ['Performance', 'Instrumentation', 'Tooling'],
    techStack: ['TypeScript', 'Web APIs', 'Rust', 'WASM'],
    role: 'Solo',
    year: '2022',
    links: [{ label: 'GitHub', url: 'https://github.com/' }],
    media: [{ type: 'image', src: '/assets/placeholder-input.svg', alt: 'InputLab timeline' }],
    featured: false,
  },
]
