import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
  },
  server: {
    port: 3000,
  },
})
