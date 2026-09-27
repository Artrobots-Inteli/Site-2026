import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pages = ['index', 'index-en', 'membros', 'membros-en', 'membro', 'membro-en'];
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
    rollupOptions: { input: Object.fromEntries(pages.map(page => [page, resolve(__dirname, `${page}.html`)])) },
  },
});
