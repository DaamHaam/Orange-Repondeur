import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoSlug = 'Orange-Repondeur';
const base = process.env.VITE_BASE ?? `/${repoSlug}/`;

export default defineConfig({
  plugins: [react()],
  base,
});
