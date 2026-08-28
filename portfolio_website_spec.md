# Portfolio Website — Detailed Engineering Spec

> **For an AI agent (or human dev) to build.** This spec is intentionally
> prescriptive so a generator can produce a working, high-quality result without
> asking many follow-up questions. Where a decision is left open, an option is
> marked **[CHOOSE]** / **TODO** — pick one and stay consistent.

---

## 0. TL;DR / One-sentence summary

Build a single-page, hardware-accelerated (WebGL) portfolio site in
TypeScript + Three.js that presents the author as **both a game developer and a
software engineer**, as **two distinct visual "worlds"** the visitor toggles
between.

---

## 1. Product Overview

### 1.1 What it is
A personal portfolio website that is not a wall of text. It's an interactive 3D
experience:

- **Landing / hero**: an immersive 3D scene that immediately demonstrates
  hardware acceleration (particles, animated geometry, custom shader, live
  lighting).
- **Two interchangeable "worlds"**:
  1. **The Game World** — themed around game dev (low-poly, emissive neon,
     playable-feeling micro-interactions, a small WebGL "game" element such as a
     movable character/camera you can nudge).
  2. **The Engineer World** — themed around software (terminal, code editor,
     network graph, data visualization, floating tiles with syntax coloring).
- Both worlds expose the **same content** (projects, experience, skills,
  about, contact) but **restyle + re-layout** it so it feels like a different
  product.
- Content is **interactive**: projects open into detail modals/drawer with
  tech stacks, links, and (optionally) embedded images/videos/WebGL demos.
- Runs at a smooth 60fps on a mid-range laptop and degrades gracefully on
  mobile and low-power devices.

### 1.2 Goals (non-terminal)
- Communicate two parallel identities: game developer + software engineer.
- Look visually stunning and performant (hardware accelerated).
- Fast first paint, SEO-friendly fallback for users without WebGL.
- Easy for a non-dev (the owner) to update content (data-driven).

### 1.3 Non-goals
- NOT a CMS with auth/admin panels. Content lives in a single data file.
- NOT a full game engine project — "game" element is a showcase micro-scene.
- No backend, no login. Static/JAMstack only.

---

## 2. Tech Stack (locked)

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript (strict)** | Type safety across big 3D + data codebases |
| Framework | **React 18 + Vite** | Fast HMR, best React-Three-Fiber ecosystem |
| 3D | **Three.js via @react-three/fiber (R3F) + @react-three/drei** | Declarative, battle-tested, hardware-accelerated WebGL |
| Animations (DOM + orchestrator) | **framer-motion** | Springs for buttery UI transitions |
| Shaders | **GLSL** custom via R3F `<shaderMaterial>` | Full control for hero effects |
| Styling | **Tailwind CSS** (utility) + CSS custom properties | Fast, consistent theming per "world" |
| Routing | **Single page, no router** — world toggle swaps a top-level component | Simplest for a 3D scene over the whole viewport |
| Build/deploy | **Vite → static; deploy on Vercel or Netlify** | Perfect for 3D-heavy SPA |
| SEO/fallback | Pre-computed static HTML shell + `<noscript>` + WebGL check | Graceful degradation |
| Linting | ESLint + Prettier | Consistency |

### 2.1 Key dependencies (pin in `package.json`)
```
react, react-dom, three, @react-three/fiber, @react-three/drei,
framer-motion, tailwindcss, typescript, vite
```

### 2.2 Why React-Three-Fiber
It lets you write 3D scenes declaratively (like JSX) and co-locate them with DOM
UI. DOM overlays (menus, project cards) can live in the same React tree as the
WebGL canvas, making the "two worlds" pattern trivially achievable.

---

## 3. Architecture

