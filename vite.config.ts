import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/mount.tsx',
      formats: ['es'],
      fileName: () => 'mount.js',
    },
    rollupOptions: {
      // ⚠️ DO NOT MODIFY THIS EXTERNAL LIST.
      // These dependencies are provided by the Sampark shell at runtime.
      // Bundling them will (1) balloon your bundle size and
      // (2) cause React hook errors from duplicate React instances.
      // The validate-bundle.mjs script will fail your build if you do.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@harisumiran/platform',
        '@harisumiran/ui',
      ],
    },
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
  },
});
