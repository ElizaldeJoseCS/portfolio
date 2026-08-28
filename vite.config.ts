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
    rollupOptions: {
      output: {
        // Only the always-needed vendors get forced groups. three/drei/
        // postprocessing are deliberately left alone so Rollup keeps them in
        // the lazy chunks their dynamic imports create — forcing them into a
        // named chunk pulls the whole WebGL stack onto the critical path.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/'))
            return 'react'
          if (id.includes('framer-motion') || id.includes('/motion-dom/') || id.includes('/motion-utils/'))
            return 'motion'
        },
      },
    },
  },
})