### 3.1 High-level file structure
```
portfolio/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx                 # entry
│   ├── App.tsx                  # top-level: world toggle + scene mount
│   ├── data/
│   │   ├── profile.ts           # name, tagline, bio, roles
│   │   ├── projects.ts          # ALL projects (typed), tagged game/swe
│   │   ├── experience.ts        # work/education timeline entries
│   │   ├── skills.ts            # skills grouped into categories
│   │   └── type definitions in types.ts
│   ├── types.ts                 # shared interfaces (Project, Role, etc.)
│   ├── worlds/
│   │   ├── GameWorld.tsx        # Game World layout + theme
│   │   ├── EngineerWorld.tsx    # Engineer World layout + theme
│   │   └── sharedWorldSections.tsx  # reused content components
│   ├── scene/
│   │   ├── SceneContainer.tsx   # R3F <Canvas> wrapper, handles resize/quality
│   │   ├── GameScene.tsx        # 3D scene for Game World
│   │   ├── EngineerScene.tsx    # 3D scene for Engineer World
│   │   ├── materials/           # shader materials (GLSL)
│   │   │   ├── heroParticleShader.ts
│   │   │   ├── terminalShader.ts
│   │   │   └── ...
│   │   ├── assets/              # glTF/GLB, textures, fonts
│   │   └── useAutoRotate.ts, useFpsCap.ts, etc. (hooks)
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── ProjectSection.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── ExperienceTimeline.tsx
│   │   ├── SkillsCloud.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── NavBar.tsx
│   │   ├── WorldSwitcher.tsx   # the "Game / Engineer" toggle button
│   │   ├── Footer.tsx
│   │   └── ui/  (Button, Section, Card, Chip, Tooltip primitives)
│   ├── hooks/
│   │   ├── useIsWebglSupported.ts
│   │   ├── usePrefersReducedMotion.ts
│   │   ├── useIsMobile.ts
│   │   ├── useIsInView.ts
│   │   └── useFps.ts
│   ├── lib/
│   │   ├── theme.ts            # per-world color/font/motion tokens
│   │   └── cn.ts               # tailwind class merge helper
│   ├── styles/
│   │   └── globals.css
│   └── components/vendored/    # any hand-tuned shader/effect components
└── public/assets/              # static media (images, videos, models)
```

### 3.2 Data-driven content (CRITICAL)
All portfolio content (name, bio, projects, experience, skills, social links)
MUST live in `src/data/*.ts` files as typed constants. **No hardcoded content in
components.** This lets the owner edit projects/experience without touching
component code.

```ts
// src/types.ts
export type WorldTag = "game" | "swe" | "both";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;          // long-form for modal
  worlds: WorldTag[];           // which world(s) it appears in
  tags: string[];               // e.g. ["Unity", "C#", "Multiplayer"]
  techStack: string[];
  role: string;                 // "Solo", "Lead Engineer", "Contributor"
  year: string;
  links: { label: string; url: string }[];   // GitHub, Itch, Live, Trailer
  media: { type: "image" | "video" | "webgl"; src?: string; glb?: string }[];
  featured: boolean;            // show big on hero
  highlighted?: boolean;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location?: string;
  start: string;                // "2023-06"
  end: string | "Present";
  kind: "work" | "internship" | "education";
  description: string[];
  skills: string[];
  worlds: WorldTag[];
  url?: string;
}

export interface SkillGroup {
  category: string;
  items: { name: string; level?: number; worlds?: WorldTag[] }[];
}

export interface Profile {
  name: string;
  firstName: string;
  tagline: string;
  bio: string[];
  roles: string[];              // e.g. ["Game Developer", "Software Engineer"]
  location: string;
  email: string;
  socials: { label: string; url: string; icon?: string }[];
  resumeUrl?: string;
}
```

---

## 4. The Two-Worlds Pattern (core differentiator)

### 4.1 Concept
A single global state `world: "game" | "engineer"`. Flipping it:
1. Triggers a **crossfade/transition** between two 3D scenes in `<Canvas>`.
2. Swaps a **theme token set** (colors, fonts, motion curves, ambient light).
3. Re-renders the **DOM overlay** (same sections, different styling/layout).

The content is identical; the presentation differs so strongly it feels like
two sites.

### 4.2 Implementation approach
- `App.tsx` holds `useState<World>` and passes it down.
- `SceneContainer` renders `<Canvas>` once; inside it renders either
  `<GameScene>` or `<EngineerScene>` based on `world`, wrapped in a crossfade
  (e.g. `<Transition>` with opacity/scale or a shader-driven "portal" wipe).
- `theme.ts` returns tokens based on `world`:

```ts
export interface Theme {
  name: World;
  accent: string;          // primary interactive color
  accentAlt: string;
  bg: string;             // CSS background fallback
  fg: string;
  muted: string;
  fontDisplay: string;
  fontBody: string;
  motionSpring: { type: "spring"; stiffness: number; damping: number };
  preserveDarkLight: false; // always dark, per-world tint
}
```

- All DOM components consume tokens via a `useTheme()` context hook rather than
  reading `world` directly, so styling stays centralized.

### 4.3 Guidance
- Keep both worlds' visuals coherent in *feel* (both premium), differing in
  *theme* and *metaphor*.
- The **world switcher** must be prominent, always accessible (sticky nav), and
  show a clear animated state shift — this is the signature interaction.

---

