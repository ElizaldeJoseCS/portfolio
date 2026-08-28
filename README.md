# Portfolio — two-world WebGL site

An interactive, single-page portfolio built to the spec in
[`portfolio_website_spec.md`](./portfolio_website_spec.md). The same content is
presented through two switchable "worlds":

- **Game World** — neon grid, emissive low-poly props, and a driveable
  centrepiece you can steer with WASD/arrows or by dragging.
- **Engineer World** — a live terminal panel, a hoverable network graph of the
  tech stack, and instanced micro-charts for skill levels.

Both worlds render the *same* React components from the *same* data. Only the
theme tokens, the section order, and the 3D scene differ.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
npm run lint     # ESLint, zero warnings allowed
npm run analyze  # build + write dist/stats.html bundle report
```

Node 20.19+ is required (Vite 5).

## Editing content — start here

**All copy lives in `src/data/`. No component hardcodes portfolio text.**
Everything marked `TODO(owner)` is placeholder content that should be replaced
before launch.

| File | What it holds |
|---|---|
| `src/data/profile.ts` | Name, tagline, bio, roles, location, email, socials, resume link |
| `src/data/projects.ts` | Every project (see below) |
| `src/data/experience.ts` | Work, internships, education |
| `src/data/skills.ts` | Skill groups and 0–1 proficiency levels |
| `src/data/site.ts` | Title, meta description, canonical URL, OG image |

The shapes are defined and documented in `src/types.ts`; TypeScript will tell
you if a field is missing or misspelled.

### How to add a project

Append an object to the array in `src/data/projects.ts`:

```ts
{
  id: 'my-project',              // unique, kebab-case; used as the React key
  title: 'My Project',
  tagline: 'One line that fits on a card.',
  description: 'The long version, shown in the modal.',
  worlds: ['game'],              // 'game' | 'swe' | 'both' — drives filtering
  tags: ['Unity', 'Multiplayer'],
  techStack: ['Unity', 'C#'],
  role: 'Solo',
  year: '2025',
  links: [{ label: 'GitHub', url: 'https://github.com/…' }],
  media: [{ type: 'image', src: '/assets/my-shot.png', alt: 'Gameplay' }],
  featured: true,                // featured cards span two grid columns
}
```

Then drop the referenced media into `public/assets/`. Notes:

- `media` supports `image`, `video` (any browser-playable file), and `webgl`
  (`{ type: 'webgl', glb: '/assets/model.glb' }`, rendered in an orbitable
  viewer that is lazy-loaded only when such a project is opened).
- `alt` is required in practice for images — it is what screen readers read.
- Compress any `.glb` with
  [`gltf-transform`](https://gltf-transform.dev/) before committing it.

### Other content touch points

Three places intentionally duplicate a little copy and must be updated by hand
when the profile changes:

1. `index.html` — the static SEO fallback, the meta tags, and the JSON-LD
   `Person` block. This is what crawlers and no-JS visitors see.
2. `public/robots.txt` and `public/sitemap.xml` — the domain.
3. `src/data/site.ts` — must agree with `index.html`.

## Architecture

```
src/
├── App.tsx              # WorldProvider + shell; lazy-mounts the 3D canvas
├── types.ts             # every content + theme interface
├── data/                # ALL portfolio content
├── lib/
│   ├── theme.ts         # per-world design tokens → CSS custom properties
│   ├── world-context.tsx# world state, useTheme(), quality, reduced motion
│   └── cn.ts            # Tailwind class merge
├── worlds/              # GameWorld / EngineerWorld: order + chrome only
├── components/          # the shared, world-agnostic DOM sections
├── scene/               # everything inside <Canvas>
│   ├── SceneContainer.tsx
│   ├── GameScene.tsx / EngineerScene.tsx
│   ├── HeroParticles.tsx
│   └── materials/       # hand-written GLSL
└── hooks/               # WebGL detection, reduced motion, in-view, fps, tier
```

### Theming

`src/lib/theme.ts` is the only file that knows a colour value. It writes the
active world's palette onto `:root` as `--c-*` custom properties, and
`tailwind.config.js` maps every Tailwind colour utility onto those properties.
So `bg-accent` is correct in both worlds automatically, and components should
never branch on `world` to pick a colour — call `useTheme()` instead.

### Performance

- A device tier (`high` / `low`) is detected from pointer type, viewport,
  `hardwareConcurrency`, `deviceMemory`, and `prefers-reduced-motion`. It caps
  DPR, halves the particle count, and disables post-processing on `low`.
- drei's `PerformanceMonitor` degrades the tier automatically if sustained FPS
  drops, and restores it if things recover. A manual override is persisted to
  `localStorage`.
- Press **Shift+F** (or load `?fps=1`) for an FPS / tier overlay.
- `three`, `drei`, and `postprocessing` are behind `React.lazy` boundaries, so
  the DOM content paints before the WebGL stack is fetched.

### Accessibility

- All meaningful text is DOM, never baked into the canvas; the canvas itself is
  `aria-hidden`.
- Full keyboard support including a focus-trapped, Escape-closable project
  modal that restores focus on close.
- `prefers-reduced-motion` is honoured in JS (springs collapse, scene motion
  freezes, the render loop drops to on-demand) and in CSS as a backstop.
- Skip link, semantic landmarks, `aria-labelledby` on every section, and 44px
  minimum touch targets.

## Deployment

Static output in `dist/`. Configs for both hosts are committed:

- **Vercel** — `vercel.json` (framework preset `vite`, immutable asset caching).
- **Netlify** — `netlify.toml` (SPA redirect, Node 20, asset caching).

Before going live, replace `https://example.com` in `index.html`,
`src/data/site.ts`, `public/robots.txt`, and `public/sitemap.xml` with the real
domain, and add `public/assets/resume.pdf` (or set `resumeUrl: undefined` in
`src/data/profile.ts` to hide the resume buttons).

## Decisions taken from the spec's open questions (§14)

| Question | Decision |
|---|---|
| Game centrepiece controls | Both — WASD/arrow steering *and* pointer drag, with idle auto-drift and momentum |
| SSG vs SPA | Static SPA with a hand-written HTML fallback; §9 says this is fine for a personal portfolio |
| Projects | 8 placeholders, weighted toward game dev, with the real SWE Internship Tracker included |
| Media | Generated SVG placeholders in `public/assets`, sized for real screenshots |
| Custom domain / resume | Left as `example.com` / `/assets/resume.pdf`; both marked `TODO(owner)` |
