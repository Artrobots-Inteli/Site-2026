import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './src/data/public-routes.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), {
    name: 'public-club-assets',
    closeBundle() {
      // Copy only public media, domain verification and license notices.
      for (const name of ['assets', 'zohoverify', 'THIRD_PARTY_NOTICES.md']) {
        cpSync(resolve(__dirname, name), resolve(__dirname, 'dist', name), { recursive: true });
      }
    },
  }],
  publicDir: false,
  build: {
    outDir: 'dist',
    assetsDir: '_app',
    rollupOptions: { input: Object.fromEntries(Object.keys(routes).map(file => [file.slice(0, -5), resolve(__dirname, file)])) },
  },
});
