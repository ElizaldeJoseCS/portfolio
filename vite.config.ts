import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { PAGES } from './src/lib/nav'
import { siteMeta } from './src/data/site'

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Swap the head tags that differ per page. Everything else is shared. */
function withMeta(shell: string, title: string, description: string, url: string) {
  const t = escapeAttr(title)
  const d = escapeAttr(description)
  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${d}$2`)
}

/**
 * Emit a real HTML file for every route, plus a 404.
 *
 * This is a single-page app, but it does not have to be a single *file*. Both
 * hosts serve `/about` from `about.html` off the filesystem, so shipping one
 * file per route means routing does not depend on a host rewrite rule at all —
 * which is what had been silently broken (see CLAUDE.md, "Hosting").
 *
 * It also fixes the SPA's real SEO weakness: `SiteShell` sets the title and
 * description from an effect, so a crawler that does not run JS previously saw
 * index.html's generic pair on every route. Now each file ships with its own.
 *
 * `404.html` gets a Vercel/Netlify-served 404 *with the correct status code*,
 * which a catch-all rewrite to index.html cannot do — that returns 200 for
 * pages that do not exist.
 */
function staticRoutes(): Plugin {
  return {
    name: 'static-routes',
    apply: 'build',
    // `writeBundle`, not `closeBundle`: the compression plugin runs its own
    // closeBundle, and writing first means these files get gzipped too.
    writeBundle(options) {
      const outDir = options.dir ?? fileURLToPath(new URL('./dist', import.meta.url))
      const indexPath = `${outDir}/index.html`
      const shell = readFileSync(indexPath, 'utf8')

      for (const page of PAGES) {
        if (page.path === '/') continue
        const name = page.path.replace(/^\//, '')
        writeFileSync(
          `${outDir}/${name}.html`,
          withMeta(shell, page.title, page.description, `${siteMeta.url}${page.path}`),
        )
      }

      writeFileSync(
        `${outDir}/404.html`,
        withMeta(
          shell,
          'Not found — Jose Elizalde',
          'That page does not exist on this site.',
          siteMeta.url,
        ),
      )
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    staticRoutes(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    // `npm run analyze` writes dist/stats.html for the bundle audit in spec §10.
    ...(process.env.ANALYZE
      ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })]
      : []),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    /*
      Vite's hashed output goes to /build, not /assets.

      `public/assets` holds hand-authored files whose names never change —
      resume.pdf, the papers, the OG card. Those used to land in the same
      directory as the hashed bundles, so the one `Cache-Control: immutable`
      rule the hosts apply to /assets covered both: replacing a resume in place
      would have left the old one in browser caches for a year.

      Split by directory and each gets the header it should have. Changing this
      back means fixing netlify.toml and vercel.json at the same time.
    */
    assetsDir: 'build',
    rollupOptions: {
      output: {
        /*
          One vendor group. This used to also name a `motion` chunk and
          deliberately leave three/drei/postprocessing unnamed so they stayed
          in the lazy chunks their dynamic imports created; all four of those
          packages are gone, and what is left is React plus the router, which
          every page needs on first paint anyway.
        */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/') ||
            id.includes('/react-router') ||
            id.includes('/@remix-run/')
          )
            return 'react'
        },
      },
    },
  },
})
