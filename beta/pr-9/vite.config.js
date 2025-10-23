import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoSlug = 'Orange-Repondeur';
const ensureTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`);
const resolvedBase = process.env.VITE_BASE
  ? ensureTrailingSlash(process.env.VITE_BASE)
  : `/${repoSlug}/`;

export default defineConfig({
  plugins: [react()],
  base: resolvedBase,
});
