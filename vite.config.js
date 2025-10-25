import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBasePath = '/Orange-Repondeur/';

export default defineConfig(({ command }) => {
  const isDevServer = command === 'serve';

  return {
    plugins: [react()],
    base: isDevServer ? '/' : process.env.VITE_BASE ?? repoBasePath,
  };
});
