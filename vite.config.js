import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const repoSlug = 'Orange-Repondeur';

const ensureTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`);

const normalizeBase = (rawBase) => {
  const trimmed = rawBase.trim();

  if (trimmed === '' || trimmed === '.') {
    return '/';
  }

  if (trimmed.startsWith('.')) {
    return ensureTrailingSlash(trimmed);
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return ensureTrailingSlash(withLeadingSlash);
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseFromEnv = env.VITE_BASE || `/${repoSlug}/`;
  const normalizedBase = normalizeBase(baseFromEnv);

  return {
    plugins: [react()],
    base: normalizedBase,
  };
});
