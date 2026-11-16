import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import studioApiPlugin from './server/vitePlugin.mjs'

const dirRegex = /(['"`])\/(cards|custom-frames|dua-posters|frames|hero|islamic-calligraphy|rooms|studio-previews)\//g;
const fileRegex = /(['"`])\/(favicon\.svg|icons\.svg)(['"`])/g;

function publicAssetBasePlugin(base) {
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  return {
    name: 'public-asset-base',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('node_modules') && /\.(jsx?|tsx?)$/.test(id)) {
        let transformed = code;
        let modified = false;

        if (dirRegex.test(transformed)) {
          dirRegex.lastIndex = 0;
          transformed = transformed.replace(dirRegex, `$1${normalizedBase}$2/`);
          modified = true;
        }

        if (fileRegex.test(transformed)) {
          fileRegex.lastIndex = 0;
          transformed = transformed.replace(fileRegex, `$1${normalizedBase}$2$3`);
          modified = true;
        }

        if (modified) {
          return { code: transformed, map: null };
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
