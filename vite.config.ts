import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  base: './',
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
