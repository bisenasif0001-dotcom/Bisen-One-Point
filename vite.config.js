import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import studioApiPlugin from './server/vitePlugin.mjs'

// Some public image folders share a name with React Router routes.
const publicImagePath = /(['"`])\/((?:cards|custom-frames|dua-posters|frames|hero|islamic-calligraphy|rooms|studio-previews)\/[^'"`\r\n?#]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#][^'"`\r\n]*)?|favicon\.(?:svg|png)|logo(?:-[a-z]+)?\.png|icons\.svg)\1/g;
const base = process.env.VITE_BASE || '/';

function publicAssetBasePlugin(base) {
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  return {
    name: 'public-asset-base',
    enforce: 'pre',
    transform(code, id) {
      if (normalizedBase === '/' || id.includes('node_modules') || !/\.(jsx?|tsx?)$/.test(id)) return null;
      const transformed = code.replace(publicImagePath, `$1${normalizedBase}$2$1`);
      return transformed === code ? null : { code: transformed, map: null };
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    publicAssetBasePlugin(base),
    react(),
    studioApiPlugin()
  ],
  server: { fs: { deny: ['.env', '.env.*', '**/.git/**', '**/.studio-data/**', '**/master.key', '**/*.sqlite*'] } },
})
