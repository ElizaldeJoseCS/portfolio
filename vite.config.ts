import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
