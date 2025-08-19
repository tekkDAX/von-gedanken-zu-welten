import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Use BASE_PATH env (e.g., '/werkstatt/') for GitHub Pages; defaults to '/'
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
})
