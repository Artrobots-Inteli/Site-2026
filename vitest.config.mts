import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', include: ['tests/react-*.test.ts', 'tests/react-*.test.tsx'], restoreMocks: true, maxWorkers: 3, setupFiles: ['./tests/react-setup.ts'] },
});
