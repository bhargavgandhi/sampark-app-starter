import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJs()],
  define: {
    // Required: React checks process.env.NODE_ENV at runtime but process is
    // undefined in blob-URL ESM contexts. Inline the value at build time.
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/mount.tsx',
      formats: ['es'],
      fileName: () => 'mount.js',
    },
    rollupOptions: {
      // Bundle everything in. The Sampark shell loads micro-apps via blob URLs,
      // which cannot resolve bare module specifiers like 'react/jsx-runtime'.
      external: [],
    },
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
  },
});
