import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Static files in `public/` are copied verbatim, so they never pass through
 * Vite's transform pipeline. This plugin injects the site URL from `.env`
 * (VITE_SITE_URL) into them instead, both in dev (on the fly) and in the
 * production build (after copy).
 *
 * Set VITE_SITE_URL in `.env` (see `.env.example`). When it is missing — e.g.
 * local dev — it falls back to http://localhost:3000. Trailing slashes are
 * stripped so templates can append `/path` safely.
 */
const SITE_URL_TOKEN = '__SITE_URL__'
const PUBLIC_FILES = ['llms.txt', 'instructions.md']

function resolveSiteUrl(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '')
  const candidate = env.VITE_SITE_URL || 'http://localhost:3000'
  return candidate.replace(/\/+$/, '')
}

function siteUrlPlugin(siteUrl: string): Plugin {
  const render = (file: string) =>
    readFileSync(resolve(process.cwd(), 'public', file), 'utf8').split(SITE_URL_TOKEN).join(siteUrl)

  return {
    name: 'clementine-site-url',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = req.url?.split('?')[0].replace(/^\//, '')
        if (!file || !PUBLIC_FILES.includes(file)) return next()
        res.setHeader('Content-Type', file.endsWith('.txt') ? 'text/plain; charset=utf-8' : 'text/markdown; charset=utf-8')
        res.end(render(file))
      })
    },
    closeBundle() {
      const outDir = resolve(process.cwd(), 'dist')
      for (const file of PUBLIC_FILES) {
        const path = resolve(outDir, file)
        writeFileSync(path, readFileSync(path, 'utf8').split(SITE_URL_TOKEN).join(siteUrl))
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const siteUrl = resolveSiteUrl(mode)

  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    // @ffmpeg/ffmpeg creates its worker with `new Worker(new URL('./worker.js',
    // import.meta.url))`. If Vite pre-bundles it into node_modules/.vite/deps,
    // the relative worker URL points at the deps folder and breaks with:
    // "The file does not exist at .../.vite/deps/worker.js?worker_file".
    // Excluding it keeps the package in node_modules so Vite can resolve and
    // bundle the worker itself.
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    worker: {
      format: 'es',
    },
    build: {
      target: 'esnext',
    },
    server: {
      port: 3000,
      // Cross-origin isolation enables SharedArrayBuffer, which lets the
      // multithreaded ffmpeg core run. Without these headers the app falls back
      // to the single-threaded core automatically.
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  }
})
