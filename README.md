# Portfolio — two-world WebGL site

Jose Elizalde's portfolio: a landing page and two switchable "worlds", built to
the spec in [`portfolio_website_spec.md`](./portfolio_website_spec.md).

- **Intro** — a dark room with a single white door. Press **E** (or click) to
  open it and walk through. Shows once per session; always skippable, and
  skipped automatically with reduced motion or without WebGL.
- **Landing** — where you arrive. Full About Me, then two doors. Deliberately
  static: no 3D, no particles, so the reading is calm.
- **Game World** — a possession arena. You drive a shell-less rover around a
  neon grid and press **E** to take over the shells holding each project, in a
  nod to Shellscape. A scrolling list view is always one click away, and is the
  default on touch, with reduced motion, or without WebGL. Shows **game
  development** work.
- **Engineer World** — an interactive console. You navigate it by typing
  commands (`help`, `projects`, `open 1`, `about`, `contact`…) or by clicking
  the command buttons under the prompt (which fill the prompt — you still press
  Enter). Shows **software engineering** work only.

Both worlds read the same `src/data`, but they are genuinely different
interfaces, and the `worlds` tag on each item decides which one it appears in.

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
| `src/data/experience.ts` | Work, research, education |
| `src/data/skills.ts` | Skill groups and 0–1 proficiency levels |
| `src/data/site.ts` | Title, meta description, canonical URL, OG image |

### Which world does an item show up in?

Every project, experience entry and skill has a `worlds` array:

| `worlds` value | Appears in |
|---|---|
| `['game']` | Game World only |
| `['swe']` | Engineer console only |
| `['both']` | Both |

This is the entire mechanism behind the split, so set it deliberately.

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
  worlds: ['game'],              // 'game' | 'swe' | 'both' — decides the world
  tags: ['Unity', 'Multiplayer'],
  techStack: ['Unity', 'C#'],
  role: 'Solo',
  year: '2025',
  links: [{ label: 'GitHub', url: 'https://github.com/…' }],
  media: [{ type: 'image', src: '/assets/my-shot.webp', alt: 'Gameplay' }],
  status: 'Released',            // optional; shown under the title
  details: [                     // optional long form — see below
    { heading: 'How it works', bullets: ['…'] },
  ],
  featured: true,                // featured cards span two grid columns
}
```

Then drop the referenced media into `public/assets/`.

`details` is the depth. `description` is the summary paragraph; each `details`
section becomes a heading plus a paragraph and/or a bullet list, rendered
identically by the project modal, the arena's shell panel and the Engineer
console's `open <project>`. **Making a project more verbose is always a data
edit here — never a component change.**

### Adding screenshots, video and playable builds

Every project's `media` array is a gallery: the modal shows arrows when there is
more than one item, and item **0 is what you see first**. Put the best thing
first.

**1. Capture.** Screenshots at 1920×1080; video as `.mp4` (H.264 + AAC), 10–25
seconds, no sound needed.

**2. Convert and compress** — everything in `public/assets/` ships to every
visitor, so nothing goes in raw:

```bash
# Screenshot → 1600×900 webp, letterboxed rather than cropped
magick shot.png -resize 1600x900 -background "#0b0a12" \
  -gravity center -extent 1600x900 -quality 84 public/assets/myproject-01.webp

# Screen recording → a web-sized mp4 (aim for under ~4 MB)
ffmpeg -i raw.mov -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 26 \
  -preset slow -movflags +faststart -an public/assets/myproject.mp4

