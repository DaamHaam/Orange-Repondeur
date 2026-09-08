import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoSlug = 'Orange-Repondeur';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || `/${repoSlug}/`,
});