## 5. Scene & Rendering Spec (hardware acceleration)

### 5.1 `<Canvas>` configuration
```tsx
<Canvas
  dpr={[1, 2]}
  gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
  camera={{ position: [0, 0, 8], fov: 60 }}
>
  <SceneContainer />
</Canvas>
```
- `dpr={[1,2]}` caps pixel ratio (perf on retina).
- Full-viewport fixed canvas behind the DOM overlay; DOM is transparent so the
  3D shows through.

### 5.2 Adaptive quality / performance budget
- Detect device tier (mobile vs desktop, `navigator.hardwareConcurrency`,
  `deviceMemory`, reduced-motion preference).
- Two presets: **high** (full effects, shadows) and **low** (fewer particles,
  no shadows, lower dpr). Auto-select, allow manual override.
- Use `PerformanceMonitor` (from drei) to auto-lower quality if FPS drops
  below ~45 for a sustained period; raise back if it recovers.
- **Terminal=true**: `useFrame` work loops should avoid allocations; prefer
  pre-allocated buffers/typed arrays for particles.

### 5.3 Hero particle system (signature effect)
- A `Points` cloud of **2,000–5,000** vertices drifting via a custom
  `onBeforeCompile` or `<shaderMaterial>`.
- GLSL: `uniform float uTime;` — position = base + noise offset; color ramps across
  the world's accent palette; size attenuates with distance; additive blending.
- Reacts subtly to pointer movement (uniform `uMouse` parallax) and to world
  switch (re-orients / recolors via lerp of uniforms).
- Include a `<Preload all />` to avoid pop-in.

### 5.4 GameScene specifics
- Low-poly isometric-style terrain tiles or a planet, floating game assets.
- **Interactive centerpiece** (the "wow"): a controllable element — e.g. a
  character/robot you can steer with WASD/arrow keys, or a camera orbit you can
  grab-and-throw (Inertia). Implement with `useFrame` reading input map; add a
  subtle trail of emissive particles behind it.
- Emissive + neon materials via drei `<MeshDistortMaterial>` / `<MeshWobbleMaterial>`
  for living surfaces.
- A light "grid floor" shader or `<Grid>` from drei for the classic game feel.
- [OPTIONAL, stretch] Skybox gradient or starfield `Points` for depth.

### 5.5 EngineerScene specifics
- **Terminal / editor metaphor**: floating monospace panels with animated
  typing effect (`useTypewriter`-style), syntax-highlighted code snippets, a
  blinking cursor using a custom shader.
- **Network graph**: nodes (tech stack / projects) connected by lines; nodes
  gently pulse; hovering a node highlights neighbors (mouse raycast + hover).
  Implement with `<Line>` from drei or raw `THREE.LineSegments` + `useFrame`
  updates to positions.
- Clean geometry: rounded boxes, capsules, thin wireframe accents; **low-poly
  but precise**, like an IDE aesthetic.
- Data-viz feel: bar/sparkline micro-charts as instanced meshes for skills.

### 5.6 Lights & post-processing
- Use `<Environment>` from drei (a small HDR) for realistic reflections on
  metals/glass, plus one key directional light + fill.
- Post-processing (**@react-three/postprocessing**):
  - **Bloom** (additive glow) — the "stunning" factor; keep strength modest to
    avoid washout.
  - **Vignette**.
  - Optionally a chromatic-aberration only during world transitions (fade out
    when idle).
- **Performance warning**: disable post-processing on low tier.

### 5.7 Asset pipeline
- Prefer **procedural geometry** (no big model downloads) to keep the site
  light. If glTF models are used: compress with `gltf-transform` (Draco/meshopt)
  and lazy-load via `<Suspense>` + drei `<useGLTF>`.
- All assets sized aggressively; the 3D scene should load `<1MB` of media
  ideally.

---

## 6. UI / UX / Section Spec

All sections work in **both worlds** (restyled). DOM overlay scrolls normally
over the fixed 3D canvas — a proven pattern (portfolio-esque).

### 6.1 Navigation
- Sticky top nav: site monogram, section anchors, **world switcher**, and
  "Resume" button.
- Smooth-scroll to anchors (CSS `scroll-behavior` + JS offset for sticky nav).
- Mobile: hamburger → full-screen menu overlay with the world toggle.

### 6.2 Hero
- Big name + animated tagline (word/letter stagger reveal).
- Rotating role line: "Game Developer ⇄ Software Engineer" with a crossfade.
- Prominent **"Enter the Game World" / "Enter the Engineer World"** CTA that
  triggers the world switch (confirms the two-world metaphor immediately).
