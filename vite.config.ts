import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';

// TODO: replace with your app's real Firebase Hosting site URLs (see firebase.json).
const BASE_URLS: Record<string, string> = {
  production: 'https://your-team-app.web.app/',
  qa: 'https://qa-your-team-app.web.app/',
  development: 'https://dev-your-team-app.web.app/',
};

export function devLoadBundlePlugin(): Plugin {
  return {
    name: 'dev-load-bundle',
    configureServer(server) {
      server.middlewares.use('/loadBundle', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ bundleUrl: 'http://localhost:4000/src/mount.tsx' }));
      });
    },
  };
}

export default defineConfig(({ mode, command }) => ({
  base: command === 'serve' ? '/' : (BASE_URLS[mode] ?? '/'),
  plugins: [react(), cssInjectedByJs(), ...(command === 'serve' ? [devLoadBundlePlugin()] : [])],
  server: {
    port: 4000,
    open: true,
  },
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
}));
