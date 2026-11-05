import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import studioApiPlugin from './server/vitePlugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), studioApiPlugin()],
  server: { fs: { deny: ['.env', '.env.*', '**/.git/**', '**/.studio-data/**', '**/master.key', '**/*.sqlite*'] } },
})
