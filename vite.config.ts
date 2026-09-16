import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
})