- Scroll-down indicator.

### 6.3 Projects
- **Featured projects** as large bento-style cards; rest in a responsive grid.
- Card: thumbnail/video, title, tagline, tags, role, year, world badge.
- Click opens a **ProjectModal** (framer-motion `AnimatePresence`) with:
  - long description, tech stack chips, role, year, media gallery
    (image carousel / embedded video / optional WebGL demo), links.
  - Modal content is styled per current world.
- **Filters**: All / Game Dev / Software by `worlds` tag; animated re-layout.

### 6.4 Experience (timeline)
- Vertical timeline with alternating sides (desktop) / single column (mobile).
- Each entry: role, company, date range, bullets, skills chips. Animated on
  scroll into view.

### 6.5 Skills
- Grouped chips (Languages, Game Engines/Tools, Frontend, Backend, Cloud, etc.)
- Optional animation: skill nodes in the EngineerScene network graph, or a
  marquee of chips in the Game world.

### 6.6 About
- Photo/avatar, bio paragraphs, location, interests, "what I do today".
- Education included here or in timeline.

### 6.7 Contact / Footer
- Email CTA, social links, resume download, "Built with React Three Fiber" note.
- Footer with monogram + copyright.

### 6.8 Motion guidelines
- Use **framer-motion** springs (not CSS transitions) for layout/opacity.
- **Respect `prefers-reduced-motion`**: swap animations for simple fades, and
  disable the 3D scene's auto-motion (keep static but present).
- Keep every transition `< 600ms`; UI transitions ~150–250ms.
- Intersection-observer-based reveal animations (fade+rise) as default.

---

## 7. Mobile & Responsiveness
- 3D scene scales down; on mobile prioritize **auto-rotating showcase** rather
  than active steering (or provide simple touch-drag orbit).
- Reduce particle count, disable post-processing bloom, cap dpr on low tier.
- Test at 360px width; nav collapses to menu; grids become single column.
- Ensure touch targets ≥ 44px.

---

## 8. Accessibility (a11y)
- Full keyboard navigation (tab through all cards/modals, focus states).
- Semantic HTML: `<main>`, `<section aria-labelledby>`, headings hierarchy,
  `<nav>`, `<footer>`.
- `aria-label`s on the world switcher and icon-only buttons.
- Color contrast ≥ 4.5:1 for text; don't rely on color alone.
- **Text is HTML/DOM, not baked into canvas** — screen readers must read
  content. Keep all meaningful text in the DOM overlay.
- `prefers-reduced-motion` honored (see 6.8).

---

## 9. SEO & Fallback (graceful degradation)
- `index.html` contains a **static, fully-readable HTML fallback** listing name,
  tagline, and key sections (so no-WebGL / crawlers see content).
- Detect WebGL support on mount; if unavailable → hide canvas, show a styled
  static version (the DOM content still fully works without the 3D scene).
- Add meta description, OpenGraph/Twitter cards, structured data
  (`Person` / `ProfilePage` via JSON-LD).
- Vite injects real meta tags; consider `vite-plugin-ssr` or `vite-react-ssg` for
  pre-render if SEO is a top priority. **[CHOOSE]**: static SPA is fine for a
  personal portfolio; add SSG only if the owner cares about SEO crawl depth.

---

## 10. Performance Budgets & Metrics
Targets (Lighthouse on a mid desktop):
- **LCP**: reactive by design (3D canvas + hero). Rationalize: target
  `<2.5s` for text/hero DOM visibility; 3D can continue loading.
- **FPS**: 60 on desktop high-tier; ≥30 on mobile low-tier.
- **JS bundle**: < 250 kB gzipped (React + R3F + Three~150–180 kB); lazy-load
  modal media and non-critical sections.
- **Initial load**: preconnect to CDN, code-split per section with `React.lazy`
  + `<Suspense>`, aggressive asset compression.
- Use `vite-plugin-compression` (gzip/brotli) and `visualize` for bundle audit.

---

## 11. Content Requirements (data to gather — owner provides)
The owner should fill `src/data/` before launch:
- **Profile**: name, tagline, bio, roles, location, email, socials.
- **Projects**: for each — title, tagline, description, world tags, tech stack,
  role, year, links (Live/GitHub/Itch/trailer), media (screenshot/video/glb).
  *(Suggest 6–10 projects, balanced or weighted toward game dev.)*
- **Experience**: work + internships + education with dates + bullets + skills.
  *(Include the SWE internship data already built for the tracker — e.g. the
  SWE Internship Tracker project itself is a strong SWE showcase.)*
