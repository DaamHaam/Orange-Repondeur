# Orange Répondeur

Application Vite + React utilisée pour consulter et gérer les messages issus du répondeur Supabase.

## Mettre à jour l'application sans casser la publication GitHub Pages

La publication automatique GitHub Pages repose désormais sur deux éléments synchronisés :

1. **Le `base` de Vite** défini dans `vite.config.js` est forcé à `./`. Les chemins générés sont donc relatifs et restent valides, que la build soit publiée à la racine (`/Orange-Repondeur/`), dans `/beta/` ou dans les dossiers de prévisualisation.
2. **Le fallback SPA `404.html`** copié automatiquement à partir de `index.html` pendant le post-build pour permettre l'ouverture directe d'URL profondes sur GitHub Pages.

Pour éviter toute régression lors d'une mise à jour :

1. **Installer les dépendances**
   ```bash
   npm install
   ```
2. **Tester localement** en lançant Vite avec l'hôte ouvert pour vérifier le rendu avant publication.
   ```bash
   npm run dev -- --host
   ```
3. **Vérifier la compilation** pour s'assurer que la build utilisée par GitHub Pages reste fonctionnelle. Le script `postbuild` génère automatiquement `dist/404.html` à partir de `dist/index.html`.
   ```bash
   npm run build
   ```
4. **Commiter les sources uniquement** : GitHub Pages reconstruira le site à partir du dépôt, il est inutile de versionner le contenu du dossier `dist`.
5. **Mettre à jour le numéro de version** en synchronisant `package.json` et l'étiquette affichée dans l'application (`src/App.jsx`) pour suivre les évolutions déployées.

Le `vite.config.js` n'emploie plus de variable d'environnement pour la base : GitHub Pages est compatible avec les chemins relatifs et la même build fonctionne quel que soit le sous-dossier cible. Les workflows GitHub Actions peuvent donc se contenter de lancer `npm run build` avant de publier `dist/` à l'endroit souhaité.

## Scripts utiles
- `npm run dev` : lance le serveur de développement Vite.
- `npm run build` : génère la version optimisée pour la production.
- `npm run preview` : sert la build de production en local.
- `npm run lint` : vérifie la qualité du code avec ESLint.

## Prérequis
- Node.js 18 ou version supérieure.
- Accès au projet Supabase configuré dans `src/services/supabaseClient.js` (variables d'environnement côté build).
