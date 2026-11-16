import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import studioApiPlugin from './server/vitePlugin.mjs'

const publicDirs = ['cards', 'custom-frames', 'dua-posters', 'frames', 'hero', 'islamic-calligraphy', 'rooms', 'studio-previews', 'icons.svg', 'favicon.svg'];
const assetPathRegex = new RegExp(`(['"\`])\\/(${publicDirs.map(d => d.replace('.', '\\.')).join('|')})([\\/'"\`])`, 'g');

function publicAssetBasePlugin(base) {
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  return {
    name: 'public-asset-base',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('node_modules') && /\.(jsx?|tsx?)$/.test(id)) {
        if (assetPathRegex.test(code)) {
          assetPathRegex.lastIndex = 0;
          return {
            code: code.replace(assetPathRegex, (match, p1, p2, p3) => p1 + normalizedBase + p2 + (p3 === '/' ? '/' : p3)),
            map: null
          };
        }
      }
      return null;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: '/Bisen-One-Point/',
  plugins: [
    publicAssetBasePlugin('/Bisen-One-Point/'),
    react(),
    studioApiPlugin()
  ],
  server: { fs: { deny: ['.env', '.env.*', '**/.git/**', '**/.studio-data/**', '**/master.key', '**/*.sqlite*'] } },
})