# A poster frame for that video, so the modal is not a black box
ffmpeg -i public/assets/myproject.mp4 -vframes 1 -q:v 3 poster.jpg
magick poster.jpg -resize 1600x900 -quality 84 public/assets/myproject-poster.webp
```

**3. Reference them** in the project's `media` array:

```ts
media: [
  { type: 'image', src: '/assets/myproject-01.webp', alt: 'The first room' },
  { type: 'video', src: '/assets/myproject.mp4',
    poster: '/assets/myproject-poster.webp', alt: 'Two minutes of play' },
]
```

`alt` is not optional in practice — it is what a screen reader announces, and
the a11y pass in the spec depends on it. Delete the matching
`placeholder-*.svg` once a project has real media.

Media types:

| type | fields | notes |
|---|---|---|
| `image` | `src`, `alt` | webp or png. 16:9 — the frame is `object-cover`. |
| `video` | `src`, `poster`, `alt` | `preload="metadata"`, so only the header is fetched up front. |
| `embed` | `src`, `poster`, `action`, `aspect` | A third-party iframe. **Not loaded until the visitor presses play.** |
| `webgl` | `glb` | Orbitable model viewer, lazy-loaded with three.js. Compress with [`gltf-transform`](https://gltf-transform.dev/). |

### Embedding a playable itch.io build

Shellscape is wired up this way already; the same three steps work for any
HTML5 game on itch.io.

**1. Allow embedding.** On itch: *Edit game → Uploads*, confirm the HTML5 file
has "This file will be played in the browser" ticked, and under *Embed options*
choose **Embed in page** with a fixed viewport size. A game set to "click to
launch in fullscreen" cannot be embedded on another site.

**2. Find the upload id.** It is *not* the number in the game's URL. Open the
game page and pull it out of the Run-game iframe:

```bash
curl -s https://YOURNAME.itch.io/YOURGAME | grep -o 'html/[0-9]*'
# html/18748789   <- that number
```

(Or: right-click the game page → Inspect → search the HTML for
`html-classic.itch.zone/html/`.)

**3. Add it as `embed` media**, first in the array so the modal opens on the
play button:

```ts
{
  type: 'embed',
  src: 'https://itch.io/embed-upload/18748789?color=12101c',
  poster: '/assets/shellscape-cover.webp',  // shown before it loads
  alt: 'Shellscape, playable in the browser',
  action: 'Play Shellscape',                // button copy
  aspect: '16 / 9',                         // match the game's canvas
}
```

`ProjectEmbed` keeps the `<iframe>` out of the DOM until the play button is
pressed, and unmounting the panel unmounts the iframe — which is what actually
stops the game's audio and frame loop. **Do not "simplify" that into an
always-mounted iframe**: a Unity WebGL build is tens of megabytes and would
otherwise download for every visitor who only opened the write-up.

`?color=` is the loader's background; match the site's `bg` token so the frame
does not flash white.

### How to add a console command

Append one entry to `commands` in `src/lib/console-commands.ts`:

```ts
{
  name: 'talks',
  aliases: ['speaking'],
  help: 'Talks I have given',
  run: () => ({ lines: [{ kind: 'heading', text: 'Talks' }, /* … */] }),
}
```

`help`, Tab completion and the click-to-run button bar pick it up automatically.
Return `ConsoleLine` records rather than raw strings so the output stays real
DOM (headings, lists, links) for screen readers. Side effects like clearing the
screen go in `effect`, not in `run`.

### How to add a paper

Append to `src/data/publications.ts` and drop the PDF in `public/assets/`:

```ts
{
  id: 'chi26-beyond-riding',
  title: '…',
  authors: ['Jane Hsieh', 'Jose Elizalde', /* … in printed order */],
  venue: 'CHI 2026 — ACM Conference on Human Factors in Computing Systems',
  year: '2026',
  abstract: 'A readable paragraph, not the paper's own abstract verbatim.',
  pdf: '/assets/paper-chi26-beyond-riding.pdf',   // hosted here, not hotlinked
  doi: 'https://doi.org/10.1145/…',               // optional
  contribution: 'What I actually did — this is a portfolio, not a bibliography.',
  experienceId: 'cmu-reuse',   // optional; prints the link inside `experience`
  worlds: ['swe'],
}
```

It then appears in three places automatically: the landing's "Published
research" block (world-neutral, like the Resume button), the console's `papers`
command, and — if `experienceId` matches — inside `experience` under the
position it came out of. `paper <n>` opens one in a new tab the way `resume`
does.

Host the PDF rather than linking a conference site, so the link survives that
site being reorganised. Compress a large one first:

```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=public/assets/paper-x.pdf raw.pdf
```

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

The site is a static SPA. `npm run build` writes `dist/`; there is no server
and nothing to keep running, so "up 24/7" is a property of the CDN it sits on
rather than of anything in this repo.

The canonical origin is **https://joseelizalde.dev**, hard-coded in four
places that must be changed together: `index.html` (canonical, `og:*`,
JSON-LD), `src/data/site.ts`, `public/robots.txt` and `public/sitemap.xml`.

Configs for both hosts are committed:

- **Vercel** — `vercel.json`: `vite` preset, SPA rewrite, cache headers.
- **Netlify** — `netlify.toml`: SPA redirect, Node 20, cache headers.

### The two asset directories

`dist/` has two of them and they are cached very differently:

| Path | Contents | `Cache-Control` |
|---|---|---|
| `/build/*` | Vite output; every filename carries a content hash | `max-age=31536000, immutable` |
| `/assets/*` | Hand-authored files — `resume.pdf`, the papers, `og-cover.png`, project media | `max-age=86400, must-revalidate` |

`build.assetsDir` in `vite.config.ts` is what keeps them apart. **Do not point
Vite's output back at `/assets`**: the two would share one cache rule, and
replacing `resume.pdf` in place would leave the old one in visitors' browsers
for a year. Changing `assetsDir` means changing both host configs with it.

### First deploy

1. Register `joseelizalde.dev`. It is a Google-registry TLD on the HSTS preload
   list, so it is **HTTPS-only in every browser** — there is no http:// fallback
   to fall back to, and a host that cannot issue a certificate will look
   completely offline rather than merely insecure.
2. Import the repo on Vercel or Netlify. Both read the committed config, so no
   build settings need entering, and both handle a private repo on the free
   tier. Every push to `main` redeploys.
3. Add the domain in the host's dashboard and point DNS at it — an `A`/`ALIAS`
   for the apex plus a `CNAME` for `www`, per whatever the host prints. The
   certificate is issued automatically.
4. Set the apex as primary and redirect `www` to it, so there is one canonical
   origin and the `og:url` matches what people actually land on.

### After it is live

- Check the link preview with the Facebook Sharing Debugger and X's Card
  Validator. `og-cover.png` is a PNG on purpose — an SVG card is silently
  dropped by X, LinkedIn, Discord and iMessage.
- Submit `https://joseelizalde.dev/sitemap.xml` in Google Search Console.
- `public/assets/resume.pdf` is already in place — replace the file to update
  it, or set `resumeUrl: undefined` in `src/data/profile.ts` to hide the resume
  buttons.

## Decisions taken from the spec's open questions (§14)

| Question | Decision |
|---|---|
| Game centrepiece controls | Both — WASD/arrow steering *and* pointer drag, with idle auto-drift and momentum |
| SSG vs SPA | Static SPA with a hand-written HTML fallback; §9 says this is fine for a personal portfolio |
| Projects | Real work: Shellscape and Jump the Gun (game), DailyCodeforce, Robinhood Portfolio Bot and KurtCobot (software) |
| Engineer world | Rebuilt as a typed console per the owner's brief, replacing the spec's scrolling-sections version |
| Media | Generated SVG placeholders in `public/assets` — swap in real screenshots at the same paths |
| Custom domain | `joseelizalde.dev`, set in `index.html`, `src/data/site.ts`, `public/robots.txt` and `public/sitemap.xml` |
