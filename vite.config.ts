import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

import { createServiceWorkerSource } from './src/shared/lib/pwa/service-worker-source'

const serviceWorkerPlugin = (): Plugin => ({
  name: 'daily-list-service-worker',
  apply: 'build',
  generateBundle(_options, bundle) {
    const buildAssets = Object.keys(bundle)
      .filter((fileName) => /\.(?:css|js|svg|png|jpe?g|webp|woff2?)$/.test(fileName))
      .map((fileName) => `/${fileName}`)
    const precacheUrls = ['/', '/index.html', '/favicon.svg', '/logo.svg', ...buildAssets]

    this.emitFile({ type: 'asset', fileName: 'sw.js', source: createServiceWorkerSource(precacheUrls) })
  },
})

export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
