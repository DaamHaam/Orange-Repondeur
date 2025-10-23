import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexPath = resolve(distDir, 'index.html');
const fallbackPath = resolve(distDir, '404.html');

async function createFallback() {
  try {
    await fs.access(indexPath);
  } catch (error) {
    console.error('Impossible de créer 404.html : le fichier dist/index.html est introuvable.');
    process.exitCode = 1;
    return;
  }

  try {
    await fs.copyFile(indexPath, fallbackPath);
    console.log('Fichier 404.html créé à partir de dist/index.html (fallback SPA).');
  } catch (error) {
    console.error('La création du fallback 404.html a échoué :', error);
    process.exitCode = 1;
  }
}

createFallback();
