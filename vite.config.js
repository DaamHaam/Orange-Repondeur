import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Les chemins relatifs garantissent que la build fonctionne quel que soit le sous-répertoire GitHub Pages.
  base: './',
});
