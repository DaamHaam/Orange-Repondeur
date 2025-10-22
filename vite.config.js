import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoSlug = 'Orange-Repondeur';

const resolveBase = () => {
  if (process.env.VITE_BASE) {
    return process.env.VITE_BASE;
  }

  const isGitHubPagesBuild =
    process.env.GITHUB_PAGES === 'true' ||
    (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY?.endsWith(`/${repoSlug}`));

  if (isGitHubPagesBuild) {
    return `/${repoSlug}/`;
  }

  return './';
};

export default defineConfig({
  plugins: [react()],
  base: resolveBase(),
});