- **Skills**: grouped (Languages, Engines, Frontend, Backend, Cloud, Tools).
- **Contact**: email + social URLs + resume PDF (copy to `public/assets`).

---

## 12. Build Order (recommended implementation sequence)

1. **Skeleton**: Vite + TS + Tailwind + React-R3F canvas with a single colored
   scene; deployable empty site.
2. **Data layer**: types + all `src/data/` files wired through typed props
   (static, no 3D yet).
3. **DOM UI** (no 3D): nav, hero, projects, timeline, skills, about, contact,
   modal — fully responsive + a11y, styled with the default (game) theme.
4. **R3F canvas + hero particle scene** behind the DOM; verify perf/quality
   switching; add bloom + vignette.
5. **GameScene** full: interactive centerpiece + neon + grid + particle trail.
6. **EngineerScene** full: terminal typing + network graph + data-viz.
7. **Two-World pattern**: theme tokens context, world state, world switcher,
   crossfade transition between scenes + DOM restyle. This is the biggest feature.
8. **Motion polish**: framer-motion springs, scroll reveals, modal/transition
   animation, reduced-motion handling.
9. **Mobile tuning + perf**: tier presets, particle/effect culling, touch orbit.
10. **SEO/fallback + meta + structured data**, WebGL detect fallback.
11. **Accessibility pass**, Lighthouse audit, fix regressions.
12. **Content final fill + asset compression**, deploy to Vercel/Netlify.

---

## 13. Acceptance Criteria (done means…)
- [ ] `npm run dev` shows the full experience with both worlds toggleable.
- [ ] World switch preserves scroll position where sensible and crossfades both
      3D scene and DOM theme within ~400ms.
- [ ] Hero particle scene runs at ≥45fps on a mid-range laptop (checked via
      `useFps` overlay); auto-degrades on mobile.
- [ ] GameScene has at least one keyboard/touch-interactive element.
- [ ] EngineerScene has terminal-typing + network-graph elements.
- [ ] All content comes from `src/data/` (no hardcoded text in components).
- [ ] Project modal opens/closes smoothly and shows per-project links/media.
- [ ] `prefers-reduced-motion` disables heavy animation.
- [ ] No-WebGL + `<noscript>` show readable static content.
- [ ] Lighthouse: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 90, Best Practice ≥ 90.
- [ ] Responsive at 360px and works with keyboard only.
- [ ] Linting passes (`npm run lint`), bundle ≤250 kB gzipped JS.
- [ ] Deployed to Vercel/Netlify with a custom domain attached.

---

## 14. Open Decisions for the Owner (resolve before build)
1. **Projects count & mix** — provide the final list (aim 6–10).
2. **Game "centerpiece" control scheme** — keyboard steering vs drag-orbit vs
   auto-rotate. **[Recommended: drag-orbit + WASD both]**
3. **SSG vs SPA** — decide SEO importance (§9).
4. **Custom domain** — which one (e.g. `yourname.dev`).
5. **Resume** — supply PDF or omit.
6. **Placeholder vs real media** — build with placeholder art now, swap real
   screenshots/trailers later.

---

## 15. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| 3D too heavy for mobile | Tier presets, dpr cap, disable post-FX, auto-detect |
| Two-world scope creep | Keep worlds sharing the same data + section components; only theming + scene differ |
| WebGL unsupported | Static DOM fallback + `<noscript>`; site fully usable without 3D |
| Three.js bundle size | Lazy-load scene/world bundles, tree-shake drei imports |
| Model/asset bloat | Procedural geometry, gltf-transform compression, lazy loading |
| Motion sickness / motion pref | Respect `prefers-reduced-motion`; keep camera drift gentle |
| Content edits require dev | Data-driven `src/data/` files; document "how to add a project" |

---

## 16. Out of Scope (this version)
- Backend, auth, CMS, admin UI.
- Multi-page routing / separate URLs per world (unless requested).
- Blog.
- Full-game-level interaction depth (a portfolio micro-demo, not a game).
- Internationalization.
```
```

---

### Handoff notes for the AI agent
- The owner's real identity/exact projects are **not** in this spec; the agent
  should scaffold using realistic **placeholder** content in `src/data/` and
  clearly mark where real content goes.
- The **SWE Internship Tracker** (Google Sheets dashboard, ~1170 roles deduped
  across SimplifyJobs/Zapply/Greenhouse/Lever) is a strong real SWE project to
  feature — use it as one of the sample project entries.
- Preserve the exact directory/component contract in §3.1 and types in §3.2 so
  the generated code is predictable.
