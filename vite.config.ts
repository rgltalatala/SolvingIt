import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // cubing.js scramble/search uses module workers; required for any remaining cubing imports.
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2022',
  },
});
